var Tile = require('./Tile');

function Grid() {
  this.columns = 0;
  this.rows = 0;
}

Grid.prototype.load = function(map, eachfn) {
  this._matrix = [];
  var matrix = map.layout;
  var walls = map.walls;
  this.rows = matrix.length;
  for(var y=0; y<matrix.length; y++) {
    this._matrix.push([]);
    this.columns = this.columns > matrix[y].length ? this.columns : matrix[y].length;
    for(var x=0; x<matrix[y].length; x++) {
      var id = matrix[y][x];
      var tile = new Tile(x, y, walls.indexOf(id) > -1);
      this._matrix[y].push(tile);
      if (eachfn) {
        eachfn(tile);
      }
    }
  }
};

Grid.prototype.findPath = function(start, end,  options) {
  var open = [start];
  var closed = [];
  var heuristics = manhattan;
  var diagonal = options ? options.diagonal : false;

  while(open.length) {

    // find the lowest F score in the open list
    var lowestIndex = 0;
    for(var i=0; i<open.length; i++) {
      if (open[i].f < open[lowestIndex].f) {
        lowestIndex = i;
      }
    }
    var current = open[lowestIndex];

    // if the current is the end, it means we're done ;)
    if (this.isIdentical(current, end)) {
      var result = [];
      var curr = current;
      while(curr.from) {
        result.push(curr);
        var from = curr.from;
        delete curr.from;
        curr = from;
      }
      return result.reverse(); // order by least of F score
    }

    // remove the node from the open list and add it to the closed list
    open.splice(open.indexOf(current), 1);
    closed.push(current);

    // find neighbors
    var neighbors = this.findNeighbors(current, diagonal);

    for(i=0; i<neighbors.length; i++) {
      var neighbor = neighbors[i];

      // if the neighbor is already inside the closed list, move on...
      if (closed.indexOf(neighbor) > -1 || neighbor.wall) { continue; }

      // since moving from one adjacent tile is just 1, we add that to the G score,
      // we will find the best tile to move to by the flag `gScoreBest`
      var gScore = current.g + 1;
      var gScoreBest = false;

      // if the neighbor isn't in the open list yet, let's add it
      if (open.indexOf(neighbor) === -1) {
        gScoreBest = true;
        neighbor.h = heuristics(neighbor, end);
        open.push(neighbor);
      } else if (gScore < neighbor.g) {
        gScoreBest = true;
      }

      if (gScoreBest) {
        neighbor.from = current;
        neighbor.g = gScore;
        neighbor.f = neighbor.h + neighbor.g;
      }
    }
  }
  return [];
};

Grid.prototype.findNeighbors = function(tile, diagonal) {
  var nodes = [];
  var neighbor;

  // north
  neighbor = this.get(tile.x, tile.y-1);
  if (neighbor) { nodes.push(neighbor); }

  // south
  neighbor = this.get(tile.x, tile.y+1);
  if (neighbor) { nodes.push(neighbor); }
  // east
  neighbor = this.get(tile.x+1, tile.y);
  if (neighbor) { nodes.push(neighbor); }

  // west
  neighbor = this.get(tile.x-1, tile.y);
  if (neighbor) { nodes.push(neighbor); }

  if (diagonal) {
    // north-east
    neighbor = this.get(tile.x+1, tile.y-1);
    if (neighbor) { nodes.push(neighbor); }

    // north-west
    neighbor = this.get(tile.x-1, tile.y-1);
    if (neighbor) { nodes.push(neighbor); }

    // south-east
    neighbor = this.get(tile.x+1, tile.y+1);
    if (neighbor) { nodes.push(neighbor); }

    // south-west
    neighbor = this.get(tile.x-1, tile.y+1);
    if (neighbor) { nodes.push(neighbor); }

  }
  return nodes;
};

Grid.prototype.getByPosition = function(x, y) {
  var cellX = Math.floor(x / Tile.prototype.WIDTH);
  var cellY = Math.floor(y/ Tile.prototype.HEIGHT);
  return this.get(cellX, cellY);
};

Grid.prototype.getNearestNeighbor = function(start, end) {
  var neighbors = this.findNeighbors(end);
  var lowestScore = 10000;
  var nearest;
  for(var i=0; i<neighbors.length; i++) {
    var neighbor = neighbors[i];
    var h = euclidean(start, neighbor);
    if (lowestScore > h) {
      lowestScore = h;
      nearest = neighbor;
    }
  }
  return nearest;
};

Grid.prototype.useIsometric = function(width, height) {
  Tile.prototype.WIDTH = width || 64;
  Tile.prototype.HEIGHT = height || 32;
  Tile.prototype.posX = function() {
    return (this.x - this.y) * this.WIDTH * 0.5;
  };
  Tile.prototype.posY = function() {
    return (this.y + this.x) * this.HEIGHT * 0.5;
  };
  this.getByPosition = Grid.getIsometricTile.bind(this);
};

Grid.getIsometricTile = function(posX, posY) {
  var halfWidth = Tile.prototype.WIDTH * 0.5;
  var halfHeight = Tile.prototype.HEIGHT * 0.5;
  // Isometric formula from cell to screen position
  // ----------------------------------------------
  // posX = (cellX - cellY) * (halfWidth);
  // posY = (cellY + cellX) + (halfHeight);
  //
  // Isometric formula from screen to cell position
  // ----------------------------------------------
  // posX / (halfWidth) =  cellX - cellY;
  // cellX = posX / (halfWidth) + cellY;
  //
  // posY / halfHeight = cellX + cellY;
  // cellY = (posY / halfHeight) - cellX;
  //
  // cellX = posX / (halfWidth) + (posY / halfHeight) - cellY
  // cellX * 2 = posX / (halfWidth) + (posY / halfHeight);
  //
  // cellY = (posY / halfHeight) - posX / (halfWidth) + cellY;
  // cellY * 2 = (posY / halfHeight) - posX / (halfWidth);
  //
  // Final Formula
  // -------------
  // cellX = (posX / (halfWidth) + (posY / halfHeight)) / 2;
  // cellY = ((posY / halfHeight) - posX / (halfWidth) / 2);

  var cellX = (posX / halfWidth + posY / halfHeight) / 2;
  var cellY = (posY / halfHeight - posX / halfWidth) / 2;
  cellX = Math.round(cellX);
  cellY = Math.round(cellY);
  return this.get(cellX, cellY);
};


function manhattan(start, end) {
  var dx = Math.abs(end.x - start.x);
  var dy = Math.abs(end.y - start.y);
  return dx + dy;
}

function euclidean(start, end) {
  var dx = Math.abs(end.x - start.x);
  var dy = Math.abs(end.y - start.y);
  return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

Grid.prototype.isIdentical = function(a, b) {
  return a.x === b.x && a.y === b.y;
};

Grid.prototype.get = function(x, y) {
  return this._matrix[y] ? this._matrix[y][x] : null;
};



module.exports = Grid;
