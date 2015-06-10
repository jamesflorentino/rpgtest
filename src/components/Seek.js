function SeekComponent(x, y, path) {
  this.x = x;
  this.y = y;
  this.path = path;
}

SeekComponent.prototype.next = function() {
  var next = this.path.shift();
  this.x = next.x;
  this.y = next.y;
};


SeekComponent.prototype.name = 'seek';

module.exports = SeekComponent;
