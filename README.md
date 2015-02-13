# phaser-tiled-extras

#Warning: The plugin is in very early alpha. Not for production use, probably not even any idea for anyone else than me to test yet.

This plugin adds additional features from Tiled mapeditor to Phaser 2. It aims to integrate as seemless as possible with unmodified code. 
The plugin will not improve performance. For incresed performance I recommend the far more advanced plugin Phaser-Tiled https://github.com/englercj/phaser-tiled.

Planned features:
* Animated tiles
* Triggers in Object layer
* Collisions defined in Tiled. (CollideUp etc.)

Maybes:
* Images? /imagelayer
* More types of objects
* name to gid

Tile properties
collideAll      Sets collision to it's value in all directions (true/false). Set to false by default.
collideUp       Set collideUp (true/false). Overrides collide
collideRight    Set collideRight (true/false). Overrides collide
collideLeft     Set collideLeft (true/false). Overrides collide
collideDown     Set collideDown (true/false). Overrides collide

Trigger object properties
forbidden       Properties for objects that are forbidden activate trigger (i.e. ghost=true)
required        Properties for objects that are required activate trigger (i.e. player=true)
function/event        Event related to the trigger


// Loading tile properties into collision (layer = Phaser.TilemapLayer):
layer.updateCollision(); //Sets all tiles as defined in Tiled
layer.updateCollision(new Phaser.Rectangle(5,5,10,10)); // As above but only within a rectange 10 tiles wide, and 10 tiles high, starting at x=5, y=5
layer.updateCollision({x:5, y:5, width: 10, height: 10}); // Same result as above
layer.updateCollision(null, true); // Clear collision for the whole layer
layer.updateCollision(new Phaser.Rectangle(0,0,layer.width/2,layer.height/2), true); // Clear collision for the upper left area, one fourth of the full layer.

// map = Phaser.Tilemap
map.defineTriggers(); // Load triggers into map.triggers

map.checkTriggers(group); //checking triggers and activating events for all within group (group = Phaser.Group) 
map.checkTriggers(sprite); //checking triggers and activating events for all within sprite (sprite = Phaser.Sprite)
