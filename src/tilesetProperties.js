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
