'use stict';

/**
* @author       Niklas Berg <emailto@niklasberg.se>
* @copyright    2015 Niklas Berg.
* @license      MIT
*/

/**
* Phaser Triggers
*
* Adds triggers to Phaser 2.x.
*
*/


/*
* A trigger is connected to specific tilemap. It may be loaded from tilemap data (Phaser.Tilemap.loadTriggers) or added programatically.
*
* @class Phaser.Trigger
* @constructor
* @param {object} map  - The map that trigger tile belongs to.
* @param {number} x - The x coordinate of the trigger (far left part of the area).
* @param {number} y - The y coordinate of the trigger (top part of the area).
* @param {number} width - Width of the trigger area.
* @param {number} height - Height of the trigger area.
* @param {string} key - unique key used to identify the trigger (optional).
* @param {string or function} callback - callback used by the trigger (optional).
*/

Phaser.Trigger = function(map, x, y, width, height, key, callback) {
    this.game = map.game;
    this.map = map;
    if (!map.triggers) {
        map.triggers = [];
    }
    if (!map.triggerKeys) {
        map.triggerKeys = [];
    }

    if (key) {
        if (this.map.triggerKeys.hasOwnProperty(key)) {
            console.warn("Duplicate trigger key: " + key + "\ngetTriggerByKey will fail!");
        }
    } else {
        var unknownCnt = 0;
        while(this.map.triggerKeys.hasOwnProperty("noKey"+unknownCnt)){unknownCnt++}
        key = "noKey"+unknownCnt;
    }

    this.key = key;
    this.area = {
        x: x,
        y: y,
        width: width,
        height: height
    };
    Object.defineProperty(this.area, "right", {
        get: function() {
            return this.x + this.width;
        },
        set: function(right) {
            this.width = right - this.x;
        }
    });
    Object.defineProperty(this.area, "bottom", {
        get: function() {
            return this.y + this.height;
        },
        set: function(bottom) {
            this.height = bottom - this.x;
        }
    });

    this.callback = null;


    if (callback) {
        this.setCallback(callback);
    }
    this.arguments = [];
    if (arguments) {
        this.addArgument(arguments);

        var argKeys = Object.keys(arguments);
        for (var i in argKeys) {


            if (argKeys[i] !== "callback" && argKeys[i] !== "required") { // Ska göras på map-sidan
                this.addArgument(argKeys[i], arguments[argKeys[i]]);
            }
        }
    }
    this.enabled = true;
    this.required = null; // bara ett värde
    this.trigged = false;
    this.wasTrigged = false;
    this.endorsers = [];
    this.detectAnchorOnly = true; // Default will switch to false when actually implemented
    this._resetEndorsers = true;
    this.map.triggers.push(this);
    this.map.triggerKeys[key] = this.map.triggers.length - 1;
}

Phaser.Trigger.prototype = {
    setCallback: function(callback) {
        if (typeof(callback) === "function") {
            this.callback = callback;
        } else if (typeof(callback) === "string") {
            this.callback = window;
            var parts = callback.split(".");
            for (var i in parts) {
                if (this.callback[parts[i]] != "undefined") {
                    this.callback = this.callback[parts[i]];
                } else {
                    this.callback = null;
                    break;
                }
            }
        }
        else{
          console.warn("Trigger callback needs to be string or function!")

        }
    },
    addArgument: function(variable, value) {
        this.arguments[variable] = value;
    },
    setRequired: function(property, operator, value) {
        if (("<=|>=|==|<|>|!=").indexOf(operator) > -1) { // supported operators: <= >= == < > !=
            this.required = {
                property: property,
                operator: operator,
                value: value};
        } else {
            console.warn("Operator " + operator + " is not supported!");
        }
    }
}

Phaser.Trigger.prototype.constructor = Phaser.Trigger;

Phaser.Tilemap.prototype.getTriggerByKey = function(key) {
    return (key in this.triggerKeys) ? this.triggerKeys[key] : null;
};

