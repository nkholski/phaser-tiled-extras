Phaser.Tilemap.prototype.getImageLayerByName = function(layerName) {
    for (var i in this.imageLayers) {
        if (this.imageLayers[i].name === layerName) {
            return this.imageLayers[i];
        }
    }
    return null;
};

Phaser.Tilemap.prototype.addImageLayer = function(layerName, definedImageKey) {
    this.setDefault();
    var imageKey, image;
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
                    y: false,
                }
                object.relativePosition = {
                    x: object.x,
                    y: object.y
                }
                if (layers[i].properties.hasOwnProperty('bottom')) {
                    object.y = this.heightInPixels - image.data.height + parseInt(layers[i].properties.bottom);

                }

                if (layers[i].properties.hasOwnProperty('imageRepeat')) {
                    switch (layers[i].properties.imageRepeat) {
                        case 'repeat': // TODO: repeated with out filling screen.
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
                        case 'repeat-y':
                            object.y = 0;
                            object.width = game.width;
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
                    object.scale.x = parseFloat(layers[i].properties["scale.x"]);
                }
                if (layers[i].properties.hasOwnProperty('scale.y')) {
                    object.scale.y = parseFloat(layers[i].properties["scale.y"]);
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

                //object.angle = 5;

                object.alpha = layers[i].opacity;
                object.parallax = {
                    x: 1,
                    y: 1
                }
                if (layers[i].properties.hasOwnProperty('parallax') && parseFloat(layers[i].properties.parallax) > 0) {
                    object.parallax = {
                        x: parseFloat(layers[i].properties.parallax),
                        y: parseFloat(layers[i].properties.parallax)
                    }

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
