var game = new Phaser.Game(320, 192, Phaser.AUTO, 'phaser-example', {
  preload: preload,
  create: create,
  update: update,
  render: render
});
var writeTile = true;

function preload() {
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.load.atlas('mario', 'assets/spritesheet.png', 'assets/spritesheet.json');

  game.load.tilemap('map', 'assets/map.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.image('tileset', 'assets/tileset.png');
  game.load.image('ship', 'assets/ship.png');
  game.load.image('marioClouds', 'assets/Mario_Clouds_small.png');
  game.load.image('motherBrain', 'assets/motherBrain.png');

  game.load.image('background', 'assets/background.png');


}

var ship;
var map;
var layers = [];
var cursors;

function create() {
  game.add.plugin(Phaser.Plugin.TiledExtras);
  game.physics.startSystem(Phaser.Physics.ARCADE);
  this.game.physics.arcade.gravity.y = 300;

  game.stage.backgroundColor = '#0391cf';

  map = game.add.tilemap('map');

  map.addTilesetImage('tileset');

  map.addImageLayer();

  layers[0] = map.createLayer('Tile Layer 1');
  layers[1] = map.createLayer('Tile Layer 2');

  layers[0].updateCollision();
  layers[1].updateCollision();


  //tiledExtras.updateCollision(layers);
  map.defineTriggers();
  layers[0].resizeWorld();

  //  Convert the tilemap layer into bodies. Only tiles that collide (see above) are created.
  //  This call returns an array of body objects which you can perform addition actions on if
  //  required. There is also a parameter to control optimising the map build.
  //game.physics.arcade.convertTilemap(map, layers[0]);

  ship = game.add.sprite(200, 200, 'mario');
  ship.animations.add('walk', ['marioWalk0', 'marioWalk1', 'marioWalk2', 'marioWalk1'], 10, true);
  ship.animations.add('turn', ['marioTurn']);
  ship.animations.add('bow', ['marioBow']);
  ship.animations.add('stand', ['marioStand']);
  ship.animations.add('jump', ['marioJump']);
  this.game.physics.enable(ship);
  ship.anchor.setTo(0.5, 0.5);
  ship.body.maxVelocity.x = 150;
  ship.body.maxVelocity.y = 300;
  ship.body.setSize(12,28,2,3);
  ship.name = "Mario";
  //globals.balloon.animations.add("default", ["ugh0", "ugh1", "ugh2", "ugh3", "ugh4"], 20, true);
  ship.play('walk');



  this.game.physics.enable(ship);
  ship.body.allowGravity = true;




  spriteGroup = game.add.group();
  spriteGroup.add(ship);

  game.camera.follow(ship);

  //  By default the ship will collide with the World bounds,
  //  however because you have changed the size of the world (via layer.resizeWorld) to match the tilemap
  //  you need to rebuild the physics world boundary as well. The following
  //  line does that. The first 4 parameters control if you need a boundary on the left, right, top and bottom of your world.
  //  The final parameter (false) controls if the boundary should use its own collision group or not. In this case we don't require
  //  that, so it's set to false. But if you had custom collision groups set-up then you would need this set to true.
  //  game.physics.p2.setBoundsToWorld(true, true, true, true, false);

  //  Even after the world boundary is set-up you can still toggle if the ship collides or not with this:
  // ship.body.collideWorldBounds = false;

  cursors = game.input.keyboard.createCursorKeys();
  loadSprites();

  game.add.tween(map.imageLayers[0].displace).to( { y: 10 }, 2000, Phaser.Easing.Sinusoidal.InOut, true, 0, 1000, true);
  game.add.tween(map.imageLayers[1].displace).to( { y: 15 }, 2000, Phaser.Easing.Sinusoidal.InOut, true, 0, 1000, true);

}

function update() {

  this.physics.arcade.collide(spriteGroup, spriteGroup);

  this.physics.arcade.collide(spriteGroup, layers[0]);

//  this.physics.arcade.collide(ship, layers[0]);
  if (cursors.left.isDown) {
    ship.body.acceleration.x = -800;
    ship.scale.x = -1;

  } else if (cursors.right.isDown) {
    ship.body.acceleration.x = 800;
    ship.scale.x = 1;

  } else {
    ship.body.acceleration.x = 0;
    ship.body.velocity.x *= 0.5;


  }

  if (cursors.up.isDown && (ship.body.blocked.down || ship.body.touching.down)) {
    ship.body.velocity.y = -200;
  } else if (cursors.down.isDown) {
    //ship.body.velocity.y = 300;

  }


  if (ship.body.velocity.y != 0 && (!ship.body.blocked.down && !ship.body.touching.down)) {
    animation = "jump";
  } else if (Math.abs(ship.body.velocity.x) > 1) {
    if (((ship.body.acceleration.x < 0 && ship.body.velocity.x > 0) || (ship.body.acceleration.x > 0 && ship.body.velocity.x < 0))) {
      animation = "turn";
    } else {
      animation = "walk";
    }

  } else {
    animation = "stand";
  }

  if(ship.animations.currentAnim.name !== animation){
    ship.play(animation);
  }


  if ((Math.abs(ship.body.velocity.x) > 1) && ((ship.body.acceleration.x < 0 && ship.body.velocity.x > 0) || (ship.body.acceleration.x > 0 && ship.body.velocity.x < 0))) {
    ship.play("turn");
  }



//  this.physics.arcade.collide(ship, layers[1]);

  //map.checkTriggers(ship);

  map.checkTriggers(spriteGroup);

}


function render(){
  //debug.body(ship);
  return;

  game.debug.spriteInfo(ship, 32, 32);
  game.debug.body(ship);

}


function loadSprites(){

  map.createFromObjects('sprites', map.tilePropertyToGid("block"), 'mario' , null, true, null, spriteGroup, pushBlock);



}


function pushBlock(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'mario');
  game.add.existing(this);
  game.physics.enable(this);
  this.body.friction = 0.7;
  this.anchor.setTo(0.5, 0.5);
  this.animations.add('static', ['blockStatic'],5);
  this.play('static');
};

pushBlock.prototype = Object.create(Phaser.Sprite.prototype);
pushBlock.prototype.constructor = pushBlock;

pushBlock.prototype.update = function() {
  this.body.velocity.x/=1.2;

};
