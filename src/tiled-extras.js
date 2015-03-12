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

Phaser.Tilemap.prototype.setCollisionLayer = function(collisionLayerName, group){
  var collisionLayerName = collisionLayerName ? collisionLayerName : "collisionLayer";
  var colLayerIndex = this.getLayerIndex(collisionLayerName);
  var collisionLayer = null;
  var colTile, tile;

  if(!colLayerIndex){
    collisionLayer = this.createBlankLayer(collisionLayerName, this.width, this.height, this.tileWidth, this.tileHeight, group);
    colLayerIndex = this.getLayerIndex(collisionLayerName);
    collisionLayer.visible = false;
  }
  // Prepare the collision layer
  for(var x=0; x<this.layers[colLayerIndex].width; x++){
    for(var y=0; y<this.layers[colLayerIndex].height; y++){
      //console.log(collisionLayerName);
      this.putTile(1, x, y, collisionLayerName);
      colTile = this.getTile(x, y, collisionLayerName);
      colTile.collideUp = false;
      colTile.collideRight = false;
      colTile.collideDown = false;
      colTile.collideLeft = false;
      colTile.collides = false;
    }
  }
  // Loop all layers to find collisions
  for(var i in this.layers){
    if(i==colLayerIndex){continue;}
    for(var x=0; x<this.layers[i].width; x++){
      for(var y=0; y<this.layers[i].height; y++){
        //console.log(x+"  "+y)
        tile = this.getTile(x,y, this.layers[i].name);
        if(!tile){continue;}
        colTile = this.getTile(x, y, collisionLayerName);
        colTile.collideUp = tile.collideUp ? true : colTile.collideUp;
        colTile.collideRight = tile.collideRight ? true : colTile.collideRight;
        colTile.collideDown = tile.collideDown ? true : colTile.collideDown;
        colTile.collideLeft = tile.collideLeft ? true : colTile.collideLeft;
        colTile.collides = tile.collides ? true : colTile.collides;
      }
    }
  }
  // Set all non-collision tiles to null (save some ram and probably perfomance)
  for(var x=0; x<this.layers[colLayerIndex].width; x++){
      for(var y=0; y<this.layers[colLayerIndex].height; y++){
          colTile = this.getTile(x, y, collisionLayerName);
          if(!colTile.collideUp && !colTile.collideDown && !colTile.collideLeft && !colTile.collideRight){
              this.putTile(null, x, y, collisionLayerName);
          }
      }
  }

  // Fix faces
  this.calculateFaces(colLayerIndex);

  return collisionLayer ? collisionLayer : null;
}
