function PositionComponent(x, y) {
  this.x = x;
  this.y = y;
  this.directionX = 1;
  this.directionY = 1;
}

PositionComponent.prototype.name = 'position';

module.exports = PositionComponent;
