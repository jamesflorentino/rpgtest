var Bounds = require('../core/Bounds');
function BoundsComponent() {
  Bounds.apply(this, arguments);
}

BoundsComponent.prototype = Object.create(Bounds.prototype);
BoundsComponent.prototype.constructor = BoundsComponent;

BoundsComponent.prototype.name = 'bounds';

module.exports = BoundsComponent;
