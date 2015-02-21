var game = new Phaser.Game(320, 192, Phaser.AUTO, 'phaser-example', {
  preload: preload,
  create: create,
  update: update,
  render: render
});

function preload() {
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.load.atlas('mario', 'assets/spritesheet.png', 'assets/spritesheet.json');
  game.load.tilemap('map', 'assets/map.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.image('tileset', 'assets/tileset.png');
  game.load.image('marioClouds', 'assets/Mario_Clouds_small.png');
  game.load.image('motherBrain', 'assets/motherBrain.png');
  game.load.image('background', 'assets/background.png');
}

var mario;
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

  mario = game.add.sprite(200, 200, 'mario');
  mario.animations.add('walk', ['marioWalk0', 'marioWalk1', 'marioWalk2', 'marioWalk1'], 10, true);
  mario.animations.add('turn', ['marioTurn']);
  mario.animations.add('bow', ['marioBow']);
  mario.animations.add('stand', ['marioStand']);
  mario.animations.add('jump', ['marioJump']);
  this.game.physics.enable(mario);
  mario.anchor.setTo(0.5, 0.5);
  mario.body.maxVelocity.x = 150;
  mario.body.maxVelocity.y = 300;
  mario.body.setSize(12,28,2,2);
  mario.name = "Mario";
  mario.play('walk');



  this.game.physics.enable(mario);
  mario.body.allowGravity = true;




  spriteGroup = game.add.group();
  spriteGroup.add(mario);

  game.camera.follow(mario);

  //  By default the mario will collide with the World bounds,
  //  however because you have changed the size of the world (via layer.resizeWorld) to match the tilemap
  //  you need to rebuild the physics world boundary as well. The following
  //  line does that. The first 4 parameters control if you need a boundary on the left, right, top and bottom of your world.
  //  The final parameter (false) controls if the boundary should use its own collision group or not. In this case we don't require
  //  that, so it's set to false. But if you had custom collision groups set-up then you would need this set to true.
  //  game.physics.p2.setBoundsToWorld(true, true, true, true, false);

  //  Even after the world boundary is set-up you can still toggle if the mario collides or not with this:
  // mario.body.collideWorldBounds = false;

  cursors = game.input.keyboard.createCursorKeys();
  loadSprites();

  game.add.tween(map.imageLayers[0].displace).to( { y: 10 }, 2000, Phaser.Easing.Sinusoidal.InOut, true, 0, 1000, true);
  game.add.tween(map.imageLayers[1].displace).to( { y: 15 }, 2000, Phaser.Easing.Sinusoidal.InOut, true, 0, 1000, true);

}

function update() {

  this.physics.arcade.collide(spriteGroup, spriteGroup);

  this.physics.arcade.collide(spriteGroup, layers[0]);

//  this.physics.arcade.collide(mario, layers[0]);
  if (cursors.left.isDown) {
    mario.body.acceleration.x = -800;
    mario.scale.x = -1;

  } else if (cursors.right.isDown) {
    mario.body.acceleration.x = 800;
    mario.scale.x = 1;

  } else {
    mario.body.acceleration.x = 0;
    mario.body.velocity.x *= 0.5;


  }

  if (cursors.up.isDown && (mario.body.blocked.down || mario.body.touching.down)) {
    mario.body.velocity.y = -200;
  } else if (cursors.down.isDown) {
    //mario.body.velocity.y = 300;

  }


  if (mario.body.velocity.y != 0 && (!mario.body.blocked.down && !mario.body.touching.down)) {
    animation = "jump";
  } else if (Math.abs(mario.body.velocity.x) > 1) {
    if (((mario.body.acceleration.x < 0 && mario.body.velocity.x > 0) || (mario.body.acceleration.x > 0 && mario.body.velocity.x < 0))) {
      animation = "turn";
    } else {
      animation = "walk";
    }

  } else {
    animation = "stand";
  }

  if(mario.animations.currentAnim.name !== animation){
    mario.play(animation);
  }


  if ((Math.abs(mario.body.velocity.x) > 1) && ((mario.body.acceleration.x < 0 && mario.body.velocity.x > 0) || (mario.body.acceleration.x > 0 && mario.body.velocity.x < 0))) {
    mario.play("turn");
  }



//  this.physics.arcade.collide(mario, layers[1]);

  //map.checkTriggers(mario);

  map.checkTriggers(spriteGroup);

}


function render(){
  //debug.body(mario);
  return;

  game.debug.spriteInfo(mario, 32, 32);
  game.debug.body(mario);

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
