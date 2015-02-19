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
