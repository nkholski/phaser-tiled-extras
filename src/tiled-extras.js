Phaser.Plugin.TiledExtras = function(game, parent) {
    /**
     * The plugin object construtor, called by Phaser through Phaser.Game.add.plugin()
     *
     */
    this.game = game;
    this.name = "tiledExtras";
    this.map = null;
    this.parent = parent;
    //this.debug = true;
};
Phaser.Plugin.TiledExtras.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.TiledExtras.prototype.constructor = Phaser.Plugin.TiledExtras;
Phaser.Plugin.TiledExtras.prototype.postUpdate = function() {
    /**
     * Update loop for Triggers and imageLayers with parallax or velocity support.
     *
     */
    var map = this.map;

    if (map.hasOwnProperty("triggers")) {
        for (var i in map.triggers) {
            if (map.triggers[i].enabled && map.triggers[i].callback) {
                map.triggers[i].callback(map.triggers[i], null, true);
            }
            map.triggers[i].newLoop = true;
        }
    }
    if (map.hasOwnProperty("imageLayers")) {


        for (var i in map.imageLayers) {

            map.imageLayers[i].offset.x += map.imageLayers[i].velocity.x * this.game.time.physicsElapsed;
            map.imageLayers[i].offset.y += map.imageLayers[i].velocity.y * this.game.time.physicsElapsed;

            if (map.imageLayers[i].posFixedToCamera.x) {
                map.imageLayers[i].offset.x += (map.imageLayers[i].x - map.game.camera.x) * map.imageLayers[i].parallax.x;
                map.imageLayers[i].x = map.game.camera.x;
            }
            if (map.imageLayers[i].posFixedToCamera.y) {
                map.imageLayers[i].offset.y += (map.imageLayers[i].y - map.game.camera.y) * map.imageLayers[i].parallax.y;
                map.imageLayers[i].y = map.game.camera.y;
            }
            map.imageLayers[i].tilePosition.x = map.imageLayers[i].offset.x + map.imageLayers[i].displace.x;
            map.imageLayers[i].tilePosition.y = map.imageLayers[i].offset.y + map.imageLayers[i].displace.y;

        }

    }
};

Phaser.Plugin.TiledExtras.prototype.render = function() {
    if(!this.debug){return;}
    console.log("hej");
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
                tile.faceTop = false;
                tile.faceRight = false;
                tile.faceBottom = false;
                tile.faceLeft = false;
                continue;
            }

            if (tile.properties.hasOwnProperty("collideAll") && tile.properties.collideAll === "true") {
                tempCol = [true, true, true, true];
            }

            for (var i = 0; i < 4; i++) {
                if (tile.properties.hasOwnProperty("collide" + dirs[i])) {
                    if (tile.properties["collide" + dirs[i]] === "true") {
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
            tile.faceTop = tempCol[0];
            tile.faceRight = tempCol[1];
            tile.faceBottom = tempCol[2];
            tile.faceLeft = tempCol[3];
        }
    }
};
