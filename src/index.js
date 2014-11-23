var Renderer = require('./display/Renderer');
var Assets = require('./display/Assets');
var Ticker = require('./core/Ticker');
var Grid = require('./core/Grid');
var World = require('./core/World');
var Tile = require('./core/Tile');

// Components
var PositionComponent = require('./components/PositionComponent');
var TileComponent = require('./components/TileComponent');
var SpriteComponent = require('./components/SpriteComponent');
var SeekComponent = require('./components/SeekComponent');

// Systems
var PositionSystem = require('./systems/PositionSystem');

function Game(options) {
  this.manifest = [];
  this.map = [];

  // copy properties to instance
  for(var k in options) {
    if (options.hasOwnProperty(k)) {
      this[k] = options[k];
    }
  }
  // Required libs
  this.renderer = new Renderer(options.width, options.height);
  this.ticker = new Ticker({ FPS: 30 });
  this.assets = new Assets();
  this.grid = new Grid();
  this.world = new World();

  // Add the sytems that will define the flow of the game.
  this.world.addSystem(PositionSystem);

  // Add the layers of the renderer
  this.renderer.addLayer('base'); // the ground
  this.renderer.addLayer('fringe'); // trees, decorations, etc.
  this.renderer.addLayer('entity'); // items, people, monsters
  this.renderer.addLayer('over'); // roofs, overhands, special effects

  // start by preloading the game
  this.assets.load(this.manifest, this.preloaded.bind(this));
}

