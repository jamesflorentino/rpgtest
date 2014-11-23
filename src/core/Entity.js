function Entity() {
  this.id = Date.now().toString(16) + (Math.random() * 10000).toString(16) + this._id++;
  this.components = {};
}

Entity.prototype.add = function(component) {
  this.components[component.name] = component;
  this.added(component.name);
};

Entity.prototype.get = function(name) {
  return this.components[name];
};

Entity.prototype.remove = function(name) {
  delete this.components[name];
  this.removed(name);
};

Entity.prototype.added = function(name) {
};

Entity.prototype.removed = function(name) {
};


// Events
Entity.prototype.onDestroy = function() {
};

Entity.prototype._id = 0;

module.exports = Entity;
