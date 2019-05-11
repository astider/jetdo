const data = require('../data');
const game = require('./game');

class app {
  constructor() {
    this.ctx = document.getElementById('canvas').getContext('2d');
    this.ctx.width = window.innerWidth;
    this.ctx.height = window.innerHeight;
    this.lastTime = 0;
    this.game = new game();

    this.loop = this.loop.bind(this);
  }

  loop(timestamp) {
    if(!data.get('status.running')) return;

    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.game.update(deltaTime);
    this.ctx.clearRect(0, 0, this.ctx.width, this.ctx.height);
    this.game.render(this.ctx);
    window.requestAnimationFrame(this.loop);
  }

  run() {
    data.init();
    window.requestAnimationFrame(this.loop);
  }
}

module.exports = {
  run: () => (new app()).run(),
};
