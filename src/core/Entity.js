function Entity() {
  this.id = Date.now().toString(16) + (Math.random() * 10000).toString(16) + this._id++;
  this.components = {};
}

Entity.prototype.setState = function(state) {
  if (this.state === state) { return; }
  this.state = state;
  this.onSetState(state);
};

Entity.prototype.add = function(component) {
  this.components[component.name] = component;
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

Entity.prototype.onSetState = function(state) {
};


Entity.prototype._id = 0;

module.exports = Entity;
