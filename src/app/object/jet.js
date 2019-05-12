const data = require('../../data');

class jet {
  /**
   * 
   * @param {String} keyPath 
   * @param {Boolean} [isInverseDirection]
   */
  constructor(keyPath, isInverseDirection) {
    this.keyPath = keyPath;
    this.isInverseDirection = isInverseDirection;
    this.props = {};

    this.drawHead = this.drawHead.bind(this);
    this.drawBody = this.drawBody.bind(this);
    this.drawWing = this.drawWing.bind(this);
    this.drawTail = this.drawTail.bind(this);
  }

  drawHead(ctx) {
    const { position, size, color } = this.props;

    ctx.fillStyle = color.head;
    ctx.beginPath();
    if (this.isInverseDirection) {
      ctx.arc(Math.floor(position.x - (size.w * 0.5)), position.y, Math.floor(size.h * 0.5), Math.PI * 1.5, Math.PI * 0.5, true);
    } else {
      ctx.arc(Math.floor(position.x + (size.w * 0.5)), position.y, Math.floor(size.h * 0.5), Math.PI * 1.5, Math.PI * 0.5);
    }
    ctx.fill();
  }

  drawBody(ctx) {
    const { position, size, color } = this.props;

    ctx.fillStyle = color.base;
    ctx.fillRect(Math.floor(position.x - (size.w * 0.5)), Math.floor(position.y - (size.h * 0.5)), size.w, size.h);
  }

  drawWing(ctx) {
    const { position, size, color } = this.props;

    ctx.fillStyle = color.base;
    ctx.beginPath();
    if (this.isInverseDirection) {
      ctx.moveTo(Math.floor(position.x - (size.w * 0.5)), position.y);
    } else {
      ctx.moveTo(Math.floor(position.x + (size.w * 0.5)), position.y);
    }
    ctx.lineTo(position.x, Math.floor(position.y - size.h * 1.5));
    ctx.lineTo(position.x, Math.floor(position.y + size.h * 1.5));
    ctx.fill();
  }

  drawTail(ctx) {
    const { position, size, color } = this.props;

    ctx.fillStyle = color.base;
    ctx.beginPath();
    if (this.isInverseDirection) {
      ctx.moveTo(position.x + Math.floor(size.w * 0.25), position. y);
      ctx.lineTo(position.x + Math.floor(size.w * 0.5), position.y - size.h);
      ctx.lineTo(position.x + Math.floor(size.w * 0.5), position.y + size.h);
    } else {
      ctx.moveTo(position.x - Math.floor(size.w * 0.25), position. y);
      ctx.lineTo(position.x - Math.floor(size.w * 0.5), position.y - size.h);
      ctx.lineTo(position.x - Math.floor(size.w * 0.5), position.y + size.h);
    }
    ctx.fill();
  }

  init() {
    this.props = data.get(this.keyPath);
  }

  update(deltaTime) {}

  render(ctx) {
    this.drawHead(ctx);
    this.drawBody(ctx);
    this.drawWing(ctx);
    this.drawTail(ctx);
  }
}

module.exports = jet;
