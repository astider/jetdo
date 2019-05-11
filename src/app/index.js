const data = require('../data');
const game = require('./game');

class app {
  constructor(width, height) {
    const gameLayerCanvas = document.getElementById('game-layer');
    gameLayerCanvas.style.width = `${width}px`;
    gameLayerCanvas.style.height = `${height}px`;
    this.gameLayer = gameLayerCanvas.getContext('2d');
    this.gameLayer.width = width;
    this.gameLayer.height = height;
    this.lastTime = 0;
    this.game = new game(width, height);

    this.loop = this.loop.bind(this);
  }

  loop(timestamp) {
    if(!data.get('status.running')) return;

    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.game.update(deltaTime);
    this.gameLayer.clearRect(0, 0, this.gameLayer.width, this.gameLayer.height);
    this.game.render(this.gameLayer);
    window.requestAnimationFrame(this.loop);
  }

  run() {
    data.init();
    window.requestAnimationFrame(this.loop);
  }
}

module.exports = app;
