module.exports = function PositionSystem(e, deltaTime) {
  // This is a positioning system, so we'll need a position component from the entity
  var position = e.get('position');
  if (!position) { return; }
  var velocity = e.get('velocity');
  if (!velocity) { return; }
  position.x += velocity.x;
  position.y += velocity.y;
  // optional: Just in case a sprite component is supplied, we'll update the position of this as well.
  var sprite = e.get('sprite');
  if (sprite && sprite.object) {
    sprite.object.x = position.x;
    sprite.object.y = position.y;
    var direction = e.get('direction');
    if (direction) {
      sprite.object.scaleX = direction.x;
    }
  }
};
