var Tile = require('./Tile');

function Grid() {
  this.columns = 0;
  this.rows = 0;
}

Grid.prototype.load = function(matrix, eachfn) {
  this._matrix = [];
  this.rows = matrix.length;
  for(var y=0; y<matrix.length; y++) {
    this._matrix.push([]);
    this.columns = this.columns > matrix[y].length ? this.columns : matrix[y].length;
    for(var x=0; x<matrix[y].length; x++) {
      var tile = new Tile(x, y, matrix[y][x]);
      this._matrix[y].push(tile);
      if (eachfn) {
        eachfn(tile);
      }
    }
  }
};

Grid.prototype.findPath = function(start, end) {
  var open = [start];
  var closed = [];

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
    var neighbors = this.findNeighbors(current);

    for(i=0; i<neighbors.length; i++) {
      var neighbor = neighbors[i];

      // if the neighbor is already inside the closed list, move on...
      if (closed.indexOf(neighbor) > -1) { continue; }

      // since moving from one adjacent tile is just 1, we add that to the G score,
      // we will find the best tile to move to by the flag `gScoreBest`
      var gScore = current.g + 1;
      var gScoreBest = false;

      // if the neighbor isn't in the open list yet, let's add it
      if (open.indexOf(neighbor) === -1) {
        gScoreBest = true;
        neighbor.h = euclidean(neighbor, end);
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

Grid.prototype.findNeighbors = function(tile) {
  var nodes = [];
  var neighbor;

  // north
  neighbor = this.get(tile.x, tile.y-1);
  if (neighbor) { nodes.push(neighbor); }

  // north-east
  // neighbor = this.get(tile.x+1, tile.y-1);
  // if (neighbor) { nodes.push(neighbor); }

  // north-west
  // neighbor = this.get(tile.x-1, tile.y-1);
  // if (neighbor) { nodes.push(neighbor); }

  // south
  neighbor = this.get(tile.x, tile.y+1);
  if (neighbor) { nodes.push(neighbor); }

  // south-east
  // neighbor = this.get(tile.x+1, tile.y+1);
  // if (neighbor) { nodes.push(neighbor); }

  // south-west
  // neighbor = this.get(tile.x-1, tile.y+1);
  // if (neighbor) { nodes.push(neighbor); }

  // east
  neighbor = this.get(tile.x+1, tile.y);
  if (neighbor) { nodes.push(neighbor); }

  // west
  neighbor = this.get(tile.x-1, tile.y);
  if (neighbor) { nodes.push(neighbor); }

  return nodes;
};

Grid.prototype.getByPosition = function(x, y) {
  var cellX = Math.floor(x / Tile.prototype.WIDTH);
  var cellY = Math.floor(y/ Tile.prototype.HEIGHT);
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
