Phaser.Plugin.TiledExtras.Triggers = function (game, map) {
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
}
