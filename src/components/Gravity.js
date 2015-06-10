var Point = require('../core/Point');

function GravityComponent(x, y) {
  Point.apply(this, arguments);
}

GravityComponent.prototype = Object.create(Point.prototype);
GravityComponent.prototype.constructor = GravityComponent;
GravityComponent.prototype.name = 'gravity';

module.exports = GravityComponent;
