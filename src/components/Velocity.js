var Point = require('../core/Point');

function VelocityComponent(x,y) {
  Point.apply(this, arguments);
  this.max = 150;
}

VelocityComponent.prototype = Object.create(Point.prototype);
VelocityComponent.prototype.constructor = VelocityComponent;
VelocityComponent.prototype.name = 'velocity';

module.exports = VelocityComponent;
