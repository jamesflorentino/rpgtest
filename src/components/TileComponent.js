function TileComponent(tile) {
  this.current = tile;
  this.previous = null;
  this.next = null;
}

TileComponent.prototype.name = 'tile';

module.exports = TileComponent;
