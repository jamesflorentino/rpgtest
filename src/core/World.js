var Entity = require('./Entity');

function World() {
  this._entitieIds = {};
  this.entities = [];
  this.systems = [];
}

World.prototype.update = function() {
  for(var i=0; i<this.entities.length; i++) {
    this.updateSystems(this.entities[i]);
  }
};

World.prototype.updateSystems = function(entity) {
  for(var i=0; i<this.systems.length; i++) {
    this.systems[i](entity);
  }
};

World.prototype.createEntity = function() {
  return new Entity();
};

World.prototype.addEntity = function(entity) {
  this._entitieIds[entity.id] = entity;
  this.entities.push(entity);
  return this;
};

World.prototype.removeEntity = function(entity) {
  this.entities.splice(this.entities.indexOf(entity), 1);
  delete this._entitieIds[entity.id];
  return this;
};

World.prototype.addSystem = function(system) {
  this.systems.push(system);
};

module.exports = World;
