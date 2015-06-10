function SystemCollection() {
  this.list = [];
}

SystemCollection.prototype.add = function(system) {
  this.list.push(system);
  return this;
};

SystemCollection.prototype.each = function(fn) {
  for(var i=0, total=this.list.length; i<total; i++) {
    fn(this.list[i]);
  }
};

module.exports = SystemCollection;
