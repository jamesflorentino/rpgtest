function FollowComponent(entity, grid, world) {
  this.target = entity;
  this.grid = grid;
  this.world = world;
}

FollowComponent.prototype.name = 'follow';

module.exports = FollowComponent;
