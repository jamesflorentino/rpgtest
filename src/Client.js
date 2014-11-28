var Renderer = require('./display/Renderer');
var Assets = require('./display/Assets');
var Ticker = require('./core/Ticker');
var Grid = require('./core/Grid');
var World = require('./core/World');
var Tween = require('./core/Tween');
var Tile = require('./core/Tile');

// Components
var PositionComponent = require('./components/PositionComponent');
var VelocityComponent = require('./components/VelocityComponent');
var DirectionComponent = require('./components/DirectionComponent');
var TileComponent = require('./components/TileComponent');
var SpriteComponent = require('./components/SpriteComponent');
var SeekComponent = require('./components/SeekComponent');
var EnemyComponent = require('./components/EnemyComponent');

// Systems
var PositionSystem = require('./systems/PositionSystem');
var SeekSystem = require('./systems/SeekSystem');
var FollowSystem = require('./systems/FollowSystem');

function Game(options) {
  this.manifest = [];

  // copy properties to instance
  for(var k in options) {
    if (options.hasOwnProperty(k)) {
      this[k] = options[k];
    }
  }
  // Required libs
  this.renderer = new Renderer(options.width, options.height);
  this.ticker = new Ticker({ FPS: this.FPS });
  this.assets = new Assets();
  this.grid = new Grid();
  this.world = new World();

  // Add the sytems that will define the flow of the game.
  this.world.addSystem(SeekSystem);
  this.world.addSystem(FollowSystem);
  this.world.addSystem(PositionSystem);

  // Add the layers of the renderer
  this.renderer.addLayer('base'); // the ground
  this.renderer.addLayer('fringe'); // trees, decorations, etc.
  this.renderer.addLayer('entity'); // items, people, entities
  this.renderer.addLayer('over'); // roofs, overhands, special effects

  this.mapDimmer = this.assets.Shape.create(
    this.assets.Graphics.create()
    .beginFill('black')
    .drawRect(0,0,this.width, this.height)
  );

  // start by preloading the game
  this.assets.load(this.manifest, this.preloaded.bind(this));

}

Game.prototype.groundTile = function(tile, matrixId) {
  var colors = {
    "1": "rgb(200,100,1)",
    "0": "#000"
  };

  var graphics = this.assets.Graphics.create();
  graphics.beginFill(colors[matrixId]);
  if (this.debug) {
    graphics.beginStroke('red');
  }
  graphics.drawRect(0,0,tile.WIDTH, tile.HEIGHT);
  var shape = this.assets.Shape.create(graphics);
  shape.x = tile.posX();
  shape.y = tile.posY();
  return shape;
};

Game.prototype.foregroundElement = function(tile, matrixId) {
  return false;
};

Game.prototype.mapObjectElement = function(assetId) {
  return false;
};

Game.prototype.preloaded = function() {
  this.ready();
};

Game.prototype.loadMap = function(map, entities) {
  // fresh start
  this.renderer.clearLayers();
  this.world.clear();
  this.currentMap = map;
  this.grid.load(map);

  this.loadMapLayout(map);
  this.loadMapObjects(map);
  this.loadMapPortals(map);
  this.loadMapEntities(map);
  this.onLoadMap(map);
};

Game.prototype.loadMapLayout = function(map) {
  // generate the map using the matrix provided by the `map` attribute
  var layout = map.layout || map.grid;
  for(var y=0; y<layout.length; y++) {
    for(var x=0; x<layout[y].length; x++) {
      var id = layout[y][x];
      var tile = this.grid.get(x, y);
      var sprite = this.groundTile(tile, id);
      sprite.x = tile.posX();
      sprite.y = tile.posY();
      this.renderer.add('base', sprite);

      // as entity
      var entityElement = this.foregroundElement(id);
      if (entityElement) {
        entityElement.x = tile.posX();
        entityElement.y = tile.posY();
        this.renderer.add('entity', entityElement);
      }
    }
  }
  this.onLoadMapLayout();
};


Game.prototype.loadMapObjects = function(map) {
  var objects = map.objects || [];
  for(var i=0; i<objects.length; i++) {
    var object = objects[i];
    var sprite = this.mapObjectElement(object[0], object[1], object[2]);
    if (sprite) {
      this.renderer.add('entity', sprite);
    }
  }
  this.onLoadMapObjects();
};

Game.prototype.loadMapPortals = function(map) {
  var portals = map.portals;
  if (!portals) { return; }
  for(var i=0;i<portals.length;i++) {
    var portal = portals[0];
    var tile = this.grid.get(portal[0], portal[1]);
    tile.portal = true;
    this.onLoadMapPortal(tile);
  }
  this.onLoadMapPortals();
};

Game.prototype.loadMapEntities = function(map) {
  var entities = map.entities;
  if (!entities) { return; }
  for(var i=0;i<entities.length;i++) {
    var row = entities[i];
    var attributes = row[0];
    var options = row[1];
    var monster = this.createCharacter({ attributes: attributes });
    this.addCharacter(monster, options);
  }
};

