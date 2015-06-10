var EntityCollection = require('./EntityCollection');
var SystemCollection = require('./SystemCollection');

function World() {
  this.entities = new EntityCollection();
  this.systems = new SystemCollection();
}

World.prototype.update = function() {
  var world = this;
  world.entities.each(function(entity) {
    world.systems.each(function(system) {
      system(entity);
    });
  });
};


module.exports = World;
