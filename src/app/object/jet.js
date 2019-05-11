const data = require('../../data');

class jet {
  constructor(keyPath) {
    this.keyPath = keyPath;
    this.jetData = {};

    this.drawBody = this.drawBody.bind(this);
    this.drawWing = this.drawWing.bind(this);
    this.drawTail = this.drawTail.bind(this);
  }

  drawBody(ctx) {
    const { position, size, color } = this.jetData;

    ctx.fillStyle = color;
    ctx.fillRect(position.x - (size.w / 2), position.y - (size.h / 2), size.w, size.h);
  }

  drawWing(ctx) {

  }

  drawTail(ctx) {

  }

  init() {
    this.jetData = data.get(this.keyPath);
  }

  update(deltaTime) {}

  render(ctx) {
    this.drawBody(ctx);
  }
}

module.exports = jet;
