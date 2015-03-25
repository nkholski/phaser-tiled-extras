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
                    tint: (layers[i].properties.hasOwnProperty('tint')) ? parseInt((layers[i].properties.tint).replace("#", ""), 16) : 16777215,
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

                // TODO: Make velocity work for non tileSprites:
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

Phaser.Plugin.TiledExtras = function(game, parent) {
    /**
     *
     * All tiled-extras features in one Plugin. If you want only single features you can use the corresponding plugins. Don't combine this plugin with single feature plugins.
     * Current single feature plugins: Triggers
     * Planned single feature plugins: imageLayers, tilesetProperties
     *
     * The plugin object construtor, called by Phaser through Phaser.Game.add.plugin()
     *
     */
    this.game = game;
    this.name = "tiledExtras";
    this.map = null;
    this.parent = parent;
};
Phaser.Plugin.TiledExtras.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.TiledExtras.prototype.constructor = Phaser.Plugin.TiledExtras;
Phaser.Plugin.TiledExtras.prototype.postUpdate = function() {
    /**
     * Update loop for Triggers and imageLayers with parallax or velocity support.
     *
     */
    if (!this.map) {
        return;
    }

    var map = this.map;

    if (map.hasOwnProperty("triggers")) {
        for (var i in map.triggers) {
            if (map.triggers[i].enabled && map.triggers[i].callback && map.triggers[i].trigged) {
                map.triggers[i].callback(map.triggers[i], null, true);
            }
            map.triggers[i]._resetEndorsers = true;
        }
    }
    if (map.hasOwnProperty("imageLayers")) {


        for (var i in map.imageLayers) {
            if (map.imageLayers[i].type == 0) {
                continue;
            }
            map.imageLayers[i].tilePostionOffset.x += map.imageLayers[i].velocity.x * this.game.time.physicsElapsed;
            map.imageLayers[i].tilePostionOffset.y += map.imageLayers[i].velocity.y * this.game.time.physicsElapsed;

            if (map.imageLayers[i].posFixedToCamera.x) {
                map.imageLayers[i].tilePostionOffset.x += (map.imageLayers[i].x - map.game.camera.x) * map.imageLayers[i].parallax.x;
                map.imageLayers[i].x = map.game.camera.x;
            }
            if (map.imageLayers[i].posFixedToCamera.y) {
                map.imageLayers[i].tilePostionOffset.y += (map.imageLayers[i].y - map.game.camera.y) * map.imageLayers[i].parallax.y;
                map.imageLayers[i].y = map.game.camera.y;
            }
            map.imageLayers[i].tilePosition.x = map.imageLayers[i].tilePostionOffset.x + map.imageLayers[i].adjustTilePosition.x;
            map.imageLayers[i].tilePosition.y = map.imageLayers[i].tilePostionOffset.y + map.imageLayers[i].adjustTilePosition.y;

        }

    }
};

Phaser.Plugin.TiledExtras.prototype.render = function() {
    var color;
    if (!this.debug) {
        return;
    }
    //console.log("hej");
    for (var i in this.map.triggers) {
        //    console.log(this.map.triggers[i]);
        color = 'rgba(100,100,255,0.9)';
        if (this.map.triggers[i].trigged) {
            color = 'rgba(255,100,100,0.9)';
        }

        game.debug.geom({
            x: this.map.triggers[i].area.x,
            y: this.map.triggers[i].area.y,
            width: this.map.triggers[i].area.width,
            height: this.map.triggers[i].area.height
        }, color, this.map.triggers[i].enabled, 1);

    }
}

Phaser.Tilemap.prototype.setCurrentMap = function() {
    /**
     * Internal function to set current tilemap as Phaser.Plugin.TiledExtras.map
     *
     */
    var game = this.game;
    for (var i in game.plugins.plugins) {
        if (game.plugins.plugins[i].hasOwnProperty("name") && game.plugins.plugins[i].name === "tiledExtras") {
            game.plugins.plugins[i].map = this;
            return;
        }
    }
};

