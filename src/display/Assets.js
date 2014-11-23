function Assets() {
}

Assets.prototype.load = function(manifest, fn) {
  var queue = this.queue = new createjs.LoadQueue();
  queue.addEventListener('complete', fn);
  queue.loadManifest(manifest);
  this.Shape = Shape;
  this.Graphics = Graphics;
};

Assets.prototype.get = function(name) {
  return this.queue.getResult(name);
};

Assets.prototype.create = function(frame, sheetName) {
  var frameData = this.get(sheetName);
  var spriteSheet = new createjs.SpriteSheet(frameData);
  var sprite = new createjs.Sprite(spriteSheet);
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