Game.prototype.groundSprite = function(tile, matrixId) {
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

Game.prototype.preloaded = function() {
  this.generateMap();
};

Game.prototype.generateMap = function(fn) {
  // load the grid into memory using the layout provided in the config
  this.grid.load(this.map);

  // generate the map using the matrix provided by the `map` attribute
  for(var y=0; y<this.map.length; y++) {
    for(var x=0; x<this.map[y].length; x++) {
      var id = this.map[y][x];
      var tile = this.grid.get(x, y);
      var sprite = this.groundSprite(tile, id);
      sprite.x = tile.posX();
      sprite.y = tile.posY();
      if (fn) {
        sprite.addEventListener('click', fn);
      }
      this.renderer.add('base', sprite);
    }
  }

  this.renderer.cache('base', Tile.prototype.WIDTH * 2);
  this.ready();
};

Game.prototype.ready = function() {
};

Game.prototype.createCharacter = function(options) {
  var attributes = options.attributes;
  var entity = this.world.createEntity();
  // add the relevant components
  entity.add(new PositionComponent(options.position[0], options.position[1]));

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

Game.prototype.addCharacter = function(entity) {
  var game = this;
  var position = entity.get('position');
  var sprite = entity.get('sprite');
  // when a component is added
  entity.added = function(name) {
    switch(name) {
    case 'seek':
      sprite.play('walk');
      break;
    }
  };
  // when a comoonent is removed
  entity.removed = function(name) {
    switch(name) {
    case 'seek':
      sprite.play('idle');
      break;
    }
  };

  // position the sprite based on its x and y axes
  if (sprite && sprite.object) {
    this.renderer.add('entity', sprite.object);
    sprite.object.addEventListener('click', function() {
      console.log('yooo');
    });
  }
  this.world.addEntity(entity);
};

Game.prototype.moveCharacter = function(entity, x, y) {
  var position = entity.get('position');
  var start = this.grid.getByPosition(position.x, position.y);
  var end = this.grid.getByPosition(x, y);
  console.log('=', start, end);
  var path = this.grid.findPath(start, end).map(function(node) {
    return node.toPosition();
  });
  entity.add(new SeekComponent(x, y, path));
};

Game.prototype.start = function() {
  this._interval = setInterval(this.run.bind(this), 1000 / this.FPS);
};

Game.prototype.run = function() {
  this.world.update();
  this.renderer.update();
};

// Override the tile to tell if isometric or just plain grid
Tile.prototype.WIDTH = 64;
Tile.prototype.HEIGHT = 32;
Tile.prototype.posX = function() {
  return (this.x - this.y) * this.WIDTH * 0.5;
};
Tile.prototype.posY = function() {
  return (this.y + this.x) * this.HEIGHT * 0.5;
};

new Game({
  debug: true,
  FPS: 40,
  width: 1000,
  height: 500,
  Classes: {
    TEMPLAR: {
      sprite: ['sheet_templar']
    }
  },
  manifest: [
    { id: 'sheet_general', src: '/sprites/sheet_general.json' },
    { id: 'sheet_templar', src: '/sprites/templar-ik.json' },
    { id: 'img_general', src: '/sprites/sheet_general.png' },
    { id: 'img_templar', src: '/sprites/templar-ik.png' }
  ],
  map: [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0]
  ],
  _map: [
    // [0,1,0,0,0,0,0,0,0,0,0,0],
    // [0,0,0,0,0,0,0,0,0,0,0,0],
    // [0,0,0,0,0,0,0,0,0,0,0,0],
    // [0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,1,1,0,1,1,0,1,0,0,0,1,0,1,1,1,1,0,0,0],
    [1,0,0,0,1,0,1,0,1,0,1,0,0,0,1,0,1,0,0,0,0,0,0],
    [1,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,1,1,1,0,0,0,0],
    [1,0,0,0,0,1,0,1,0,0,0,1,0,1,1,0,1,0,0,0,0,0,0],
    [1,1,1,1,0,0,1,0,0,0,0,0,1,0,0,0,1,1,1,1,0,0,0]
  ],
  groundSprite: function(tile, matrixId) {
    var colors = {
      "1": "rgb(200,100,1)",
      "0": "pink"
    };

    var graphics = this.assets.Graphics.create();
    graphics.beginFill(colors[matrixId]);
    if (this.debug) {
      graphics.beginStroke('red');
    }
    graphics.moveTo(0, -tile.HEIGHT * 0.5);
    graphics.lineTo(tile.WIDTH * 0.5, 0);
    graphics.lineTo(0, tile.HEIGHT * 0.5);
    graphics.lineTo(-tile.WIDTH * 0.5, 0);
    graphics.closePath();
    return this.assets.Shape.create(graphics);
  },

  ready: function() {
    var game = this;
    var hero = this.hero = this.createCharacter({
      attributes: this.Classes.TEMPLAR,
      position: [0,0],
      name: 'James'
    });

    this.addCharacter(hero);

    // TEST 1: move character
    // var tile = this.grid.get(0, 0);
    // this.moveCharacter(hero, tile.posX(), tile.posY());

    this.start();

    this.renderer.pan(['base', 'entity'], 150, 150);

    this.renderer.clicked('base', function(e) {
      var localX = e.rawX - e.currentTarget.x;
      var localY = e.rawY - e.currentTarget.y;
      game.moveCharacter(hero, localX, localY);
    });

    this.grid.getByPosition = function(posX, posY) {
      var halfWidth = Tile.prototype.WIDTH * 0.5;
      var halfHeight = Tile.prototype.HEIGHT * 0.5;

      // Isometric formula from cell to screen position
      // ----------------------------------------------
      // posX = (cellX - cellY) * (halfWidth);
      // posY = (cellY + cellX) + (halfHeight);
      //
      // Isometric formula from screen to cell position
      // ----------------------------------------------
      // posX / (halfWidth) =  cellX - cellY;
      // cellX = posX / (halfWidth) + cellY;
      //
      // posY / halfHeight = cellX + cellY;
      // cellY = (posY / halfHeight) - cellX;
      //
      // cellX = posX / (halfWidth) + (posY / halfHeight) - cellY
      // cellX * 2 = posX / (halfWidth) + (posY / halfHeight);
      //
      // cellY = (posY / halfHeight) - posX / (halfWidth) + cellY;
      // cellY * 2 = (posY / halfHeight) - posX / (halfWidth);
      //
      // Final Formula
      // -------------
      // cellX = (posX / (halfWidth) + (posY / halfHeight)) / 2;
      // cellY = ((posY / halfHeight) - posX / (halfWidth) / 2);

      var cellX = (posX / halfWidth + posY / halfHeight) / 2;
      var cellY = (posY / halfHeight - posX / halfWidth) / 2;
      cellX = Math.round(cellX);
      cellY = Math.round(cellY);
      console.log(cellX, cellY);
      return this.get(cellX, cellY);
    };
  }

});
