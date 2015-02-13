var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });
var writeTile = true;

function preload() {

    game.load.tilemap('map', 'assets/map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tileset', 'assets/tileset.png');
    game.load.image('ship', 'assets/ship.png');

}

var ship;
var map;
var layers = [];
var cursors;

function create() {
  game.add.plugin(Phaser.Plugin.TiledExtras);
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#2d2d2d';

    map = game.add.tilemap('map');

    map.addTilesetImage('tileset');

    layers[0] = map.createLayer('Tile Layer 1');
    layers[1] = map.createLayer('Tile Layer 2');

    tiledExtras.updateCollision(layers);
    triggerPlugin.init(map);
    layers[0].resizeWorld();

    //  Convert the tilemap layer into bodies. Only tiles that collide (see above) are created.
    //  This call returns an array of body objects which you can perform addition actions on if
    //  required. There is also a parameter to control optimising the map build.
    //game.physics.arcade.convertTilemap(map, layers[0]);

    ship = game.add.sprite(200, 200, 'ship');
    auto = game.add.sprite(20, 20, 'ship');


    this.game.physics.enable(ship);
    ship.body.allowGravity = true;

    this.game.physics.enable(auto);
    auto.body.velocity.x=50;

    spriteGroup = game.add.group();
    spriteGroup.add(ship);
    spriteGroup.add(auto);
    //game.physics.arcade.enable(ship);

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

}

function update() {

    if (cursors.left.isDown)
    {
        ship.body.velocity.x=-100;
    }
    else if (cursors.right.isDown)
    {
      ship.body.velocity.x=100;
    }


    else
    {
      ship.body.velocity.x=0;

    }

    if (cursors.up.isDown)
    {

      ship.body.velocity.y=-100;
    }
    else if (cursors.down.isDown)
    {
      ship.body.velocity.y=100;

    }
    else{
      ship.body.velocity.y=0;

    }

    if (cursors.up.isDown && cursors.down.isDown)
    {
      auto.x=20;
      auto.body.velocity.x = 70;
    }

    this.physics.arcade.collide(auto, layers[0]);

    this.physics.arcade.collide(ship, layers[0]);

    this.physics.arcade.collide(ship, layers[1]);
    //map.checkTriggers(ship);
    //map.checkTriggers(auto);
    map.checkTriggers(spriteGroup);

}
