function SeekComponent(x, y, path) {
  this.x = x;
  this.y = y;
  this.path = path;
}

SeekComponent.prototype.name = 'seek';

module.exports = SeekComponent;
