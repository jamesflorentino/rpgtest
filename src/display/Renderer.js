function Renderer(width, height) {
  var canvas = this.canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  var container = document.querySelector('#game');
  container.appendChild(canvas);
  this._layers = {};
  this.stage = new createjs.Stage(canvas);
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

Renderer.prototype.cache = function(name, padding) {
  var layer = this._layers[name];
  padding = padding || 0;
  layer.cache(-padding, -padding, this.canvas.width + padding, this.canvas.height + padding);
};

Renderer.prototype.clicked = function(name, fn) {
  var layer = this._layers[name];
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
  layer = this._layers[name];
  layer.x = x;
  layer.y = y;
};


Renderer.prototype.update = function() {
  this.stage.update();
};

module.exports = Renderer;
