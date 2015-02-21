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

####Built in properties:####
Property|Description
--------|-----------
name (string)|Name of layer, used for finding ImageKey if not defined and to find layer by searching by name.
position.x (integer)|Horizontal position, set by moving layer in Tiled or editing the value
position.y (integer)|Vertical position, set by moving layer in Tiled or editing the value
opacity (float)|Used as tileSprite alpha
visible (boolean)|Sets the exists value of the tileSprite
image (string)|If no key is defined, it will be used to identify imageKey to use. (Path is ignored)
Transparent color (object)| Not supported.

####Custom properties:####
Property|Description
--------|-----------
key (string)|Name of imageKey to use.
top (integer)|Push the image to the top, and adjust the vertical position by the value set. Ovverides the y-value set in Tiled.
right (integer)|See top
bottom (integer)|See top
left (integer)|See top
repeat (boolean)|Make the image to repeat within a tilesprite and fit the image to the full screen.
repeat-x (boolean)| As repeat but only horizontally.
repeat-y (boolean)| As repeat but only vertically.
tint (hexadecimal)|Sets tint for the tileSprite (will not show any effect in Tiled). Valid values #000000 to #FFFFFF.
scale (float)|Sets scale of tileSprite to {x: properties.scale, y: properties.scale}
scale.x (float)|Sets scale.x of tileSprite
scale.y (float)|Sets scale.y of tileSprite
velocity.x (float)|Set vertical speed of layer movement
velocity.y (float)|Set horizontal speed of layer movement
parallax (float)|Defines both vertical and horizontal parallax movement by proportion to camera movement. (0.5 makes the background move at half speed of the camera, 2 makes it two times faster.)
parallax.x (float)|TODO: As parallax but only vetically.
parallax.y (float)|TODO: As parallax but only horizontally.

####Phaser.Tilemap.prototype.checkTriggers####
TODO: Body instead of Anchor

####Phaser.Tilemap.prototype.defineTriggers####
area,args,callback,detectAnchorOnly,enabled,endorsers,height,name,newLoop,trigged,wasTrigged,width
forbidden|Properties for objects that are forbidden activate trigger (i.e. ghost=true)
required|Properties for objects that are required activate trigger (i.e. player=true)

#### Supported Tiled tileset properties####
Custom property|Description
--------|-----------
collideAll|Sets collision to it's value in all directions (true/false). Set to false by default.
collideUp|Set collideUp (true/false). Overrides collideAll
collideRight|Set collideRight (true/false). Overrides collideAll
collideLeft|Set collideLeft (true/false). Overrides collideAll
collideDown|Set collideDown (true/false). Overrides collideAll

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
