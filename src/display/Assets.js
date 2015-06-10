function Assets() {
  this.Shape = Shape;
  this.Graphics = Graphics;
  this.manifest = [];
}

Assets.prototype.loadSpriteSheet = function(id, src) {
  this.manifest.push({ id: id, src: src });
};

Assets.prototype.loadImage = function(id, src) {
  this.manifest.push({ id: id, src: src });
};

Assets.prototype.preload = function() {
  var queue = this.queue = new createjs.LoadQueue();
  queue.addEventListener('complete', this.preloaded.bind(this));
  queue.loadManifest(this.manifest);
};

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

Assets.prototype.createSprite = function(label, sheetId) {
  var frameData = this.get(sheetId);
  var sheet = new createjs.SpriteSheet(frameData);
  var sprite = new createjs.Sprite(sheet);
  sprite.gotoAndPlay(label);
  return sprite;
};

Assets.prototype.createSpriteAnimation = function(id) {
  var frameData = this.get(id);
  var sheet = new createjs.SpriteSheet(frameData);
  var sprite = new createjs.Sprite(sheet);
  return sprite;
};


Assets.prototype.preloaded = function() {
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