Phaser.Tilemap.prototype.gidToTileProperties = function(gid) {
    /**
     * Takes a GID from Tiled and return as an object tileProperties set in the editor.
     * Will return empty object if no properties has been set, null if Gid lookup failed.
     * @param {integer} [value=null] - Gid as defined by Tiled.
     *
     */
    for (var i in this.tilesets) {
        if (this.tilesets[i].containsTileIndex(gid)) {
            if (this.tilesets[i].tileProperties.hasOwnProperty(gid - this.tilesets[i].firstgid)) {
                return this.tilesets[i].tileProperties[(gid - this.tilesets[i].firstgid)];
            }
            return {};
        }
    }
    console.warn("No tileset contain Gid: " + gid);
    return null;
};


Phaser.Tilemap.prototype.tilePropertyToGid = function(value, property) {
    /**
     * Takes a value and property to find Gid as defined in Tiled with matching properties. Only first result will be returned, even if it may exist more possible matches.
     * @param {string} [value=null] - Value to check for.
     * @param {string} [property="type"] - Property to check for.
     */
    var keys, i, i2;
    if (typeof(value) === "undefined") {
        console.warn("tilePropertyToGid was called without value parameter.");
        return;
    }
    if (typeof(property) === "undefined" || property === null) {
        property = "type";
    }
    for (i = 0; i < this.tilesets.length; i++) {
        if (!(this.tilesets[i].hasOwnProperty("tileProperties"))) {
            continue;
        }
        keys = Object.keys(this.tilesets[i].tileProperties);
        for (i2 = 0; i2 < keys.length; i2++) {
            if ((this.tilesets[i].tileProperties[keys[i2]].hasOwnProperty(property)) && (this.tilesets[i].tileProperties[keys[i2]][property] === value)) {
                return (parseInt(keys[i2], 10) + parseInt(this.tilesets[i].firstgid, 10));
            }
        }
    }
    console.warn("Oh no! No GID found for: " + property + "=" + value);
    return false;
};

Phaser.TilemapLayer.prototype.setCollisionArea = function(collision, area) {
    // Overrides all settings - set collisions where tile !== null
    // Collision = {collideUp etc}
    if (area) {
        var a = {
            x: area.x,
            y: area.y,
            x1: area.x + area.width,
            y1: area.y + area.height
        };
    } else {
        var a = {
            x: 0,
            y: 0,
            x1: this.map.width,
            y1: this.map.height
        };
    }
    for (var y = a.y; y < a.y1; y++) {
        for (var x = a.x; x < a.x1; x++) {
            tile = this.map.getTile(x, y, this);
            tile.collideUp = true;
            tile.collideRight = true;
            tile.collideDown = true;
            tile.collideLeft = true;
            tile.collides = true;
            tile.faceTop = true;
            tile.faceRight = true;
            tile.faceBottom = true;
            tile.faceLeft = true;
        }
    }
}

/*Phaser.Loader.prototype.tilemapAndImages = function(key, url, data, format) {
    var loader = game.load.tilemap(key, url, data, format);
    game.load.onFileComplete.add(fileComplete, this);



    console.log(loader);
    while (loader._filelist.length > 0) {
        for (var i in loader._filelist) {
            if (loader._filelist[i].key === key) {
                var loadMap = loader._filelist[i];
                break;
            }
        }
    }
    console.log(loadMap);

    debugger;
    return;*/

