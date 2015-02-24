# phaser-tiled-extras #

## Warning: The plugin is under development. It's not fit for production use and may break compatibility between updates. ##

This plugin adds additional features from Tiled mapeditor to Phaser 2. Some of them are built-in in Tiled, and others are custom solutions. The aim is to move reusable code from my projects to this plugin. Another aim is to make it integrate to Phaser 2 as seamless as possible with unmodified code. This is experimental at the moment, and ideas are added and removed as I go, so does the solutions.

The plugin will not improve performance. For increased performance (along with additional Tiled features) I recommend the far more advanced plugin Phaser-Tiled: https://github.com/englercj/phaser-tiled.

Check out the online example at: http://dev.niklasberg.se/phaser-tiled-extras/example

Current features:

Feature|Description
-------|-----------
Triggers|Triggers are defined in an Object layer called "Triggers".
Tileset properties|Set collision by collideUp etcetera
Image layers|Stuff like parallax and properties such as opacity/alpha

All features will be available as stand-alone plugins and as part of the full phaser-tiled-extras plugin.

Possible future additions: More types of objects, Autoload sprites, Animated tiles

## First (unfinished) documentation attempt: ##

## Phaser.Tilemap.prototype.addImageLayer ##

### Properties set in Tiled ###
#### Built in properties: ####
Property|Description
--------|-----------
name (string)|Name of layer, used for finding ImageKey if not defined and to find layer by searching by name.
position.x (integer)|Horizontal position, set by moving layer in Tiled or editing the value
position.y (integer)|Vertical position, set by moving layer in Tiled or editing the value
opacity (float)|Used as tileSprite alpha
visible (boolean)|Sets the exists value of the tileSprite
image (string)|If no key is defined, it will be used to identify imageKey to use. (Path is ignored)
Transparent color (object)| Not supported.

#### Custom properties: ####
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

### Resulting variables ###
Phaser.Tilemap.imageLayers, array of tileSprites and/or sprites created by Phaser.Tilemap.defineImageLayers. Additional values:

#### Phaser.Tilemap.prototype.checkTriggers ####
TODO: Body instead of Anchor

#### Phaser.Tilemap.prototype.defineTriggers ####
area,args,callback,detectAnchorOnly,enabled,endorsers,height,name,newLoop,trigged,wasTrigged,width
required|Properties for objects that are required activate trigger (i.e. player=true, ghost!=true or weight>90)

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


## EXAMPLES
#### Loading tile properties into collision (layer = Phaser.TilemapLayer): ####
```
layer.updateCollision(); //Sets all tiles as defined in Tiled
layer.updateCollision(new Phaser.Rectangle(5,5,10,10)); // As above but only within a rectange 10 tiles wide, and 10 tiles high, starting at x=5, y=5
layer.updateCollision({x:5, y:5, width: 10, height: 10}); // Same result as above
layer.updateCollision(null, true); // Clear collision for the whole layer
layer.updateCollision(new Phaser.Rectangle(0,0,layer.width/2,layer.height/2), true); // Clear collision for the upper left area, one fourth of the full layer.
```

#### map = Phaser.Tilemap ####
```
map.defineTriggers(); // Load triggers into map.triggers
map.checkTriggers(group); //checking triggers and activating events for all within group (group = Phaser.Group)
map.checkTriggers(sprite); //checking triggers and activating events for all within sprite (sprite = Phaser.Sprite)
```
