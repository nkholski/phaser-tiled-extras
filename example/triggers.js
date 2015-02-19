// Example triggers

var triggers = {
  clockWiseRunVars: {
    lastDirection: null,
    count: 0
  },
  clockWiseRun: function(trigger, object, lastCall) {
    // We're not interested in the postUpdate-call
    if (lastCall) {
      return;
    }
    // Only change if it's Mario, else change trigger status to false.
    if (!object || object.name != "Mario") {
      // If something else than Mario trigged it, kick it out again!
      if (trigger.trigged) {
        trigger.endorsers.pop();
        if (trigger.endorsers.length == 0) {
          trigger.trigged = false;
        }
      }
      return;
    }
    // OK we're only interested in triggering, not leaving the trigger...
    if (!trigger.trigged) {
      return;
    }
    switch (trigger.arguments.direction + triggers.clockWiseRunVars.lastDirection) {
      case "nw":
      case "en":
      case "se":
      case "ws":
        // moved clockwise!
        triggers.clockWiseRunVars.count++;
        break;
      case "nn":
      case "ee":
      case "ss":
      case "ww":
        // Ignore it
        break;
      default:
        // moving in the wrong direction
        triggers.clockWiseRunVars.count = 0;
    }
    triggers.clockWiseRunVars.lastDirection = trigger.arguments.direction;

    if(triggers.clockWiseRunVars.count>6){
      game.add.tween(map.getImageLayerByName("motherBrain")).to( { alpha: 1 }, 2000, Phaser.Easing.Bounce.In, true);
      trigger.enabled = false;
    }


  },
  replaceTiles: function(trigger, object, lastCall) {
    if (object) {
      // Object is now infected by the trigger and cured if not on trigger
      object.infected = trigger.trigged;

    }

    // Nothing more to do with the sprites, so only postUpdate lastCall will do
    if (!lastCall) {
      return;
    }

    // Demand at least two separate objects triggering the trigger, or set it to false.
    if (trigger.endorsers.length !== 2) {
      trigger.trigged = false;
    }

    // If the trigger is as it was on last update there's nothing to do
    if (trigger.trigged === trigger.wasTrigged) {
      return;
    }

    // Custom property, count all times it has been trigged from untrigged
    if (trigger.trigged) {
      trigger.count = (trigger.hasOwnProperty("count")) ? trigger.count + 1 : 1;
    }

    // box was set as property in Tiled
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
    } else if (!trigger.trigged) {
      for (tx = coords[0] - 1; tx < (coords[0] - 1 + coords[2]); tx++) {
        for (ty = coords[1] - 1; ty < (coords[1] - 1 + coords[3]); ty++) {
          map.putTile(trigger.originalTile, tx, ty);
        }
      }
    }
  }




}
