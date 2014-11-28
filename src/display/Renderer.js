function Renderer(width, height) {
  var canvas = this.canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  var container = document.querySelector('#game');
  container.appendChild(canvas);
  this._layers = {};
  this.stage = new createjs.Stage(canvas);
  createjs.Touch.enable(this.stage);
}

Renderer.prototype.addLayer = function(name) {
  var layer = this._layers[name] = new createjs.Container();
  this.stage.addChild(layer);
  return layer;
};

Renderer.prototype.add = function(sprite, option) {
  var container = this.stage;
  if (typeof sprite === 'string') {
    container = this._layers[sprite];
    sprite = option;
  }
  container.addChild(sprite);
};

Renderer.prototype.getLayer = function(name) {
  return this._layers[name];
};

Renderer.prototype.clearLayers = function() {
  for(var name in this._layers) {
    var layer = this._layers[name];
    if (layer instanceof createjs.Container) {
      layer.removeAllChildren();
    }
  }
};


Renderer.prototype.pressed = function(name, fn) {
  var layer = this.getLayer(name);
  layer.addEventListener('mousedown', fn);
};

Renderer.prototype.clicked = function(name, fn) {
  var layer = this.getLayer(name);
  layer.addEventListener('click', fn);
};

Renderer.prototype.pan = function(target, x, y) {
  var layer;
  if (target instanceof Array) {
    for(var i=0; i<target.length; i++) {
      layer = this._layers[target[i]];
      layer.x = x;
      layer.y = y;
    }
    return;
  }
  layer = this.getLayer(name);
  layer.x = x;
  layer.y = y;
};


Renderer.prototype.update = function() {
  this.stage.update();
  this.onUpdate();
};

Renderer.prototype.onUpdate = function() {
};

module.exports = Renderer;
