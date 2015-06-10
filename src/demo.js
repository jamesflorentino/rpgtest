var Tile = require('./core/Tile');
var Tween = require('./core/Tween');
var Bounds = require('./core/Bounds');
var Client = require('./Client');

var FollowComponent = require('./components/FollowComponent');

var Maps = require('./Maps');
var Characters = require('./Characters');

// Override the tile to tell if isometric or just plain grid
Tile.prototype.WIDTH = 64;
Tile.prototype.HEIGHT = 32;
Tile.prototype.posX = function() {
  return (this.x - this.y) * this.WIDTH * 0.5;
};
Tile.prototype.posY = function() {
  return (this.y + this.x) * this.HEIGHT * 0.5;
};

var game = new Client({
  // debug: true,
  FPS: 60,
  width: 800,
  height: 500,

  manifest: [
    { id: 'sheet_general', src: '/sprites/sheet_general.json' },
    { id: 'sheet_templar', src: '/sprites/templar-ik.json' },
    { id: 'img_general', src: '/sprites/sheet_general.png' },
    { id: 'img_templar', src: '/sprites/templar-ik.png' }
  ],

  tileMinX: 0,
  tileMaxX: 0,
  tileMinY: 0,
  tileMaxY: 0,

  tileColors: {
    "0": "#909b43",
    "portal": "black"
  },

  assetOffsets: {
    'pointer_move': [13,46],
    'tile_move': [26,16],
    'tree_basic': [44.5, 100],
    'house': [170, 155]
  },

  tileWalls: {
    'house': [
      [0,0],
      [0,0],
      [0,0]
    ]
  },

  assetIds: {
    "1": "tree_basic"
  },

  foregroundElement: function(matrixId) {
    var assetId = this.assetIds[matrixId];
    if (!assetId) { return; }
    var sprite = this.assets.create(assetId, 'sheet_general', this.assetOffsets[assetId]);
    return sprite;
  },

  mapObjectElement: function(assetId, x, y) {
    var sprite = this.assets.create(assetId, 'sheet_general', this.assetOffsets[assetId]);
    var tileWall = this.tileWalls[assetId];
    var tile = this.grid.getByPosition(x, y);
    var game = this;
    sprite.x = x;
    sprite.y = y;
    tileWall.forEach(function(row, y) {
      row.forEach(function(column, x) {
        var t = game.grid.get(tile.x + x, tile.y + y);
        if (!t) { return; }
        t.wall = true;
        var s = game.spriteRefs[t.x + '-' + t.y];
        s.alpha = 0.5;
      });
    });
    return sprite;
  },

  spriteRefs: {},

  groundTile: function(tile, matrixId) {
    var colors = this.tileColors;

    var graphics = this.assets.Graphics.create();
    graphics.beginFill(colors[matrixId] || colors["0"]);
    if (this.debug) {
      graphics.beginStroke('red');
    }
    graphics.moveTo(0, -tile.HEIGHT * 0.5);
    graphics.lineTo(tile.WIDTH * 0.5, 0);
    graphics.lineTo(0, tile.HEIGHT * 0.5);
    graphics.lineTo(-tile.WIDTH * 0.5, 0);
    graphics.closePath();

    if (this.tileMinX > tile.posX()) {
      this.tileMinX = tile.posX();
    }
    if (this.tileMaxX < tile.posX()) {
      this.tileMaxX = tile.posX();
    }
    if (this.tileMinY > tile.posY()) {
      this.tileMinY = tile.posY();
    }
    if (this.tileMaxY < tile.posY()) {
      this.tileMaxY = tile.posY();
    }
    var sprite = this.assets.Shape.create(graphics);
    this.spriteRefs[tile.x + '-' + tile.y] = sprite;
    return sprite;
  },

  onLoadMapPortal: function(tile) {
    var sprite = this.spriteRefs[[tile.x, tile.y].join('-')];
    sprite.alpha = 0.5;
  },

  globalToLocalX: function(e) {
    if (e.changedTouches) {
      e = e.changedTouches.item(0);
    }
    var rootX = e.clientX;
    var canvasX = this.renderer.canvas.offsetLeft;
    return rootX - canvasX;
  },

  globalToLocalY: function(e) {
    if (e.changedTouches) {
      e = e.changedTouches.item(0);
    }
    var rootY = e.clientY;
    var canvasY = this.renderer.canvas.offsetTop;
    return rootY - canvasY;
  },

  enableMousePan: function() {
    var game = this;
    var isDragging = false;
    var initialX;
    var initialY;

    this.renderer.canvas.addEventListener('mousedown', function(e) {
      var localX = game.globalToLocalX(e);
      initialX = localX - game.panX;

      var localY = game.globalToLocalY(e);
      initialY = localY - game.panY;
      isDragging = true;
    });

    document.body.addEventListener('mousemove', function(e) {
      if (!isDragging || game.isFocusingOnUnit) { return; }
      var localX = game.globalToLocalX(e);
      var localY = game.globalToLocalY(e);
      game.pan(localX - initialX, localY - initialY);
    });

    this.renderer.canvas.addEventListener('mouseup', function() {
      isDragging = false;
    });
  },

  createSprite: function(name) {
    return this.assets.create(name, this.assetOffsets[name]);
  },

  clickedEntity: function(entity) {
    if (this.disabledControls) { return; }
    if (entity === this.hero) { return; }
    this.hasClickedEntity = true;
    var game = this;
    setTimeout(function() {
      game.hasClickedEntity = false;
      game.hero.remove('seek');
      game.gotoEntity(entity);
    });
  },

  clickedTile: function(e) {
    if (this.disabledControls) { return; }
    if (this.hasClickedEntity) { return; }
    var localX = this.globalToLocalX(e) - this.panX;
    var localY = this.globalToLocalY(e) - this.panY;
    var tile = this.grid.getByPosition(localX, localY);
    if (!tile || tile.wall) { return; }
    this.moveCharacter(this.hero, localX, localY);
    this.showIndicator(localX, localY);
  },

  enslaveEntity: function(entity) {
    entity.add(new FollowComponent(this.hero, this.grid, this.world));
    entity.setState('walking');
  },

  gotoEntity: function(entity) {
    var position = entity.get('position');
    var start = this.grid.getByPosition(this.hero.get('position').x, this.hero.get('position').y);
    var end = this.grid.getByPosition(position.x, position.y);
    var nearest = this.grid.getNearestNeighbor(start, end);
    this.moveCharacter(this.hero, nearest.posX(), nearest.posY());
  },

  showIndicator: function(x, y) {
    var name;
    name = 'pointer_move';
    var pointer = game.assets.create(name, 'sheet_general', game.assetOffsets[name]);
    pointer.x = x;
    pointer.y = y - 50;
    Tween.get(pointer)
    .to({ y: y }, 200, Tween.Ease.backOut)
    .to({ alpha: 0 }, 900)
    .call(function() {
      if (!pointer.parent) { return; }
      pointer.parent.removeChild(pointer);
    });
    game.renderer.add('entity', pointer);

    name = 'tile_move';
    var indicator = game.assets.create(name, 'sheet_general', game.assetOffsets[name]);
    indicator.x = x;
    indicator.y = y;
    indicator.scaleX = indicator.scaleY = 0;
    Tween.get(indicator)
    .to({ scaleX: 1, scaleY: 1 }, 200, Tween.Ease.backOut)
    .to({ alpha: 0 }, 900)
    .call(function() {
      if (!pointer.parent) { return; }
      indicator.parent.removeChild(indicator);
    });
    game.renderer.add('entity', indicator);
  },

  onLoadMap: function() {
    var game = this;
    this.addCharacter(this.hero, {
      tile: [0,7]
    });

    game.undimMap();
  },

  onEntitySetState: function(entity, state) {
    var game = this;
    var hero = game.hero;
    if (game.hero !== entity) { return; }
    switch(state) {
    case 'idle':
      var position = hero.get('position');
      var tile = game.grid.getByPosition(position.x, position.y);
      if (tile && tile.portal) {
        var map = game.currentMap === Maps.FOREST ? Maps.DEBUG : Maps.FOREST;
        game.dimMap();
        setTimeout(function() {
          game.loadMap(map);
        }, 500);
      }
      break;
    }

  },

  ready: function() {
    var game = this;

    try {
      game.touchEnabled = !!document.createEvent('TouchEvent');
    } catch(err) {
      game.touchEnabled = false;
    }

    var hero = this.hero = this.createCharacter({
      attributes: Characters.TEMPLAR,
      name: 'James'
    });

    this.start();

    this.dimMap(true);
    setTimeout(function() {
      game.loadMap(Maps.DEBUG);
    }, 500);


    this.renderer.canvas.addEventListener(game.touchEnabled ? 'touchend' : 'mouseup', this.clickedTile.bind(this));

  }
});

game.loadMap = function() {
  Client.prototype.loadMap.apply(this, arguments);
  // cache baseLayer
  var halfWidth = Tile.prototype.WIDTH * 0.5;
  var halfHeight = Tile.prototype.HEIGHT * 0.5;
  var baseLayer = this.renderer.getLayer('base');
  var minX = this.tileMinX - halfWidth;
  var minY = this.tileMinY - halfHeight;
  var maxX = this.tileMaxX + halfWidth;
  var maxY = this.tileMaxY + halfWidth;
  var totalWidth = maxX - minX;
  var totalHeight = maxY - minY;
  baseLayer.cache(minX, minY, totalWidth, totalHeight);
};

game.grid.getByPosition = function(posX, posY) {
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
  return this.get(cellX, cellY);
};

game.isometricPerspectiveSort = function(a, b) {
  if (a.y > b.y) { return 1; }
  if (b.y > a.y) { return -1; }
  if (a.x > b.x) { return 1; }
  if (b.x > a.x) { return -1; }
  return 0;
};

game.renderer.onUpdate = function() {
  game.focusCharacter(game.hero);
  game.renderer.getLayer('entity').sortChildren(game.isometricPerspectiveSort);
};
