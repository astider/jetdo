const data = require('../../data');

const { HP_DIRECTION } = require('../../constants');

class hp {
  /**
   * 
   * @param {String} keyPath path to player data
   */
  constructor(keyPath) {
    this.keyPath = keyPath;
    this.props = {};
    this.direction = null;
    this.width = 30;
    this.height = 30;
    this.startingX = 0;
    this.startingY = 0;

    this.draw = this.draw.bind(this);
    this.drawLeft = this.drawLeft.bind(this);
    this.drawRight = this.drawRight.bind(this);
  }

  drawLeft(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.startingX, this.startingY);
    ctx.lineTo(this.startingX, Math.floor(this.startingY - this.height * 0.75));
    ctx.lineTo(Math.floor(this.startingX - this.width * 0.25), this.startingY - this.height);
    ctx.lineTo(Math.floor(this.startingX - this.width * 0.5), Math.floor(this.startingY - this.height * 0.75));
    ctx.lineTo(this.startingX, this.startingY);
    ctx.fill();
  }

  drawRight(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.startingX, this.startingY);
    ctx.lineTo(this.startingX, Math.floor(this.startingY - this.height * 0.75));
    ctx.lineTo(Math.floor(this.startingX + this.width * 0.25), this.startingY - this.height);
    ctx.lineTo(Math.floor(this.startingX + this.width * 0.5), Math.floor(this.startingY - this.height * 0.75));
    ctx.lineTo(this.startingX, this.startingY);
    ctx.fill();
  }

  draw(ctx) {
    const { color, hp } = this.props;
    const window = data.get('ui.window');
    const marginFromBorder = 8;
    let spaceBetween = 10;
    let sign;
    if (this.direction === HP_DIRECTION.BOTTOM_LEFT) {
      sign = 1;
      this.startingX = spaceBetween + Math.floor(this.width / 2);
      this.startingY = window.h - marginFromBorder;
    } else if (this.direction === HP_DIRECTION.BOTTOM_RIGHT) {
      sign = -1;
      this.startingX = window.w - spaceBetween - Math.floor(this.width / 2);
      this.startingY = window.h - marginFromBorder;
    }

    ctx.fillStyle = color.hp;
    for (let i = 0; i < hp; i += 1) {
      this.drawLeft(ctx);
      this.drawRight(ctx);
      this.startingX += sign * (spaceBetween + this.width);
    }
  }

  init() {
    this.props = data.get(this.keyPath);
    this.direction = data.get(`ui.${this.keyPath}.hpDirection`);
  }

  update(deltaTime) {
    this.props = data.get(this.keyPath);
  }

  render(ctx) {
    this.draw(ctx);
  }
}

module.exports = hp;