Phaser.Loader.prototype.tilemapImages = function(mapKey) {
    var mapKeyConfirmed = false;
    var uglyHackIndex;

    // Make sure that the map is loaded! Otherwise stop up the loading cue and wait...
    if (typeof(mapKey) === "number") {
        for (var i = 0; i < this._fileList.length; i++) {
            if (this._fileList[i].type === "tilemapImages") {
                if (this.game.cache._tilemaps[this._fileList[i].key]) {
                    var mapKeyConfirmed = true;
                    mapKey = this._fileList[i].key;
                    uglyHackIndex = i;
                    break;
                }
            }
        }
    } else {
        // Two kind of hackish lines to make Phaser wait for the loader. Phaser will keep it in fileList and fail to catch it when processing the cue over and over until this function simply removes it from the list again.
        this._fileList.push({
            key: mapKey,
            loading: false,
            loaded: false,
            type: 'tilemapImages'
        });
        uglyHackIndex = this._fileList.length-1;
        this._totalFileCount++;
        if (!this.game.cache._tilemaps.hasOwnProperty(mapKey)) {
            game.load.onFileComplete.add(this.tilemapImages, this);
            return;
        }
        mapKeyConfirmed = true;
    }
    if(!mapKeyConfirmed){
      return;
    }
    var cachedMapData = this.game.cache._tilemaps[mapKey];
    var imageList = [];
    var tmpObj = {};
    var mapPath;
    var existingKeys = Object.keys(this.game.cache._images);

    game.load.tilemap('map', 'assets/map.json', null, Phaser.Tilemap.TILED_JSON);

    if (!cachedMapData) {
        console.error("Something went horribly wrong in Phaser.Tilemap.loadAllImages!");
        return;
    } else {
        mapPath = (cachedMapData.url).match(/.*\//)[0];
        cachedMapData = cachedMapData.data;
    }

    // Loop tilesets
    for (var i in cachedMapData.tilesets) {
        tmpObj = {};
        tmpObj.image = cachedMapData.tilesets[i].image;
        tmpObj.imageKey = (cachedMapData.tilesets[i].properties.hasOwnProperty("key")) ? cachedMapData.tilesets[i].properties.key : cachedMapData.tilesets[i].name;
        imageList.push(tmpObj);
    }
    // Loop images
    for (var i in cachedMapData.layers) {
        if (cachedMapData.layers[i].type != "imagelayer") {
            continue;
        }
        tmpObj = {};
        tmpObj.image = cachedMapData.layers[i].image;
        tmpObj.imageKey = (cachedMapData.layers[i].properties.hasOwnProperty("key")) ? cachedMapData.layers[i].properties.key : cachedMapData.layers[i].name;
        imageList.push(tmpObj);
    }
    // Load images
    for (var i in imageList) {
        var exists = false;
        imageList[i].image = mapPath + imageList[i].image;
        // Fix ".." in url (folder1/folder2/../folder3/image.png ==> folder1/folder3/image.png). ALLOWS url starting with ".." if someone for some reason keep their html-file inside a subfolder and the assets somewhere before that.
        while (imageList[i].image.indexOf("..") > 0) {
            imageList[i].image = imageList[i].image.replace(/([^\/\.]*?\/\.\.\/)/, "");
        }
        for (var i2 in existingKeys) {
            if (this.game.cache._images[existingKeys[i2]].url === imageList[i].image) {
                exists = true;
                continue;
            }
        }
        if (exists) {
            continue;
        }
        if (existingKeys.indexOf(imageList[i].imageKey) > 0) {
            console.warn("Conflicting key. Key already exists:" + imageList[i].imageKey);
            continue;
        }
        game.load.image(imageList[i].imageKey, imageList[i].image);
    }
    this._fileList.splice(uglyHackIndex, 1);
    this._totalFileCount--;
}

/*
Todo
alpha
properties
collisionCallback

updateCollision --> parseTileProperties(area,collision(bool),alpha(bool),callback(bool),clear(bool, clears any that is set to true))
*/

Phaser.TilemapLayer.prototype.updateCollision = function(area, clear) {
    /**
     * Reads through collision properties per tile in tileset and applies them to tiles in the layer. Support for rotated and flipped tiles. A tile rotated 90 degrees will have the property for collideUp applied to the right side etcetera.
     * @param {object} [value=null] - Area restrain fuction to, rectangle (area.x,area.y) to (area.x1, area.y1). Default is whole layer.
     * @param {boolean} [clear=false] - If set to true it will clear all collision info per tile, otherwise it will apply it.
     *
     * Properties read from Tiled map:
     * collideAll (massive block). Default is false.
     * collideUp, collideRight, collideDown, CollideLeft - Can be "true" or "false". Overrides any valu set by collideAll.
     */
    var tile, dirs = ["Up", "Right", "Down", "Left"];
    var tempCol = [false, false, false, false];

    if (area) {
        var a = {
            x: area.x,
            y: area.y,
            x1: area.x + area.width,
            y1: area.y + area.height
        };
    } else {
        var a = {
            x: 0,
            y: 0,
            x1: this.map.width,
            y1: this.map.height
        };
    }

    for (var y = a.y; y < a.y1; y++) {
        for (var x = a.x; x < a.x1; x++) {
            tempCol = [false, false, false, false];
            tile = this.map.getTile(x, y, this);

            if (!tile) {
                continue;
            }

            if (clear) {
                tile.collideUp = false;
                tile.collideRight = false;
                tile.collideDown = false;
                tile.collideLeft = false;
                tile.collides = false;
                continue;
            }

            if (tile.properties.hasOwnProperty("collideAll") && tile.properties.collideAll === "true") {
                tempCol = [true, true, true, true];
            }

            for (var i = 0; i < 4; i++) {
                if (tile.properties.hasOwnProperty("collide" + dirs[i])) {
                    if (tile.properties["collide" + dirs[i]] === "true") { // Clean up tile.properties?
                        tempCol[i] = true;
                    } else {
                        tempCol[i] = false;
                    }
                }
            }

            if (tile.flipped) {
                tempCol = [tempCol[0], tempCol[3], tempCol[2], tempCol[1]];
            }

            if (tile.rotation > 0) {
                switch (Math.round(2 * tile.rotation / Math.PI)) {

                    case 1:
                        tempCol = [tempCol[3], tempCol[0], tempCol[1], tempCol[2]];
                        break;
                    case 2:
                        tempCol = [tempCol[2], tempCol[3], tempCol[0], tempCol[1]];
                        break;
                    case 3:
                        tempCol = [tempCol[1], tempCol[2], tempCol[3], tempCol[0]];
                        break;
                }
            }
            tile.collideUp = tempCol[0];
            tile.collideRight = tempCol[1];
            tile.collideDown = tempCol[2];
            tile.collideLeft = tempCol[3];
            tile.collides = tempCol[0] || tempCol[1] || tempCol[2] || tempCol[3];

            if(tile.properties.hasOwnProperty("alpha")){
              tile.alpha = parseFloat(tile.properties.alpha);
            }

            // Fix callback
            var callback = null;
            if (tile.properties.hasOwnProperty("callback")) {
                callback = window;
                var parts = tile.properties.callback.split(".");
                for (var i2 in parts) {
                    if (callback[parts[i2]] != "undefined") {
                        callback = callback[parts[i2]];
                    } else {
                        callback = null;
                        console.warn("Tile callback not found: " + parts[i2]);
                        break;
                    }
                }
                tile.collisionCallback = callback;
                /*tile.callback = callback;
                tile.collisionCallback = function(){this.callback(); console.log("dubbel callback!");}; <-- MED BIND*/
            }
        }
    }
    this.map.calculateFaces(this.index);
};

Phaser.Tilemap.prototype.getTriggerByName = function(name) {
    return (name in this.triggerNames) ? this.triggerNames[name] : false;
};

Phaser.Tilemap.prototype.checkTriggers = function(object) {
    /**
     * Check if object triggers the triggers and calls callbacks.
     * @param {object} [object=null] - Sprite or Group to check.
     *
     * TODO: Spritetiles? Call for a Phaser.point without graphical object?
     */
    var offset, objectArray, objectBounds;

    if (!this.hasOwnProperty("triggers")) {
        console.warn("checkTriggers called before defineTriggers!");
        return;
    }
    if (!this.triggers) {
        return;
    }

    switch (object.type) {
        case 0: // Sprite
            offset = {
                x: 0,
                y: 0
            }; // TODO: Untested. Possible bug if object is within an group.
            objectArray = [object];
            break;
        case 7: // Group
            offset = { // Adjust to group position
                x: object.x,
                y: object.y
            };
            objectArray = object.children;
            break;
    }

    for (var o in objectArray) {
        object = objectArray[o];

        var objectBounds = {
            left: object.body.position.x,
            right: object.body.position.x + object.body.width - (Math.abs(object.width) - object.body.width),
            top: object.body.position.y,
            bottom: object.body.position.y + object.body.height - (Math.abs(object.height) - object.body.height),
            anchorX: object.x,
            anchorY: object.y
        };

        for (var i in this.triggers) {
            if (!this.triggers[i].enabled) {
                continue;
            }

            // Check Required
            if (this.triggers[i].required) {
                switch (this.triggers[i].required.operator) {
                    case "==":
                        if (object[this.triggers[i].required.property] != this.triggers[i].required.value) {
                            continue;
                        }
                        break;
                    case "!=":
                        if (object[this.triggers[i].required.property] != this.triggers[i].required.value) {
                            continue;
                        }
                        break;
                    case "<=":
                        if (object[this.triggers[i].required.property] > this.triggers[i].required.value) {
                            continue;
                        }
                        break;
                    case ">=":
                        if (object[this.triggers[i].required.property] < this.triggers[i].required.value) {
                            continue;
                        }
                        break;
                    case "<":
                        if (object[this.triggers[i].required.property] >= this.triggers[i].required.value) {
                            continue;
                        }
                        break;
                    case ">":
                        if (object[this.triggers[i].required.property] <= this.triggers[i].required.value) {
                            continue;
                        }
                        break;
                }

            }

            if (this.triggers[i]._resetEndorsers) {
                this.triggers[i].wasTrigged = this.triggers[i].trigged;
                this.triggers[i].endorsers = [];
                this.triggers[i]._resetEndorsers = false;
            }

            // detectAnchorOnly, Quicker
            if (objectBounds.anchorX < this.triggers[i].area.x2 && objectBounds.anchorX > this.triggers[i].area.x && objectBounds.anchorY < this.triggers[i].area.y2 && objectBounds.anchorY > this.triggers[i].area.y) {
                this.triggers[i].trigged = true;
                this.triggers[i].endorsers.push(object);
                if (this.triggers[i].callback) {
                    this.triggers[i].callback(this.triggers[i], object);
                }
            } else if (this.triggers[i].wasTrigged && this.triggers[i].endorsers.length === 0) {
                this.triggers[i].trigged = false;
                if (this.triggers[i].callback) {
                    this.triggers[i].callback(this.triggers[i], object);
                }
            }

            /*
            // TODO: Kolla om mitten kolliderar, annars vilken sida det är om rutan och beräkna från den.
            // Detect body
            //if(checkCoord(x,y)){}
            game.debug.geom({
              x: objectBounds.anchorX,
              y: objectBounds.anchorY,
            }, "rgba(0,0,255,1)" , true, 3);

            game.debug.geom({
              x: objectBounds.left,
              y: objectBounds.bottom,
            }, "rgba(255,0,0,1)" , true, 3);
            game.debug.geom({
              x: objectBounds.right,
              y: objectBounds.bottom,
            }, "rgba(0,255,0,1)" , true, 3);
            if(checkCoord(objectBounds.right, objectBounds.top) || checkCoord(objectBounds.right, objectBounds.bottom) || checkCoord(objectBounds.left, objectBounds.top) || checkCoord(objectBounds.left, objectBounds.bottom)){
              within=true;
            }

            //if(this.triggers[i].area.x<objectBounds.right && object.objectBounds.left)
            var checkCoord = function(x,y){
                return ((x < this.triggers[i].area.x2 && x > this.triggers[i].area.x && y < this.triggers[i].area.y2 && y > this.triggers[i].area.y))
            };*/




        }
    }
};



Phaser.Tilemap.prototype.defineTriggers = function() {
    this.setCurrentMap();
    if (!this.objects.hasOwnProperty("triggers")) {
        this.triggers = null;
        this.triggerNames = null;
        return;
    }
    this.triggers = [];
    this.triggerNames = [];

    var triggers = this.objects.triggers;
    var args, argNames;
    var required = null;

    for (var i = 0, len = triggers.length; i < len; i++) {
        args = {};
        argNames = Object.keys(triggers[i].properties);

        triggers[i].x = (typeof(triggers[i].x)==="undefined") ? 0:triggers[i].x; // Tiled wont set any x-value if x==0. x<0 is OK.
        triggers[i].y = (typeof(triggers[i].y)==="undefined") ? 0:triggers[i].y; // Tiled wont set any y-value if y==0. y<0 is OK.

        var trigger = {
            name: (triggers[i].hasOwnProperty("name")) ? triggers[i].name : null,
            enabled: (!triggers[i].properties.hasOwnProperty("enabled") || (triggers[i].properties.enabled !== "true")),
            callback: null,
            args: [],
            area: {
                x: triggers[i].x,
                y: triggers[i].y,
                width: triggers[i].width,
                height: triggers[i].height,
                x2: triggers[i].x + triggers[i].width,
                y2: triggers[i].y + triggers[i].height
            },
            trigged: false,
            wasTrigged: false,
            endorsers: [],
            detectAnchorOnly: triggers[i].properties.detectAnchorOnly,
            required: null,
            _resetEndorsers: true
        };

        // Custom arguments
        for (var i2 in argNames) {
            if (argNames[i2] !== "callback" && argNames[i2] !== "required") {
                args[argNames[i2]] = triggers[i].properties[argNames[i2]];
            }
        }
        trigger.args = args;

        // Required value
        if (triggers[i].properties.hasOwnProperty("required")) {
            var operators = ["<=", ">=", "==", "<", ">", "!=", false];
            for (var i2 = 0; i2 < 7; i2++) {
                if (triggers[i].properties.required.indexOf(operators[i2]) > -1) {
                    break;
                }
            }
            if (operators[i2]) {
                required = triggers[i].properties.required.split(operators[i2]);
                required[1] = required[1].replace(/\"/g, "").replace(/\'/g, "").replace(/\=\=\=/g, "==");
                if (parseFloat(required[1]) == required[1]) { // Floats will be floats...
                    required[1] = parseFloat(required[1]);
                }
                trigger.required = {
                    property: required[0],
                    operator: operators[i2], // Supported: <= >= == < > !=
                    value: (required[1] === "true") ? true : ((required[1] === "false") ? false : required[1])
                };
            }
        }

        // Detection body/point
        if (triggers[i].properties.hasOwnProperty("detectAnchorOnly")) {
            if (triggers[i].properties.detectAnchorOnly !== "false") {
                trigger.detectAnchorOnly = true;
            }
        } else {
            trigger.detectAnchorOnly = false;
        }

        // Fix callback
        var callback = null;
        if (triggers[i].properties.hasOwnProperty("callback")) {
            callback = window;
            var parts = triggers[i].properties.callback.split(".");
            for (var i2 in parts) {
                if (callback[parts[i2]] != "undefined") { // WAS: callback.hasOwnProperty(parts[i2])
                    callback = callback[parts[i2]];
                } else {
                    callback = null;
                    console.warn("Trigger callback not found: " + parts[i2]);
                    break;
                }
            }
            trigger.callback = callback;
        }

        this.triggers.push(trigger);

        if (triggers[i].hasOwnProperty("name") && triggers[i].name) {
            if (this.triggerNames.hasOwnProperty(triggers[i].name)) {
                console.warn("Duplicate trigger name: " + triggers[i].name + "\ngetTriggerByName will fail!");
            } else {
                this.triggerNames[triggers[i].name] = this.triggers.length - 1;
            }
        }
    }
    if (this.triggers.length === 0) {
        this.triggers = null;
        this.triggerNames = null;
    }
};
