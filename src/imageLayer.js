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
     * TODO: X,Y,Width,Height,X2,Y2, TOP, BOTTOM etc. = Position / Size
     * TODO: repeat, parallax = how to present image (without repeat = strech)
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
            if (!layers[i].hasOwnProperty("properties")) {
                layers[i].properties = {};
            }
            if (!layerName || layerName === layers[i].name) {
                if (definedImageKey) {
                    imageKey = definedImageKey;
                } else {
                    // 1. Check if properties.key exists
                    if (layers[i].properties.hasOwnProperty("key")) {
                        imageKey = layers[i].properties.key;
                    } else {
                        // 2. Check if image filename === layer image filename
                        var keys = Object.keys(game.cache._images);
                        var imageName = layers[i].image.replace(/.*?\//g, "");
                        for (var i2 in keys) {
                            if (keys[i2] === "__default" || keys[i2] === "__missing") {
                                continue;
                            }
                            if (game.cache._images[keys[i2]].url.indexOf("/" + imageName) > 0) {
                                imageKey = keys[i2];
                                break;
                            }
                        }
                        // 3. Check if image key === layer name
                        if (!imageKey && game.cache._images.hasOwnProperty(layers[i].name)) {
                            imageKey = layers[i].name;
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

                // Make default object
                object = {
                    name: layers[i].name,
                    canBeSprite: (layers[i].properties.hasOwnProperty('forceTileSprite') && layers[i].properties.forceTileSprite !== "false") ? false : true,
                    x: layers[i].x,
                    y: layers[i].y,
                    width: image.data.width,
                    height: image.data.height,
                    imageKey: imageKey,
                    posFixedToCamera: {
                        x: false,
                        y: false
                    },
                    alpha: layers[i].opacity,
                    tint: (layers[i].properties.hasOwnProperty('tint')) ? layers[i].properties.tint : 16777215,
                    scale: {
                        x: 1,
                        y: 1
                    },
                    adjustTilePosition: {
                        x: 0,
                        y: 0
                    },
                    velocity: {
                        x: 0,
                        y: 0
                    },
                    tilePostionOffset: {
                        x: 0,
                        y: 0
                    },
                    parallax: {
                        x: 1,
                        y: 1
                    },
                    exists: (layers[i].visible !== "false")
                };


                // TODO: Strech = repeat ==> Doesn't move other side but streches Image-size
                //                scale ==> -"-, but scales the containing Image
                //                none ==> default (move image) as below:
                if (layers[i].properties.hasOwnProperty('bottom')) {
                    object.y = this.heightInPixels - image.data.height + parseInt(layers[i].properties.bottom, 10);
                } else if (layers[i].properties.hasOwnProperty('top')) { // Untested
                    object.y = parseInt(layers[i].properties.top, 10);
                }
                if (layers[i].properties.hasOwnProperty('right')) { // Untested
                    object.x = this.widthInPixels - image.data.width + parseInt(layers[i].properties.right, 10);
                }
                if (layers[i].properties.hasOwnProperty('left')) { // Untested
                    object.y = parseInt(layers[i].properties.left, 10);
                }

                if (layers[i].properties.hasOwnProperty('repeat') && layers[i].properties.repeat == "true") {
                    object.x = 0;
                    object.y = 0;
                    object.width = game.width;
                    object.height = game.height;
                    object.posFixedToCamera.x = true;
                    object.posFixedToCamera.y = true;
                    object.canBeSprite = false;
                }
                if (layers[i].properties.hasOwnProperty('repeat-x') && layers[i].properties["repeat-x"] == "true") {
                    object.x = 0;
                    object.width = game.width;
                    object.posFixedToCamera.x = true;
                    object.canBeSprite = false;
                }
                if (layers[i].properties.hasOwnProperty('repeat-y') && layers[i].properties["repeat-y"] == "true") {
                    object.y = 0;
                    object.height = game.height;
                    object.posFixedToCamera.y = true;
                    object.canBeSprite = false;
                }

                // Flip with Scale<0 not working! --> Need to adjust position!!!
                if (layers[i].properties.hasOwnProperty('scale')) {
                    object.scale.x = parseFloat(layers[i].properties.scale);
                    object.scale.y = parseFloat(layers[i].properties.scale);
                    object.width /= object.scale.x;
                    object.height /= object.scale.y;
                }
                if (layers[i].properties.hasOwnProperty('scale.x')) {
                    object.scale.x = parseFloat(layers[i].properties["scale.x"], 10);
                }
                if (layers[i].properties.hasOwnProperty('scale.y')) {
                    object.scale.y = parseFloat(layers[i].properties["scale.y"], 10);
                }
                object.velocity.x = layers[i].properties.hasOwnProperty('velocity.x') ? parseFloat(layers[i].properties["velocity.x"]) : object.velocity.x;
                object.velocity.y = layers[i].properties.hasOwnProperty('velocity.y') ? parseFloat(layers[i].properties["velocity.y"]) : object.velocity.y;

                if (layers[i].properties.hasOwnProperty('parallax') && parseFloat(layers[i].properties.parallax) > 0) {
                    object.parallax = {
                        x: parseFloat(layers[i].properties.parallax),
                        y: parseFloat(layers[i].properties.parallax)
                    };
                    object.canBeSprite = false;
                }

                if (object.canBeSprite) {
                    var graphicalObject = game.add.sprite(object.x, object.y, object.imageKey);

                } else {
                    var graphicalObject = game.add.tileSprite(object.x, object.y, object.width, object.height, object.imageKey);
                }
                var ObjectKeys = Object.keys(object);
                for (var keyIndex in ObjectKeys) {
                    graphicalObject[ObjectKeys[keyIndex]] = object[ObjectKeys[keyIndex]];
                }

                tileSpriteArray.push(graphicalObject);
                this.imageLayers.push(graphicalObject);
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
