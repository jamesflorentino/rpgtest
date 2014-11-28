var Entity = require('./Entity');

function World() {
  this.clear();
  this.systems = [];
}

World.prototype.clear = function() {
  this._entityIds = {};
  this.entities = [];
};


World.prototype.update = function(deltaTime) {
  for(var i=0; i<this.entities.length; i++) {
    this.updateSystems(this.entities[i], deltaTime);
  }
};

World.prototype.updateSystems = function(entity, deltaTime) {
  for(var i=0; i<this.systems.length; i++) {
    this.systems[i](entity, deltaTime);
  }
};

World.prototype.createEntity = function() {
  return new Entity();
};

World.prototype.addEntity = function(entity) {
  if (this._entityIds[entity.id]) { return; }
  this._entityIds[entity.id] = entity;
  this.entities.push(entity);
  return this;
};

World.prototype.removeEntity = function(entity) {
  this.entities.splice(this.entities.indexOf(entity), 1);
  delete this._entityIds[entity.id];
  return this;
};

World.prototype.addSystem = function(system) {
  this.systems.push(system);
};

module.exports = World;
