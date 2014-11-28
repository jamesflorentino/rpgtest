var Point = require('../core/Point');
function DirectionComponent(x,y) {
  Point.call(this, x || 1, y || 1);
}

DirectionComponent.prototype = Object.create(Point.prototype);
DirectionComponent.prototype.constructor = DirectionComponent;
DirectionComponent.prototype.name = 'direction';

module.exports = DirectionComponent;
