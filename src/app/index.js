const data = require('../data');
const game = require('./game');

class app {
  constructor(width, height) {
    this.framerateLayer = document.getElementById('framerate-layer');
    const gameLayerCanvas = document.getElementById('game-layer');
    gameLayerCanvas.width = width;
    gameLayerCanvas.height = height;
    this.gameLayer = gameLayerCanvas.getContext('2d');
    this.frameAcc = 0;
    this.lastTime = 0;
    this.game = new game(width, height);

    this.loop = this.loop.bind(this);
  }

  loop(timestamp) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.frameAcc += 1;

    this.game.update(deltaTime);
    this.gameLayer.clearRect(0, 0, this.gameLayer.width, this.gameLayer.height);
    this.game.render(this.gameLayer);
    window.requestAnimationFrame(this.loop);
  }

  run() {
    data.init();
    this.game.init();

    setInterval(() => {
      this.framerateLayer.innerHTML = `${this.frameAcc} FPS`;
      this.frameAcc = 0;
    }, 1000);

    window.requestAnimationFrame(this.loop);
  }
}

module.exports = app;
