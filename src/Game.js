var Assets = require('./display/Assets');
var utils = require('./core/utils');
var Bounds = require('./core/Bounds');
var EntityCollection = require('./core/EntityCollection');
var Renderer = require('./display/Renderer');
var Maps = require('./Maps');
var Input = require('./Input');

var Grid = require('./core/Grid');

function Game(options) {
  utils.extend(this, options);
  this.FPS = this.FPS || 30;

  this.grid = new Grid();
  this.systems = this.systems || [];
  this.entities = new EntityCollection();
  this.bounds = new Bounds(0, 0, this.width, this.height);

  this.assets = new Assets();
  this.renderer = new Renderer(this.width, this.height);
  this.input = new Input();

  this.entities.added = this.addedEntity.bind(this);
  this.assets.preloaded = this.preloaded.bind(this);
  this.renderer.addLayer('tiles');
  this.renderer.addLayer('entities');

  this.preload();
  this.assets.preload();
}

Game.prototype.preloaded = function() {
  this.start();
  this.grid.load(this.map, this.createTile.bind(this));
  this.tick();
  setInterval(this.tick.bind(this), 1000/this.FPS);
};

Game.prototype.tick = function() {
  var game = this;
  this.update();
  this.entities.each(function(e) {
    game.systems.forEach(function(system) {
      system(e, game);
    });
  });
  this.renderer.update();
};

Game.prototype.addedEntity = function(entity) {
  var sprite = entity.get('sprite');
  if (sprite.object) {
    this.renderer.add('entities', sprite.object);
  }
};


//===============================\\
// Events
//===============================//
Game.prototype.preload = function() {};
Game.prototype.start = function() {};
Game.prototype.update = function() {};
Game.prototype.createTile = function(tile) {};

//===============================\\
// Static Classes
//===============================//
Game.Entity = require('./core/Entity');
Game.Maps = Maps;
Game.Tile = require('./core/Tile');

//===============================\\
// Components
//===============================//
Game.components = {};
Game.components.Position = require('./components/Position');
Game.components.Velocity = require('./components/Velocity');
Game.components.Gravity = require('./components/Gravity');
Game.components.Direction = require('./components/Direction');
Game.components.Bounds = require('./components/Bounds');
Game.components.Collision = require('./components/Collision');
Game.components.Sprite = require('./components/Sprite');
//===============================\\
// Assemblages
//===============================//
Game.assemblages = {};
Game.assemblages.Character = function() {
  var e = new Game.Entity();
  e.add(new Game.components.Position());
  e.add(new Game.components.Velocity());
  e.add(new Game.components.Direction());
  e.add(new Game.components.Bounds());
  e.add(new Game.components.Gravity());
  e.add(new Game.components.Collision());
  e.add(new Game.components.Sprite());
  return e;
};
//===============================\\
// Systems
//===============================//
Game.systems = {};
Game.systems.Motion = require('./systems/Motion');
Game.systems.Collision = require('./systems/Collision');

module.exports = Game;
