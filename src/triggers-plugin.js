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
