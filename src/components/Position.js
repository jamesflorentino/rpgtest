var Point = require('../core/Point');

function PositionComponent(x, y) {
  Point.apply(this, arguments);
}

PositionComponent.prototype = Object.create(Point.prototype);
PositionComponent.prototype.constructor = PositionComponent;
PositionComponent.prototype.name = 'position';

module.exports = PositionComponent;
