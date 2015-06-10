var Game = require('./Game');

console.log("asdads");
var game = new Game({
  width: 800,
  height: 400,
  FPS: 30,
  preload: function() {
    // general sprite sheet
    this.assets.loadSpriteSheet('sheet_general', '/sprites/sheet_general.json');
    this.assets.loadImage('img_general', '/sprites/sheet_general.png');
    // templar
    this.assets.loadImage('img_templar', '/sprites/templar-ik.png');
    this.assets.loadSpriteSheet('sheet_templar', '/sprites/templar-ik.json');
    // knight
    this.assets.loadImage('img_knight', '/sprites/knight.png');
    this.assets.loadSpriteSheet('sheet_knight', '/sprites/knight.json');
  },

  systems: [
    Game.systems.Motion
  ],

  map: Game.Maps.SIMPLE,

  createCharacter: function() {
    var character = Game.assemblages.Character();
    character.sprite.object = this.assets.createSpriteAnimation('sheet_knight');
    character.sprite.play('idle');
    this.entities.add(character);

    var bbox = Game.assemblages.Character();
    bbox.remove('collision');
    bbox.velocity = character.velocity;
    bbox.position = character.position;
    bbox.bounds = character.bounds;
    bbox.direction = character.direction;
    bbox.sprite.object = this.assets.Shape.create(
      this.assets.Graphics.create()
      .beginFill('rgba(255,0,0,0.5)')
      .drawRect(bbox.bounds.x, bbox.bounds.y, bbox.bounds.width, bbox.bounds.height)
    );
    this.entities.add(bbox);
    return character;
  },

  registrationPoints: {
    tile_default: [32, 16]
  },

  createTile: function(tile) {
    var id = 'tile_default';
    var sprite = this.assets.createSprite(id, 'sheet_general');
    sprite.x = tile.posX();
    sprite.y = tile.posY();
    var reg = this.registrationPoints[id];
    if (reg) {
      sprite.regX = reg[0];
      sprite.regY= reg[1];
    }
    console.log(tile.x, tile.y, tile.posX(), tile.posY());
    this.renderer.add('tiles', sprite);
  },

  start: function() {
    this.grid.useIsometric();
    this.player = this.createCharacter();
    // var enemy = this.createCharacter();
    // enemy.position.x = 100;
    // enemy.position.y = 300;
    this.input.enable();
  },

  walkSpeed: { x: 3, y: 1.5 },

  update: function() {
    var moving = false;
    if (this.input.keyboard.left.isDown) {
      this.player.direction.x = -1;
      this.player.velocity.x = -this.walkSpeed.x;
      moving = true;
    } else if (this.input.keyboard.right.isDown) {
      this.player.direction.x = 1;
      this.player.velocity.x = this.walkSpeed.x;
      moving = true;
    } else {
      this.player.velocity.x = 0;
    }

    if (this.input.keyboard.up.isDown) {
      this.player.direction.y = 1;
      this.player.velocity.y = -this.walkSpeed.y;
      moving = true;
    } else if (this.input.keyboard.down.isDown) {
      this.player.direction.y = -1;
      this.player.velocity.y = this.walkSpeed.y;
      moving = true;
    } else {
      this.player.velocity.y = 0;
    }

    if (moving) {
      this.player.sprite.play('walk');
    } else {
      this.player.sprite.play('idle');
    }

    var tile = this.grid.getByPosition(this.player.position.x + this.player.velocity.x, this.player.position.y + this.player.velocity.y);
    // if (!tile) {
    //   this.player.velocity.x = 0;
    //   this.player.velocity.y = 0;
    // }

    // focus camera
    var x = this.player.position.x;
    var y = this.player.position.y;
    var entities = this.renderer.getLayer('entities');
    var tiles = this.renderer.getLayer('tiles');
    entities.x = tiles.x = this.width * 0.5 - x;
    entities.y = tiles.y = this.height * 0.5 - y;

  }
});
