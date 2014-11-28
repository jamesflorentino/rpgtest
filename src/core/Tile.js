function Tile(x, y, wall) {
  this.x = x;
  this.y = y;
  this.wall = !!wall;
  this.f = 0;
  this.g = 0;
  this.h = 0;
}

Tile.prototype.posX = function() {
  return this.WIDTH * this.x;
};

Tile.prototype.posY = function() {
  return this.HEIGHT  * this.y;
};

Tile.prototype.toPosition = function() {
  return { x: this.posX(), y: this.posY() };
};


Tile.prototype.WIDTH = 50;
Tile.prototype.HEIGHT = 50;


module.exports = Tile;