Game.prototype.dimMap = function(instant) {
  var game = this;
  this.mapDimmer.alpha = 0;
  var time = !!instant ? 0 : 500;
  this.disabledControls = true;
  Tween.get(this.mapDimmer)
    .to({ alpha: 1 }, time);
  this.renderer.add(this.mapDimmer);
};

Game.prototype.undimMap = function() {
  var game = this;
  this.mapDimmer.alpha = 1;
  var time = 500;
  Tween.get(this.mapDimmer)
    .to({ alpha: 0 }, time)
    .call(function() {
      game.disabledControls = false;
      game.mapDimmer.parent.removeChild(game.mapDimmer);
    });
  this.renderer.add(this.mapDimmer);
};

Game.prototype.ready = function() {
};

Game.prototype.createCharacter = function(options) {
  var attributes = options.attributes;
  var entity = this.world.createEntity();

  // make sure there's a sprite attribute to prevent unwanted errors
  if (attributes.sprite && attributes.sprite[0]) {
    var sprite = this.createCharacterSprite(attributes.sprite[0]);
    entity.add(new SpriteComponent(attributes.sprite[0], sprite));
  }

  return entity;
};

Game.prototype.createCharacterSprite = function(sheetName) {
  var sprite = this.assets.create('idle', sheetName);
  return sprite;
};

Game.prototype.addCharacter = function(entity, options) {
  var game = this;
  var position = entity.get('position');
  var sprite = entity.get('sprite');

  var tile = this.grid.get(options.tile[0], options.tile[1]);
  entity.add(new PositionComponent(tile.posX(), tile.posY()));
  entity.add(new VelocityComponent());
  entity.add(new DirectionComponent());
  // detect if enemy
  if (options.enemy) {
    entity.add(new EnemyComponent());
  }

  entity.onSetState = function(state) {
    switch(state) {
    case 'idle':
      sprite.play('idle');
      break;
    case 'walking':
      sprite.play('walk');
      break;
    }
    game.onEntitySetState(entity, state);
  };

  // add the sprite to the display list
  if (sprite && sprite.object) {
    this.renderer.add('entity', sprite.object);
    sprite.object.addEventListener('click', function(e) {
      game.clickedEntity(entity);
    });
  }

  this.world.addEntity(entity);
};

Game.prototype.clickedEntity = function(entity) {
};

Game.prototype.moveCharacter = function(entity, x, y) {
  var position = entity.get('position');
  var start = this.grid.getByPosition(position.x, position.y);
  var end = this.grid.getByPosition(x, y);
  if (!end) { return; }
  if (start === end) {
    entity.setState('idle');
    return;
  }
  var path = this.grid.findPath(start, end, { diagonal: true }).map(function(node) {
    return node.toPosition();
  });
  if (path.length) {
    path[path.length-1] = { x: x, y: y };
    entity.add(new SeekComponent(path[0].x, path[0].y,path));
    entity.setState('walking');
  }
};

Game.prototype.focusCharacter = function(entity, options) {
  var self = this;
  var position = entity.get('position');
  if (!position) { return; }
  var target = {
    x: this.width * 0.5 - position.x,
    y: this.height * 0.5 - position.y
  };
  this.pan(target.x, target.y);
};

Game.prototype.pan = function(x, y) {
  this.panX = x;
  this.panY = y;
  this.renderer.pan(['base', 'entity', 'over'], this.panX, this.panY);
};

Game.prototype._start = function() {
  var game = this;
  createjs.Ticker.timingMode = 'raf';
  createjs.Ticker.addEventListener('tick', function() {
    game.world.update(1/60);
    game.renderer.update();
  });
};


Game.prototype.start = function() {
  var game = this;

  function timestamp() {
    return Date.now();
  }

  var now,
  dt   = 0,
  last = timestamp(),
  step = 1/this.FPS;

  function frame() {
    now = timestamp();
    dt = dt + Math.min(1, (now - last) / 1000);
    while(dt > step) {
      dt = dt - step;
      game.world.update(step);
    }
    game.renderer.update(dt);
    last = now;
    window.requestAnimationFrame(frame);
  }
  window.requestAnimationFrame(frame);

  createjs.Ticker.timingMode = 'raf';
  // createjs.Ticker.setFPS(1000/this.FPS);
  // createjs.Ticker.addEventListener('tick', function() {
  //   game.world.update(1/60);
  //   game.renderer.update();
  // });
  // createjs.Ticker.addEventListener('tick', this.renderer.update.bind(this.renderer));
};


Game.prototype.update = function() {
};

//===============================\\
// Events
//===============================//
Game.prototype.onLoadMap = function() {};
Game.prototype.onLoadMapLayout = function() {};
Game.prototype.onLoadMapObjects = function() {};
Game.prototype.onLoadMapPortals = function() {};
Game.prototype.onLoadMapPortal = function() {};
Game.prototype.onEntitySetState = function() {};


module.exports = Game;
