var Entity = require('../core/Entity');

var PositionComponent = require('../components/PositionComponent');
var VelocityComponent = require('../components/VelocityComponent');
var DirectionComponent = require('../components/DirectionComponent');


module.exports = function CharacterAssemblage() {
  var e = new Entity();
  e.add(new PositionComponent(0,0));
  e.add(new VelocityComponent(0,0));
  e.add(new DirectionComponent(0,0));
  return e;
};
