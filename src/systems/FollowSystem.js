var Point = require('../core/Point');

module.exports = function FollowSystem(entity, deltaTime) {
  var position = entity.get('position');
  if (!position) { return; }

  var velocity = entity.get('velocity');
  if (!velocity) { return; }

  var direction = entity.get('direction');
  if (!direction) { return; }

  var follow = entity.get('follow');
  if (!follow) { return; }

  var entities = follow.world.entities;
  var leader = follow.target.components;
  var leaderDistance = 81;

  if (position.near(leader.position, leaderDistance  + 10)) {
    entity.setState('idle');
    return;
  }

  entity.setState('walking');

  var tv = leader.velocity.clone();
  tv.scale(-1);
  tv.normalize();
  tv.scale(leaderDistance);
  // tv.scale(100);
  var behind = leader.position.clone();
  behind.offset(tv);

  var force = avoidBlob(entity, entities, leaderDistance);
  behind.add(force);


  if (leader.position.x > position.x) {
    direction.x = 1;
  } else if (leader.position.x < position.x) {
    direction.x = -1;
  }
  if (leader.position.y > position.y) {
    direction.y = 1;
  } else if (leader.position.y < position.y) {
    direction.y = -1;
  }

  var scale = velocity.max * deltaTime;
  var distance = position.distance(behind);
  var length = distance.length();
  distance.normalize(scale);
  velocity.copy(distance);
  position.offset(velocity);
};

function avoidBlob(entity, entities, behindRadius) {
  var myAgent = entity.components;
  var force = new Point();
  var total = 0;
  for(var i=0; i<entities.length; i++) {
    var agent = entities[i].components;
    if (entities[i] !== entity) {
      if (myAgent.position.distance(agent.position).length() <= behindRadius) {
        force.x += agent.position.x - myAgent.position.x;
        force.y += agent.position.y - myAgent.position.y;
        total++;
      }
    }
  }
  if (total) {
    force.x /= total;
    force.y /= total;
    force.scale(-1);
  }

  force.normalize();
  force.scale(100);
  return force;
}
