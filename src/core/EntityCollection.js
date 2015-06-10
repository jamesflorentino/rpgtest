var Entity = require('./Entity');

function EntityCollection() {
  this.list = [];
  this._refs = {};
}

EntityCollection.prototype.add = function(entity) {
  if (entity instanceof Entity) {
    this._refs[entity.id] = entity;
    this.list.push(entity);
    this.added(entity);
  }
  return this;
};

EntityCollection.prototype.remove = function(entity) {
  if (entity instanceof Entity) {
    delete this._refs[entity.id];
    this.list.splice(this.list.indexOf(entity), 1);
    this.removed(entity);
  }
  return this;
};

EntityCollection.prototype.each = function(fn) {
  for(var i=0, total=this.list.length; i<total; i++) {
    fn(this.list[i]);
  }
};

EntityCollection.prototype.create = function() {
  return new Entity();
};

module.exports = EntityCollection;
