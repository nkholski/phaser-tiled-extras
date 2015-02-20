Phaser.Tilemap.prototype.getImageLayerByName = function(layerName){
  for(var i in map.imageLayers){
    if(map.imageLayers[i].name === layerName){
      return map.imageLayers[i];
    }
  }
  return null;
}

Phaser.Tilemap.prototype.addImageLayer = function(layerName, definedImageKey) {
  this.setDefault();

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

/**
 * A Sample Plugin demonstrating how to hook into the Phaser plugin system.

EN enda init som fixar updateCollision utifrån map och Triggers


Funition
Callback för tiles

 */


/*

 SNYGGARE:
 Phaser.Physics.Arcade.prototype.constructor = Phaser.Physics.Arcade;
 Phaser.Physics.Arcade.prototype = {

 går det att göra
 map.defineTriggers gör:
 Phaser.Sprite.checkTriggers = function(checkTriggers.bind(map));

 sprite.checkTriggers():


}*/


// FUNKAR INTE HELT. GRAVITATION...
Phaser.Tilemap.prototype.loadSprites = function(layerName, defaultImageKey, group) {
  if (!layerName) {
    layerName = "sprites";
  }
  var objectLayer = false;
  keys = Object.keys(this.objects);

  for (var i in keys) {
    if (keys[i] != layerName) {
      continue;
    }
    objectLayer = this.objects[keys[i]];
    break;
  }

  if (!objectLayer) {
    console.warn("loadSprites failed to identify layer!");
    return;
  }

  // Loop all objects in layer:
  for (var i in objectLayer) {
    var spriteObject = false;
    var imageKey = defaultImageKey;
    if(!objectLayer[i].gid){
      continue;
    }
    // Check if object has imagekey-property
    if (objectLayer[i].type !== "") {
      spriteObject = objectLayer[i].type;
    } else {
      var tileProperties = this.gidToTileProperties(objectLayer[i].gid);
      if (tileProperties.hasOwnProperty("type")) {
        spriteObject = tileProperties.type;
      }
    }
    if(spriteObject && spriteObject!==""){
      console.log("Load"+spriteObject);
      themap.createFromObjects(layerName, objectLayer[i].gid, imageKey, null, true, null, group, window[spriteObject]);
    }
  }
}


Phaser.Tilemap.prototype.gidToTileProperties = function(gid) {
  console.log(this);
  for (var i in this.tilesets) {
    if (this.tilesets[i].containsTileIndex(gid)) {
      if (this.tilesets[i].tileProperties.hasOwnProperty(gid - this.tilesets[i].firstgid)) {
        return this.tilesets[i].tileProperties[(gid - this.tilesets[i].firstgid)];
      }
      return false;
    }
  }
  console.warn("No tileset contain " + gid);
}



Phaser.Tilemap.prototype.tilePropertyToGid = function(value, property) {
  var keys, i, i2;
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
  console.log("Error! No GID found:" + value);
  return false;
}


Phaser.TilemapLayer.prototype.updateCollision = function(area, clear) {
  var tile, dirs = ["Up", "Right", "Down", "Left"];
  var tempCol = [false, false, false, false];

  if (area) {
    a = {
      x: area.x,
      y: area.y,
      x1: area.x + area.width,
      y1: area.y + area.height
    };
  } else {
    a = {
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

}




Phaser.Plugin.TiledExtras = function(game, parent) {
  this.game = game;
  this.name = "tiledExtras";
  this.map = null;
  //this.Triggers = new Phaser.Plugin.TiledExtras.Triggers(game);
  //this.parent = parent;
};
Phaser.Plugin.TiledExtras.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.TiledExtras.prototype.constructor = Phaser.Plugin.TiledExtras;
Phaser.Plugin.TiledExtras.prototype.postUpdate = function() {
  var parallax = {
    x: 0,
    y: 0
  };
  map = this.map;

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
        map.imageLayers[i].offset.x += (map.imageLayers[i].x - map.game.camera.x) * map.imageLayers[i].parallax.x
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
}

Phaser.Tilemap.prototype.setDefault = function() {
  game = this.game;
  for (var i in game.plugins.plugins) {
    if (game.plugins.plugins[i].hasOwnProperty("name") && game.plugins.plugins[i].name === "tiledExtras") {
      game.plugins.plugins[i].map = this;
      return;
    }
  }
}

Phaser.Plugin.TiledExtras.Triggers = function(game) {
    /**
     * @property {Phaser.Game} game - A reference to the currently running Game.
     */
    this.game = game;

    /**
     * @property {Phaser.Tilemap} map - A reference to the current map.
     */
    this.map = map;

    this.triggers = [];
    this.triggerNames = [];


    /**
     * @property {boolean} _cleared - Internal var.
     * @private
     */
    this._resetTests = false;


  }
  /*
  Phaser.Plugin.TiledExtras.prototype = Object.create(Phaser.Plugin.prototype);
  Phaser.Plugin.TiledExtras.prototype.constructor = Phaser.Plugin.TiledExtras;
  Phaser.Plugin.TiledExtras.prototype.postUpdate = function() {
    if (map.hasOwnProperty("triggers")) {
      for (var i in map.triggers) {
        triggers[map.triggers[i].function](map.triggers[i], null, true);
        map.triggers[i].newLoop = true;
      }
    }
    if (map.hasOwnProperty("imageLayers")) {
      for (var i in map.imageLayers) {
        if (map.imageLayers[i].posFixedToCamera.x) {
          map.imageLayers[i].tilePosition.x += (map.imageLayers[i].x - map.game.camera.x) * map.imageLayers[i].parallax.x;
          map.imageLayers[i].x = map.game.camera.x;
        }
        if (map.imageLayers[i].posFixedToCamera.y) {
          map.imageLayers[i].tilePosition.y += (map.imageLayers[i].y - map.game.camera.y) * map.imageLayers[i].parallax.y;
          map.imageLayers[i].y = map.game.camera.y;
        }
      }

    }
  }*/



Phaser.Tilemap.prototype.getTriggerByName = function(name) {
  return (name in this.triggerNames) ? this.triggerNames[name] : false;
}


Phaser.Tilemap.prototype.checkTriggers = function(object) {
  /* Object:
  Sprite
  Group
  Phaser.point / {x,y}
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
      }; // Men om den är i en group??!
      objectArray = [object];
    case 7: // Group
      offset = {
        x: object.x,
        y: object.y
      };
      objectArray = object.children;
      break;
  }

  for (var o in objectArray) {
    object = objectArray[o];
    var objectBounds = {
      leftX: object.x + offset.x,
      topY: object.y + offset.y,
      toX: object.x + offset.x,
      rightX: object.x + offset.x,
      rightY: object.y + offset.y,
      anchorX: object.x + offset.x,
      anchorY: object.y + offset.y,
    }


    for (var i in this.triggers) {
      if (!this.triggers[i].enabled) {
        continue;
      }
      if (this.triggers[i].newLoop) {
        this.triggers[i].wasTrigged = this.triggers[i].trigged;
        this.triggers[i].endorsers = [];
        this.triggers[i].newLoop = false;
      }
      // Skip if object is unable to trigger this trigger
      if (this.triggers[i].required) {
        if (object.hasOwnProperty(this.triggers[i].required.property)) {
          if (object[this.triggers[i].required.property] !== this.triggers[i].required.value) {
            continue;
          }
        }
      }
      if (this.triggers[i].forbidden) {
        if (object.hasOwnProperty(this.triggers[i].forbidden.property)) {
          if (object[this.triggers[i].forbidden.property] === this.triggers[i].forbidden.value) {
            continue;
          }
        }
      }


      // detectAnchorOnly
      if (objectBounds.anchorX < this.triggers[i].x1 && objectBounds.anchorX > this.triggers[i].x0 && objectBounds.anchorY < this.triggers[i].y1 && objectBounds.anchorY > this.triggers[i].y0) {
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

    }
  }
}



Phaser.Tilemap.prototype.defineTriggers = function() {
  this.setDefault();
  if (!this.objects.hasOwnProperty("triggers")) {
    this.triggers = null;
    this.triggerNames = null;
    return;
  }
  this.triggers = [];
  this.triggerNames = [];

  var triggers = this.objects.triggers,
    args, argNames, forbidden = null,
    required = null;

  for (var i = 0, len = triggers.length; i < len; i++) {
    args = {};
    argNames = Object.keys(triggers[i].properties);

    for (var i2 in argNames) {
      if (argNames[i2] !== "callback" && argNames[i2] !== "required" && argNames[i2] !== "forbidden") {
        args[argNames[i2]] = triggers[i].properties[argNames[i2]];
      }
    }

    if (triggers[i].properties.hasOwnProperty("forbidden")) { // Räcker med bara required?!
      forbidden = triggers[i].properties.forbidden.split("="); // <= >= === == = < > !=
      forbidden = {
        property: forbidden[0],
        value: (forbidden[1] === "true") ? true : ((forbidden[1] === "false") ? false : forbidden[1])
      }

    }

    if (triggers[i].properties.hasOwnProperty("detectAnchorOnly")) {
      if (triggers[i].properties.detectAnchorOnly !== "false") {
        triggers[i].properties.detectAnchorOnly = true;
      }
    } else {
      triggers[i].properties.detectAnchorOnly = false;
    }

    // fix callback
    var callback = null;
    if (triggers[i].properties.hasOwnProperty("callback")) {
      callback = window;
      var parts = triggers[i].properties.callback.split(".");
      for (var i2 in parts) {
        if (callback.hasOwnProperty(parts[i2])) {
          callback = callback[parts[i2]];
        } else {
          console.warn("Trigger callback not found: " + parts[i2]);
          break;
        }
      }
    }

    this.triggers.push({
      enabled: (!triggers[i].properties.hasOwnProperty("enabled") || (!triggers[i].properties.enabled === "true")),
      callback: callback,
      arguments: args,
      area: {
        x: triggers[i].x,
        y: triggers[i].y,
        width: triggers[i].width,
        height: triggers[i].height,
        x2: triggers[i].x + triggers[i].width,
        y2: triggers[i].y + triggers[i].height
      },
      x0: triggers[i].x,
      y0: triggers[i].y,
      width: triggers[i].width,
      height: triggers[i].height,
      x1: triggers[i].x + triggers[i].width,
      y1: triggers[i].y + triggers[i].height,
      trigged: false,
      wasTrigged: false,
      endorsers: [],
      detectAnchorOnly: triggers[i].properties.detectAnchorOnly,
      forbidden: forbidden,
      required: required,
      newLoop: true,
      name: (triggers[i].hasOwnProperty("name")) ? triggers[i].name : null
    });
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
}
