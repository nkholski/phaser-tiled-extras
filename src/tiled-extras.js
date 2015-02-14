/**
 * A Sample Plugin demonstrating how to hook into the Phaser plugin system.

EN enda init som fixar updateCollision utifrån map och Triggers


Funition
CollisionReinit(x0,x1,y0,y1) = Gör kontroll av tile och skapar collision. Tex när nya har klistrats in.
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



Phaser.Tilemap.prototype.addSpriteFunction = function() {
  map = this;
  //console.log(sayMap.apply(null, map))
  //Phaser.Sprite.prototype.sayMap = sayMap.apply(null, map);
  sayMap = function(map) {
    console.log(this);
    console.log(map);
  };

  Phaser.Sprite.prototype.sayMap = sayMap.bind(null, this);

  //    sayMap.bind(this, this);
}

Phaser.Triggers = {
  getTriggerByName: {

  }


}


Phaser.Tilemap.prototype.addImageLayer = function(layerName, definedImageKey) {
  var layers = this.game.cache._tilemaps[map.key].data.layers;
  var game = this.game;
  var responseObjects = [];

  if(!this.hasOwnProperty("imageLayers")){
    this.imageLayers=[];
  }

  for (var i in layers) {
    if (layers[i].type === "imagelayer") {
      if (!layerName || layerName === layers[i].name) {
        if (definedImageKey) {
          imageKey = definedImageKey;
        } else {
          // 1. Check if properties.key
          if(layers[i].properties.hasOwnProperty("key")){
            imageKey = layers[i].properties.key;
            console.log(imageKey);
          }
          // 2. Check if image key === layer name

          // 3. Check if image filename === layer image filename
        }
        image = game.cache._images[imageKey];

        object = game.add.tileSprite(layers[i].x, layers[i].y, image.data.width, image.data.height, imageKey);

        object.posFixedToCamera = {
          x: false,
          y: false,
        }
        object.relativePosition = {
          x: object.x,
          y: object.y
        }
        if(layers[i].properties.hasOwnProperty('bottom')){
          object.y = this.heightInPixels-image.data.height+parseInt(layers[i].properties.bottom);

        }

        if (layers[i].properties.hasOwnProperty('imageRepeat')) {
          switch (layers[i].properties.imageRepeat) {
            case 'repeat':
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
          }
        }

        if (layers[i].properties.hasOwnProperty('tint')) {
          object.tint = layers[i].properties.tint;
        }

        // Flip with Scale not working

        if (layers[i].properties.hasOwnProperty('scale')) {
          object.scale.x = parseFloat(layers[i].properties.scale);
          object.scale.y = parseFloat(layers[i].properties.scale);
          object.width/=object.scale.x;
          object.height/=object.scale.y;
        }
        if (layers[i].properties.hasOwnProperty('scale.x')) {
          object.scale.x = parseFloat(layers[i].properties["scale.x"]);
        }
        if (layers[i].properties.hasOwnProperty('scale.y')) {
          object.scale.y = parseFloat(layers[i].properties["scale.y"]);
        }

        //object.angle = 5;

        object.alpha = layers[i].opacity;
        object.parallax = {
          x: 1,
          y: 1
        }
        console.log(layers[i].properties.parallax);
        if(layers[i].properties.hasOwnProperty('parallax') && parseFloat(layers[i].properties.parallax)>0){
          console.log("parallax");
          object.parallax = {
            x: parseFloat(layers[i].properties.parallax),
            y: parseFloat(layers[i].properties.parallax)
          }

        }
        responseObjects.push(object);
        this.imageLayers.push(object);
      }
    }
  }
  if (responseObjects.length === 0) {
    return false;
  } else if (responseObjects.length === 1) {
    return responseObjects[0];
  } else {
    return responseObjects;
  }
};


Phaser.Tilemap.prototype.checkTriggers = function(object) {
  /* Object:
  Sprite
  Group
  Phaser.point / {x,y}
  */
  var offset, objectArray, objectBounds;

  if (!this.hasOwnProperty("triggers")) {
    console.log("checkTriggers called before defineTriggers!");
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
      if (map.triggers[i].newLoop) {
        map.triggers[i].wasTrigged = map.triggers[i].trigged;
        map.triggers[i].endorsers = [];
        map.triggers[i].newLoop = false;
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
        triggers[this.triggers[i].function](this.triggers[i], object);
      } else if (this.triggers[i].wasTrigged && this.triggers[i].endorsers.length === 0) {
        this.triggers[i].trigged = false;
        triggers[this.triggers[i].function](this.triggers[i], object);
      }

    }
  }
}



Phaser.Tilemap.prototype.defineTriggers = function() {
  if (!this.objects.hasOwnProperty("triggers")) {
    this.triggers = null;
    return;
  }
  this.triggers = [];
  var triggers = this.objects.triggers,
    args, argNames, forbidden = null,
    required = null;

  for (var i = 0, len = triggers.length; i < len; i++) {
    if (!triggers[i].properties.function) {
      console.log("Error: No function for trigger starting at x=" + triggers[i].x + ", y=" + triggers[i].y);
      continue;
    }

    args = {};
    argNames = Object.keys(triggers[i].properties);

    for (var i2 in argNames) {
      if (argNames[i2] !== "function" && argNames[i2] !== "required" && argNames[i2] !== "forbidden") {
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

    this.triggers.push({
      function: triggers[i].properties.function,
      arguments: args,
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
      newLoop: true
    });
  }
  if (this.triggers.length === 0) {
    this.triggers = null;
  }
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




Phaser.Plugin.TiledExtras = function(game, parent) {};
Phaser.Plugin.TiledExtras.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.TiledExtras.prototype.constructor = Phaser.Plugin.TiledExtras;
Phaser.Plugin.TiledExtras.prototype.postUpdate = function() {
  if (map.hasOwnProperty("triggers")) {
    for (var i in map.triggers) {
      triggers[map.triggers[i].function](map.triggers[i], null, true);
      map.triggers[i].newLoop = true;
    }
  }
  if(map.hasOwnProperty("imageLayers")){
    for (var i in map.imageLayers) {
        if(map.imageLayers[i].posFixedToCamera.x){
          map.imageLayers[i].tilePosition.x += (map.imageLayers[i].x - map.game.camera.x)*map.imageLayers[i].parallax.x;
          map.imageLayers[i].x = map.game.camera.x;
        }
        if(map.imageLayers[i].posFixedToCamera.y){
          map.imageLayers[i].tilePosition.y += (map.imageLayers[i].y - map.game.camera.y)*map.imageLayers[i].parallax.y;
          map.imageLayers[i].y = map.game.camera.y;
        }
    }

  }
}
