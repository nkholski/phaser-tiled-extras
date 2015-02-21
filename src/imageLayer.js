Phaser.Tilemap.prototype.getImageLayerByName = function(layerName) {
  /**
  * Takes a imageLayer name as set as name property in Tiled and return corresponding tileSprite or null if nothing is found.
  * @param {string} [name=null] - Name of imageLayer set in Tiled.
  *
  */
    for (var i in this.imageLayers) {
        if (this.imageLayers[i].name === layerName) {
            return this.imageLayers[i];
        }
    }
    return null;
};


Phaser.Tilemap.prototype.addImageLayer = function(layerName, definedImageKey) {
  /**
  * Loads one or all imageLayers and applies defined properties on it.
  * @param {string} [layerName=null] - Name of imageLayer as set in Tiled. If omitted, all layers will be loaded.
  * @param {string} [definedImageKey=null] - Name of imageKey to use. If omitted, properties.key set in Tiled, imageKey matching layer name and image layer file name matching cached image file name will be loaded, in that order. Recommended to ommit.
  *

  TODO: Sprites instead of TileSprites when possible?

  ==Supported properties from Tiled==

  Built in properties:
  name (string) - Name of layer, used for finding ImageKey if not defined and to find layer by searching by name.
  position.x
  position.y
  opacity
  visible
  image
  (Transparent color is not supported).

  Custom properties:
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
  */
    this.setCurrentMap();
    var imageKey, image, object;
    var layers = this.game.cache._tilemaps[this.key].data.layers;
    var game = this.game;
    var tileSpriteArray = []; // Return value

    if (!this.hasOwnProperty("imageLayers")) {
        this.imageLayers = [];
    }

    for (var i in layers) {
        if (layers[i].type === "imagelayer") { // Better to check map.images???
            if (!layerName || layerName === layers[i].name) {
                if (definedImageKey) {
                    imageKey = definedImageKey;
                } else {
                    // 1. Check if properties.key exists
                    if (layers[i].properties.hasOwnProperty("key")) {
                        imageKey = layers[i].properties.key;
                    }
                    // 2. Check if image key === layer name
                    else if (game.cache._images.hasOwnProperty(layers[i].name)) {
                        imageKey = layers[i].name;
                    } else {
                        // 3. Check if image filename === layer image filename (UNTESTED)
                        var keys = Object.keys(game.cache._images);
                        for (var i2 in keys) {
                            if (keys[i2] === "__default" || keys[i2] === "__missing") {
                                continue;
                            }
                            if (game.cache._images[keys[i2]].url.indexOf("/" + layers[i].image) > 0) {
                                imageKey = keys[i2];
                            }
                        }
                    }

                }
                if (!imageKey) {
                    console.warn("Couldn't decide imageKey!");
                    continue;
                }
                if (game.cache._images.hasOwnProperty(imageKey)) {
                    image = game.cache._images[imageKey];
                } else {
                    console.warn("No image with key:" + imageKey);
                    continue;
                }

                object = game.add.tileSprite(layers[i].x, layers[i].y, image.data.width, image.data.height, imageKey);

                object.posFixedToCamera = {
                    x: false,
                    y: false
                };
                object.relativePosition = {
                    x: object.x,
                    y: object.y
                };

                // TODO: Strech = repeat ==> Doesn't move other side but streches Image-size
                //                scale ==> -"-, but scales the containing Image
                //                none ==> default (move image) as below:
                if (layers[i].properties.hasOwnProperty('bottom')) {
                    object.y = this.heightInPixels - image.data.height + parseInt(layers[i].properties.bottom, 10);
                }
                else if (layers[i].properties.hasOwnProperty('top')) { // Untested
                    object.y = parseInt(layers[i].properties.top, 10);
                }
                if (layers[i].properties.hasOwnProperty('right')) { // Untested
                    object.x = this.widthInPixels - image.data.width + parseInt(layers[i].properties.right, 10);
                }
                if (layers[i].properties.hasOwnProperty('left')) { // Untested
                    object.y = parseInt(layers[i].properties.left, 10);
                }

                if (layers[i].properties.hasOwnProperty('imageRepeat')) {
                    switch (layers[i].properties.imageRepeat) {
                        case 'repeat': // TODO: repeated without filling screen.
                            object.x = 0;
                            object.y = 0;
                            object.width = game.width;
                            object.height = game.height;
                            object.posFixedToCamera.x = true;
                            object.posFixedToCamera.y = true;
                            break;
                        case 'repeat-x':
                            object.x = 0;
                            object.width = game.width;
                            object.posFixedToCamera.x = true;
                            break;
                        case 'repeat-y': // Untested
                            object.y = 0;
                            object.height = game.height;
                            object.posFixedToCamera.y = true;
                            break;
                    }
                }

                if (layers[i].properties.hasOwnProperty('tint')) {
                    object.tint = layers[i].properties.tint;
                }

                // Flip with Scale<0 not working!

                if (layers[i].properties.hasOwnProperty('scale')) {
                    object.scale.x = parseFloat(layers[i].properties.scale);
                    object.scale.y = parseFloat(layers[i].properties.scale);
                    object.width /= object.scale.x;
                    object.height /= object.scale.y;
                }
                if (layers[i].properties.hasOwnProperty('scale.x')) {
                    object.scale.x = parseFloat(layers[i].properties["scale.x"],10);
                }
                if (layers[i].properties.hasOwnProperty('scale.y')) {
                    object.scale.y = parseFloat(layers[i].properties["scale.y"],10);
                }
                object.displace = {
                    x: 0,
                    y: 0
                };
                object.velocity = {
                    x: 0,
                    y: 0
                };
                object.offset = {
                    x: 0,
                    y: 0
                };
                if (layers[i].properties.hasOwnProperty('velocity')) {
                    object.velocity.x = parseFloat(layers[i].properties.velocity);
                    object.velocity.y = parseFloat(layers[i].properties.velocity);
                }
                object.velocity.x = layers[i].properties.hasOwnProperty('velocity.x') ? parseFloat(layers[i].properties["velocity.x"]) : object.velocity.x;
                object.velocity.y = layers[i].properties.hasOwnProperty('velocity.y') ? parseFloat(layers[i].properties["velocity.y"]) : object.velocity.y;

                object.alpha = layers[i].opacity;

                object.parallax = {
                    x: 1,
                    y: 1
                };
                if (layers[i].properties.hasOwnProperty('parallax') && parseFloat(layers[i].properties.parallax) > 0) {
                    object.parallax = {
                        x: parseFloat(layers[i].properties.parallax),
                        y: parseFloat(layers[i].properties.parallax)
                    };
                }

                if(layers[i].visible === "false"){
                    object.exists = false;
                }

                object.name = layers[i].name;
                tileSpriteArray.push(object);
                this.imageLayers.push(object);
            }
        }
    }
    if (tileSpriteArray.length === 0) {
        return false;
    } else if (tileSpriteArray.length === 1) {
        return tileSpriteArray[0];
    } else {
        return tileSpriteArray;
    }
};
