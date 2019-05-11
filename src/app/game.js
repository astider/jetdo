const background = require('./background');

class game {
  constructor(width, height) {
    this.background = new background(width, height);
  }

  update(deltaTime) {
  }

  render(ctx) {
    this.background.render();
  }
}

module.exports = game;
