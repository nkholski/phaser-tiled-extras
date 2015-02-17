// Example triggers

var triggers = {
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
