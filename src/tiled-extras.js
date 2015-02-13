/**
 * A Sample Plugin demonstrating how to hook into the Phaser plugin system.

EN enda init som fixar updateCollision utifrån map och Triggers


Funition
CollisionReinit(x0,x1,y0,y1) = Gör kontroll av tile och skapar collision. Tex när nya har klistrats in.
Callback för tiles

 */

Phaser.Tilemap.prototype.checkTriggers = function(object) {
  /* Object:
  Sprite
  Group
  Phaser.point / {x,y}
  */
  var offset, objectArray, objectBounds;

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


    for (var i in map.triggers) {
      // detectAnchorOnly
      if (objectBounds.anchorX < map.triggers[i].x1 && objectBounds.anchorX > map.triggers[i].x0 && objectBounds.anchorY < map.triggers[i].y1 && objectBounds.anchorY > map.triggers[i].y0) {
        map.triggers[i].trigged = true;
        map.triggers[i].endorsed = true;
        triggers[map.triggers[i].function](map.triggers[i], object);
      } else if (map.triggers[i].wasTrigged && !map.triggers[i].endorsed) {
        map.triggers[i].trigged = false;
        triggers[map.triggers[i].function](map.triggers[i], object);
      }
      if (map.triggers[i].trigged || (!map.triggers[i].endorsed && !map.triggers[i].trigged)) {
        map.triggers[i].wasTrigged = map.triggers[i].trigged;
      }
    }
  }
}

Phaser.Sprite.prototype.checkTriggers = function() {
  console.log(this);
}

Phaser.World.prototype.checkTriggers = function() {
  console.log(this);
  console.log("YES")
}

//    this.tiledExtras.checkTriggers(sprite);

/*
{

Phaser.Physics.Arcade.prototype.constructor = Phaser.Physics.Arcade;
 Phaser.Physics.Arcade.prototype = {



  skrivut: function(){
    console.log(this);


  }



}*/


var triggers = {
  replaceTiles: function(trigger, x, y) {
    if (trigger.trigged === trigger.wasTrigged) {
      return;
    }
    var coords = map.triggers[0].arguments.box.split(",");
    coords = coords.map(function(x) {
      return parseInt(x, 10);
    });
    if (trigger.trigged) {

      for (tx = coords[0] - 1; tx < (coords[0] - 1 + coords[2]); tx++) {
        for (ty = coords[1] - 1; ty < (coords[1] - 1 + coords[3]); ty++) {
          trigger.originalTile = map.getTile(tx, ty, layers[0]);
          map.putTile(21, tx, ty);
        }
      }
    } else {
      for (tx = coords[0] - 1; tx < (coords[0] - 1 + coords[2]); tx++) {
        for (ty = coords[1] - 1; ty < (coords[1] - 1 + coords[3]); ty++) {
          map.putTile(trigger.originalTile, tx, ty);
        }
      }
    }
  }




}

var triggerPlugin = {
  init: function(map) {
    if (!map.objects.hasOwnProperty("triggers")) {
      return;
    }
    console.log("TRIGGI");
    var triggers = map.objects.triggers,
      args = "";
    map.triggers = [];
    for (var i = 0, len = triggers.length; i < len; i++) {
      args = {};
      argNames = Object.keys(triggers[i].properties);

      for (var i2 in argNames) {
        if (argNames[i2] !== "function") {
          args[argNames[i2]] = triggers[i].properties[argNames[i2]];
        }
      }

      if (triggers[i].properties.hasOwnProperty("detectAnchorOnly")) {
        if (triggers[i].properties.detectAnchorOnly !== "false") {
          triggers[i].properties.detectAnchorOnly = true;
        }
      } else {
        triggers[i].properties.detectAnchorOnly = false;
      }

      map.triggers.push({
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
        endorsed: false,
        detectAnchorOnly: triggers[i].properties.detectAnchorOnly
      });


    }


  },
  triggerChk: function(map, x, y) {
    for (var i in map.triggers) {

      // detectAnchorOnly
      if (x < map.triggers[i].x1 && x > map.triggers[i].x0 && y < map.triggers[i].y1 && y > map.triggers[i].y0) {
        map.triggers[i].trigged = true;
        triggers[map.triggers[i].function](map.triggers[i], x, y);
      } else if (map.triggers[i].wasTrigged) {
        map.triggers[i].trigged = false;
        triggers[map.triggers[i].function](map.triggers[i], x, y);
      }
      map.triggers[i].wasTrigged = map.triggers[i].trigged;
    }
  }
}






var tiledExtras = {

  updateCollision: function(layers) { // om layer är lager och inte array => layers= [layers];
    var layer, tile, dirs = ["Up", "Right", "Down", "Left"];
    var tempCol = [false, false, false, false];

    for (var i in layers) {
      layer = layers[i];
      //if(map.layers[i][i]!==)
      for (var y = 0; y < layer.map.height; y++) {
        for (var x = 0; x < layer.map.width; x++) {
          tempCol = [false, false, false, false];
          tile = layers[0].map.getTile(x, y, layers[0]);

          if (!tile) {
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

  },
};




Phaser.Plugin.TiledExtras = function(game, parent) {
  this.collisionsInitiated = false;
};

//	Extends the Phaser.Plugin template, setting up values we need
Phaser.Plugin.TiledExtras.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.TiledExtras.prototype.constructor = Phaser.Plugin.TiledExtras;

/**
 * This is run when the plugins update during the core game loop.
 */
Phaser.Plugin.TiledExtras.prototype.update = function() {

  //triggerPlugin.triggerChk(map, ship.x, ship.y);
};
Phaser.Plugin.TiledExtras.prototype.postUpdate = function() {
  // Reset endorsed. Endorsed prevents triggers to be untrigged by any object as long at at least one other still triggers it.
  for (var i in map.triggers) {
    map.triggers[i].endorsed = false;
  }
}
