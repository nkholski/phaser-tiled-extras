Phaser.Tilemap.prototype.addImageLayer = function(layerName, definedImageKey) {
  var layers = this.game.cache._tilemaps[map.key].data.layers;
  var game = this.game;
  var responseObjects = [];

  if (!this.hasOwnProperty("imageLayers")) {
    this.imageLayers = [];
  }

  for (var i in layers) {
    if (layers[i].type === "imagelayer") {
      if (!layerName || layerName === layers[i].name) {
        if (definedImageKey) {
          imageKey = definedImageKey;
        } else {
          // 1. Check if properties.key
          if (layers[i].properties.hasOwnProperty("key")) {
            imageKey = layers[i].properties.key;
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
        if (layers[i].properties.hasOwnProperty('bottom')) {
          object.y = this.heightInPixels - image.data.height + parseInt(layers[i].properties.bottom);

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
          object.width /= object.scale.x;
          object.height /= object.scale.y;
        }
        if (layers[i].properties.hasOwnProperty('scale.x')) {
          object.scale.x = parseFloat(layers[i].properties["scale.x"]);
        }
        if (layers[i].properties.hasOwnProperty('scale.y')) {
          object.scale.y = parseFloat(layers[i].properties["scale.y"]);
        }
        object.displace = {x: 0, y:0};
        object.velocity = {x: 0, y: 0};
        object.offset = {x: 0, y: 0};
        if (layers[i].properties.hasOwnProperty('velocity')) {
          object.velocity.x = parseFloat(layers[i].properties.velocity);
          object.velocity.y = parseFloat(layers[i].properties.velocity);
        }
        object.velocity.x = layers[i].properties.hasOwnProperty('velocity.x')? parseFloat(layers[i].properties["velocity.x"]): object.velocity.x;
        object.velocity.y = layers[i].properties.hasOwnProperty('velocity.y')? parseFloat(layers[i].properties["velocity.y"]): object.velocity.y;

        //object.angle = 5;

        object.alpha = layers[i].opacity;
        object.parallax = {
          x: 1,
          y: 1
        }
        console.log(layers[i].properties.parallax);
        if (layers[i].properties.hasOwnProperty('parallax') && parseFloat(layers[i].properties.parallax) > 0) {
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
