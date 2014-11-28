function Assets() {
  this.Shape = Shape;
  this.Graphics = Graphics;
}

Assets.prototype.load = function(manifest, fn) {
  var queue = this.queue = new createjs.LoadQueue();
  queue.addEventListener('complete', fn);
  queue.loadManifest(manifest);
};

Assets.prototype.get = function(name) {
  return this.queue.getResult(name);
};

Assets.prototype.create = function(frame, sheetName, offset) {
  var frameData = this.get(sheetName);
  var spriteSheet = new createjs.SpriteSheet(frameData);
  var sprite = new createjs.Sprite(spriteSheet);
  if (offset) {
    sprite.regX = offset[0];
    sprite.regY = offset[1];
  }
  sprite.gotoAndPlay(frame);
  return sprite;
};


function Shape() {
}

Shape.create = function(g) {
  return new createjs.Shape(g);
};

function Graphics() {
}

Graphics.create = function() {
  return new createjs.Graphics();
};


module.exports = Assets;
