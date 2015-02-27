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
