var Point = require('../core/Point');

// SeekSystem is a sub-system in the PositionSystem
// It detects if the entity is currently seeking a tile
module.exports = function SeekSystem(entity, deltaTime) {
  var seek = entity.get('seek');
  if (!seek) { return; }

  var position = entity.get('position');
  if (!position) { return; }

  var velocity = entity.get('velocity');
  if (!velocity) { return; }

  var direction = entity.get('direction');
  if (!direction) { return; }

  if (seek.x > position.x) {
    direction.x = 1;
  } else if (seek.x < position.x) {
    direction.x = -1;
  }
  if (seek.y > position.y) {
    direction.y = 1;
  } else if (seek.y < position.y) {
    direction.y = -1;
  }

  var scale = velocity.max * deltaTime;

  var distance = position.distance(seek);
  var length = distance.length();
  distance.normalize(scale);
  velocity.copy(distance);
  position.offset(velocity);

  if (position.near(seek, scale)) {
    if (seek.path && seek.path.length) {
      seek.next();
      return;
    }
    velocity.x = 0;
    velocity.y = 0;
    entity.remove('seek');
    entity.setState('idle');
  }
};
