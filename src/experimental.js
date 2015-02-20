
// FUNKAR INTE HELT. GRAVITATION...
Phaser.Tilemap.prototype.loadSprites = function(layerName, defaultImageKey, group) {
    if (!layerName) {
        layerName = "sprites";
    }
    var objectLayer = false;
    var keys = Object.keys(this.objects);

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
            this.createFromObjects(layerName, objectLayer[i].gid, imageKey, null, true, null, group, window[spriteObject]);
        }
    }
}




Phaser.Plugin.TiledExtras.Triggers = function(game) {
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
/*
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
}*/


// Maybees

function cloudHandler(object, layerObject, clouding){

    if (object.type == Phaser.SPRITE || object.type == Phaser.TILESPRITE)
    {
        this.collideSpriteVsTilemapLayer(layerObject, object, collideCallback, processCallback, callbackContext);
    }
    else if (object2.type == Phaser.GROUP || object2.type == Phaser.EMITTER)
    {
        this.collideGroupVsTilemapLayer(layerObject, object, collideCallback, processCallback, callbackContext);
    }


}

function cloudHandle_OLD(object1, layerObject){
    this._result = false;
    this._total = 0;

    else if (Array.isArray(object1))
    {
        for (var i = 0,  len = object1.length; i < len; i++)
        {
            this.collideHandler(object1[i], layerObject, null, null, null, true);
        }
    }
    else
    {
        this.collideHandler(object1, layerObject, null, null, null, true);
    }
    return (this._total > 0);
}
