Phaser.Plugin.Triggers = function(game, parent) {
    /**
    *
    * Plugin to add support for triggers defined in a Tiled object layer.
    *
    * The plugin object construtor, called by Phaser through Phaser.Game.add.plugin()
    *
    */
    this.game = game;
    this.name = "triggers";
    this.map = null;
    this.parent = parent;
};
Phaser.Plugin.Triggers.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.Triggers.prototype.constructor = Phaser.Plugin.Triggers;
Phaser.Plugin.Triggers.prototype.postUpdate = function() {
    /**
    * Update loop for Triggers and imageLayers with parallax or velocity support.
    *
    */
    var map = this.map;

    if (map.hasOwnProperty("triggers")) {
        for (var i in map.triggers) {
            if (map.triggers[i].enabled && map.triggers[i].callback) {
                map.triggers[i].callback(map.triggers[i], null, true);
            }
            map.triggers[i].newLoop = true;
        }
    }
};

Phaser.Tilemap.prototype.setCurrentMap = function() {
    /**
    * Internal function to set current tilemap as Phaser.Plugin.Triggers.map
    *
    */
    var game = this.game;
    for (var i in game.plugins.plugins) {
        if (game.plugins.plugins[i].hasOwnProperty("name") && game.plugins.plugins[i].name === "triggers") {
            game.plugins.plugins[i].map = this;
            return;
        }
    }
};

Phaser.Tilemap.prototype.getTriggerByName = function(name) {
    return (name in this.triggerNames) ? this.triggerNames[name] : false;
};

Phaser.Tilemap.prototype.checkTriggers = function(object) {
    /**
     * Check if object triggers the triggers and calls callbacks.
     * @param {object} [object=null] - Sprite or Group to check.
     *
     * TODO: Spritetiles? Call for a Phaser.point without graphical object?
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

            // Check Required
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
            if (objectBounds.anchorX < this.triggers[i].area.x2 && objectBounds.anchorX > this.triggers[i].area.x && objectBounds.anchorY < this.triggers[i].area.y2 && objectBounds.anchorY > this.triggers[i].area.y) {
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
                return ((x < this.triggers[i].area.x2 && x > this.triggers[i].area.x && y < this.triggers[i].area.y2 && y > this.triggers[i].area.y))
            };*/




        }
    }
};



Phaser.Tilemap.prototype.defineTriggers = function() {
    this.setCurrentMap();
    if (!this.objects.hasOwnProperty("triggers")) {
        this.triggers = null;
        this.triggerNames = null;
        return;
    }
    this.triggers = [];
    this.triggerNames = [];

    var triggers = this.objects.triggers;
    var args, argNames;
    var required = null;

    for (var i = 0, len = triggers.length; i < len; i++) {
        args = {};
        argNames = Object.keys(triggers[i].properties);

        triggers[i].x = (typeof(triggers[i].x)==="undefined") ? 0:triggers[i].x; // Tiled wont set any x-value if x==0. x<0 is OK.
        triggers[i].y = (typeof(triggers[i].y)==="undefined") ? 0:triggers[i].y; // Tiled wont set any y-value if y==0. y<0 is OK.

        var trigger = {
            name: (triggers[i].hasOwnProperty("name")) ? triggers[i].name : null,
            enabled: (!triggers[i].properties.hasOwnProperty("enabled") || (triggers[i].properties.enabled !== "true")),
            callback: null,
            args: [],
            area: {
                x: triggers[i].x,
                y: triggers[i].y,
                width: triggers[i].width,
                height: triggers[i].height,
                x2: triggers[i].x + triggers[i].width,
                y2: triggers[i].y + triggers[i].height
            },
            trigged: false,
            wasTrigged: false,
            endorsers: [],
            detectAnchorOnly: triggers[i].properties.detectAnchorOnly,
            required: null,
            _resetEndorsers: true
        };

        // Custom arguments
        for (var i2 in argNames) {
            if (argNames[i2] !== "callback" && argNames[i2] !== "required") {
                args[argNames[i2]] = triggers[i].properties[argNames[i2]];
            }
        }
        trigger.args = args;

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
                trigger.required = {
                    property: required[0],
                    operator: operators[i2], // Supported: <= >= == < > !=
                    value: (required[1] === "true") ? true : ((required[1] === "false") ? false : required[1])
                };
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
            callback = window;
            var parts = triggers[i].properties.callback.split(".");
            for (var i2 in parts) {
                if (callback[parts[i2]] != "undefined") { // WAS: callback.hasOwnProperty(parts[i2])
                    callback = callback[parts[i2]];
                } else {
                    callback = null;
                    console.warn("Trigger callback not found: " + parts[i2]);
                    break;
                }
            }
            trigger.callback = callback;
        }

        this.triggers.push(trigger);

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
};
