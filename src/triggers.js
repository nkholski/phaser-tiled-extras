Phaser.Tilemap.prototype.getTriggerByName = function(name) {
    return (name in this.triggerNames) ? this.triggerNames[name] : false;
};

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
            }; // TODO: BUG??? UNTESTED Men om den är i en group??!
            objectArray = [object];
            break;
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
            anchorY: object.y + offset.y
        };

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
};



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
            };
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
            enabled: (!triggers[i].properties.hasOwnProperty("enabled") || (triggers[i].properties.enabled !== "true")),
            callback: callback,
            args: args,
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
};
