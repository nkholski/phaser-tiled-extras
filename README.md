# phaser-tiled-extras

#Warning: The plugin is in very early alpha. Not for production use, probably not even any idea for anyone else than me to test yet.

This plugin adds additional features from Tiled mapeditor to Phaser 2. It aims to integrate as seemless as possible with unmodified code.
The plugin will not improve performance. For incresed performance I recommend the far more advanced plugin Phaser-Tiled https://github.com/englercj/phaser-tiled.

This is highly experimental at the moment, and ideas are added and removed as I go, so does the solutions. My aim is to add stuff I use in my game to a separate plugin and when the features feels kind of stable I will start to figure out how to clean it up and present it.

Planned features:
* Triggers in Object layer
* Collisions defined in Tiled. (CollideUp etc.)
* Image layer

Maybes:
* Images? /imagelayer
* Animated tiles
* More types of objects


##Phaser.Tilemap.prototype.addImageLayer##

###Built in properties:###
Property|Description
--------|-----------
name (string)|Name of layer, used for finding ImageKey if not defined and to find layer by searching by name.
position.x|Horizontal position, set by moving layer in Tiled or editing the value
position.y|Vertical position, set by moving layer in Tiled or editing the value
opacity|Will be used as tileSprite alpha
visible|Sets the exists value of the tileSprite
image|If no key is defined, it will be used to identify imageKey to use.
Transparent color| Not supported.

###Custom properties:###
key - Name of imageKey to use (recommended method).
right
bottom - push image to bottom of screen, adjusted by value of properties.bottom (properties.bottom - 32 means it will be 32px above bottom of the screen). Overrides the y value set in Tiled.
left
repeat - Repeat will make the image to repeat within a tilesprite and fit the image to the full screen. repeat-x and repeat-y will do that horizontally or vertically.
repeat-x (fixa om från som det är nu)
repeat-y
tint  - sets tint for the tileSprite
scale - sets scale of tileSprite to {x: properties.scale, y: properties.scale}
scale.x and properties.scale.y as above but separately.
velocity
velocity.x
velocity.y
parallax
parallax.x (ej implementerat)
parallax.y (ej implementerat)















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
