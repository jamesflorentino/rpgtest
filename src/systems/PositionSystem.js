var Vector = require('../core/Vector');

module.exports = function PositionSystem(e) {
  // This is a positioning system, so we'll need a position component from the entity
  var position = e.get('position');
  if (!position) { return; }

  // check for seeking mechanism
  var seek = e.get('seek');
  if (seek) {
    SeekSystem(e);
  }

  // optional: Just in case a sprite component is supplied, we'll update the position of this as well.
  var sprite = e.get('sprite');
  if (sprite && sprite.object) {
    sprite.object.x = position.x;
    sprite.object.y = position.y;
    sprite.object.scaleX = position.directionX;
  }
};


// SeekSystem is a sub-system in the PositionSystem
// It detects if the entity is currently seeking a tile
function SeekSystem(entity) {
  var seek = entity.get('seek');
  var position = entity.get('position');
  var maxSpeed = 5;

  if (seek.path && seek.path.length) {
    var next = seek.path.shift();
    seek.x = next.x;
    seek.y = next.y;
  }

  // If we're near the target, let's "snap" it and call it a day.
  if (Vector.proximity(position.x, seek.x, maxSpeed) && Vector.proximity(position.y, seek.y, maxSpeed)) {
    if (seek.path) {
      if (seek.path.length) {
        return;
      }
    }
    entity.remove('seek');
  }

  // Set the direction of the position. The conditions are strictly handled so we only change the
  // value of the directions if it needs to be.
  if (seek.x > position.x) {
    position.directionX = 1;
  } else if (seek.x < position.x) {
    position.directionX = -1;
  }
  if (seek.y > position.y) {
    position.directionY = 1;
  } else if (seek.y < position.y) {
    position.directionY = -1;
  }

  // Each axis both have different velocity to enable a smooth seeking movement towards the target
  // To find the value of them, we must get the vector's length. This is done by
  // doing some elementary pytagorean theorem :)
  // Hypotenuse^2 = Opposite^2 / Adjacent^2
  // Hypotenuse = Square root of Opposite^2 with Adjacent^2
  var distanceX = seek.x - position.x;
  var distanceY = seek.y - position.y;
  var length = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));

  // Now that we have the length of the vector, it's time to get the velocity of each axis.
  var velocityX = distanceX / length * maxSpeed;
  var velocityY = distanceY / length * maxSpeed;

  var newX = position.x + velocityX;
  var newY = position.y + velocityY;

  position.x = newX;
  position.y = newY;

}