Phaser.Tilemap.prototype.checkTriggers = function(object) {
    /**
     * Check if object triggers the triggers and calls callbacks.
     * @param {object} [object=null] - Sprite or Group to check.
     *
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
            }; // TODO: Untested. Possible bug if object is within an group.
            objectArray = [object];
            break;
        case 7: // Group
            offset = { // Adjust to group position
                x: object.x,
                y: object.y
            };
            objectArray = object.children;
            break;
    }

    for (var o in objectArray) {
        object = objectArray[o];

        var objectBounds = {
            left: object.body.position.x,
            right: object.body.position.x + object.body.width - (Math.abs(object.width) - object.body.width),
            top: object.body.position.y,
            bottom: object.body.position.y + object.body.height - (Math.abs(object.height) - object.body.height),
            anchorX: object.x,
            anchorY: object.y
        };

        for (var i in this.triggers) {
            if (!this.triggers[i].enabled) {
                continue;
            }

            // If required is set but not met, no further tests will be made. A cheap possibility to rule out triggers.
            if (this.triggers[i].required) {
                switch (this.triggers[i].required.operator) {
                    case "==":
                        if (object[this.triggers[i].required.property] != this.triggers[i].required.value) {
                            continue;
                        }
                        break;
                    case "!=":
                        if (object[this.triggers[i].required.property] != this.triggers[i].required.value) {
                            continue;
                        }
                        break;
                    case "<=":
                        if (object[this.triggers[i].required.property] > this.triggers[i].required.value) {
                            continue;
                        }
                        break;
                    case ">=":
                        if (object[this.triggers[i].required.property] < this.triggers[i].required.value) {
                            continue;
                        }
                        break;
                    case "<":
                        if (object[this.triggers[i].required.property] >= this.triggers[i].required.value) {
                            continue;
                        }
                        break;
                    case ">":
                        if (object[this.triggers[i].required.property] <= this.triggers[i].required.value) {
                            continue;
                        }
                        break;
                }

            }

            if (this.triggers[i]._resetEndorsers) {
                this.triggers[i].wasTrigged = this.triggers[i].trigged;
                this.triggers[i].endorsers = [];
                this.triggers[i]._resetEndorsers = false;
            }

            // detectAnchorOnly, Quicker
            if (objectBounds.anchorX < this.triggers[i].area.right && objectBounds.anchorX > this.triggers[i].area.x && objectBounds.anchorY < this.triggers[i].area.bottom && objectBounds.anchorY > this.triggers[i].area.y) {
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

            /*
            // TODO: Kolla om mitten kolliderar, annars vilken sida det är om rutan och beräkna från den.
            // Detect body
            //if(checkCoord(x,y)){}
            game.debug.geom({
              x: objectBounds.anchorX,
              y: objectBounds.anchorY,
            }, "rgba(0,0,255,1)" , true, 3);

            game.debug.geom({
              x: objectBounds.left,
              y: objectBounds.bottom,
            }, "rgba(255,0,0,1)" , true, 3);
            game.debug.geom({
              x: objectBounds.right,
              y: objectBounds.bottom,
            }, "rgba(0,255,0,1)" , true, 3);
            if(checkCoord(objectBounds.right, objectBounds.top) || checkCoord(objectBounds.right, objectBounds.bottom) || checkCoord(objectBounds.left, objectBounds.top) || checkCoord(objectBounds.left, objectBounds.bottom)){
              within=true;
            }

            //if(this.triggers[i].area.x<objectBounds.right && object.objectBounds.left)
            var checkCoord = function(x,y){
                return ((x < this.triggers[i].area.right && x > this.triggers[i].area.x && y < this.triggers[i].area.bottom && y > this.triggers[i].area.y))
            };*/




        }
    }
};



Phaser.Tilemap.prototype.loadTriggers = function(triggerLayer) {

    triggerLayer = (triggerLayer) ? triggerLayer : "triggers";

    this.setCurrentMap(); //arbeta bort

    var triggers = this.objects[triggerLayer];
    var args, argKeys;
    var required = null;

    for (var i = 0, len = triggers.length; i < len; i++) {


        if(!triggers[i].hasOwnProperty("properties")){
          triggers[i].properties = {};
        }
        args = {};
        argKeys = Object.keys(triggers[i].properties);



        triggers[i].x = (typeof(triggers[i].x) === "undefined") ? 0 : triggers[i].x; // Tiled wont set any x-value if x==0. x<0 is OK.
        triggers[i].y = (typeof(triggers[i].y) === "undefined") ? 0 : triggers[i].y; // Tiled wont set any y-value if y==0. y<0 is OK.


        if(!triggers[i].properties.hasOwnProperty("key")){
            triggers[i].properties.key = triggers[i].name;
        }

        var trigger = new Phaser.Trigger(this, triggers[i].x, triggers[i].y, triggers[i].width, triggers[i].height, triggers[i].properties.key);

        // Custom arguments
        for (var i2 in argKeys) {
            if (argKeys[i2] !== "callback" && argKeys[i2] !== "required") {
                trigger.addArgument(argKeys[i2], triggers[i].properties[argKeys[i2]]);
            }
        }

        // Required value
        if (triggers[i].properties.hasOwnProperty("required")) {
            var operators = ["<=", ">=", "==", "<", ">", "!=", false];
            for (var i2 = 0; i2 < 7; i2++) {
                if (triggers[i].properties.required.indexOf(operators[i2]) > -1) {
                    break;
                }
            }
            if (operators[i2]) {
                required = triggers[i].properties.required.split(operators[i2]);
                required[1] = required[1].replace(/\"/g, "").replace(/\'/g, "").replace(/\=\=\=/g, "==");
                if (parseFloat(required[1]) == required[1]) { // Floats will be floats...
                    required[1] = parseFloat(required[1]);
                }
                required[1] = (required[1] === "true") ? true : ((required[1] === "false") ? false : required[1]);
                trigger.setRequired(required[0], operators[i2], required[1]);
            }
        }


        // Detection body/point
        if (triggers[i].properties.hasOwnProperty("detectAnchorOnly")) {
            if (triggers[i].properties.detectAnchorOnly !== "false") {
                trigger.detectAnchorOnly = true;
            }
        } else {
            trigger.detectAnchorOnly = false;
        }

        // Fix callback
        var callback = null;
        if (triggers[i].properties.hasOwnProperty("callback")) {
            trigger.setCallback(triggers[i].properties.callback);
        }



    }

};
