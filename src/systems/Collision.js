module.exports = function Collision(entity, game) {
  if (!entity.position) { return; }
  if (!entity.bounds) { return; }
  if (!entity.collision) { return; }

  var x = entity.position.x - entity.bounds.x;
  var y = entity.position.y - entity.bounds.y;
  var w = entity.bounds.width;
  var h = entity.bounds.height;

  if (entity.position.x + entity.bounds.x <= 0) {
    entity.velocity.x = 1;
  } else if (entity.position.x - entity.bounds.x >= game.bounds.x + game.bounds.width) {
    entity.velocity.x = -1;
  }


  if (entity.position.y + entity.bounds.y <= 0) {
    entity.velocity.y = 1;
  } else if (entity.position.y  >= game.bounds.y + game.bounds.height) {
    entity.velocity.y = -1;
  }



};
