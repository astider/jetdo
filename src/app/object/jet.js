const data = require('../../data');
const event = require('../../event');

const gameBorderWidth = 10;

const localRules = {
  isOverflowX: (x, size, window) => {
    const xRange = [gameBorderWidth + size.w * 0.5, window.w - gameBorderWidth - size.w * 0.5];
    return x < xRange[0] || x > xRange[1] ? true : false;
  },
  isOverflowY: (y, size, window) => {
    const yRange = [gameBorderWidth + size.h * 0.5, window.h - gameBorderWidth - size.h * 0.5];
    return y < yRange[0] || y > yRange[1] ? true : false;
  },
};

class jet {
  /**
   * 
   * @param {String} keyPath path to player data
   * @param {Boolean} [isInverseDirection]
   */
  constructor(keyPath, isInverseDirection) {
    this.keyPath = keyPath;
    this.name = keyPath.replace('.', '_');
    this.isInverseDirection = isInverseDirection;
    this.props = {};
    this.isMovingUp = false;
    this.isMovingLeft = false;
    this.isMovingRight = false;
    this.isMovingDown = false;

    this.drawHead = this.drawHead.bind(this);
    this.drawBody = this.drawBody.bind(this);
    this.drawWing = this.drawWing.bind(this);
    this.drawTail = this.drawTail.bind(this);
    this.addKeyDownEvent = this.addKeyDownEvent.bind(this);
    this.addKeyUpEvent = this.addKeyUpEvent.bind(this);
  }

  drawHead(ctx) {
    const { position, size, color } = this.props;

    ctx.fillStyle = color.head;
    ctx.beginPath();
    if (this.isInverseDirection) {
      ctx.arc(Math.floor(position.x - (size.w * 0.5)), Math.floor(position.y), Math.floor(size.h * 0.5), Math.PI * 1.5, Math.PI * 0.5, true);
    } else {
      ctx.arc(Math.floor(position.x + (size.w * 0.5)), Math.floor(position.y), Math.floor(size.h * 0.5), Math.PI * 1.5, Math.PI * 0.5);
    }
    ctx.fill();
  }

  drawBody(ctx) {
    const { position, size, color } = this.props;

    ctx.fillStyle = color.base;
    ctx.fillRect(Math.floor(position.x - (size.w * 0.5)), Math.floor(position.y - (size.h * 0.5)), Math.floor(size.w), Math.floor(size.h));
  }

  drawWing(ctx) {
    const { position, size, color } = this.props;

    ctx.fillStyle = color.base;
    ctx.beginPath();
    if (this.isInverseDirection) {
      ctx.moveTo(Math.floor(position.x - (size.w * 0.5)), Math.floor(position.y));
    } else {
      ctx.moveTo(Math.floor(position.x + (size.w * 0.5)), Math.floor(position.y));
    }
    ctx.lineTo(Math.floor(position.x), Math.floor(position.y - size.h * 1.5));
    ctx.lineTo(Math.floor(position.x), Math.floor(position.y + size.h * 1.5));
    ctx.fill();
  }

  drawTail(ctx) {
    const { position, size, color } = this.props;

    ctx.fillStyle = color.base;
    ctx.beginPath();
    if (this.isInverseDirection) {
      ctx.moveTo(Math.floor(position.x + size.w * 0.25), Math.floor(position. y));
      ctx.lineTo(Math.floor(position.x + size.w * 0.5), Math.floor(position.y - size.h));
      ctx.lineTo(Math.floor(position.x + size.w * 0.5), Math.floor(position.y + size.h));
    } else {
      ctx.moveTo(Math.floor(position.x - size.w * 0.25), Math.floor(position. y));
      ctx.lineTo(Math.floor(position.x - size.w * 0.5), Math.floor(position.y - size.h));
      ctx.lineTo(Math.floor(position.x - size.w * 0.5), Math.floor(position.y + size.h));
    }
    ctx.fill();
  }

  addKeyDownEvent() {
    const { keyBinding } = this.props;
    event.add(
      'keydown',
      `${this.name}_keydown`,
      [
        ...keyBinding.up,
        ...keyBinding.down,
        ...keyBinding.left,
        ...keyBinding.right,
      ],
      (e) => {
        if (keyBinding.up.includes(e.key)) this.isMovingUp = true;
        if (keyBinding.down.includes(e.key)) this.isMovingDown = true;
        if (keyBinding.left.includes(e.key)) this.isMovingLeft = true;
        if (keyBinding.right.includes(e.key)) this.isMovingRight = true;
      }
    );
  }

  addKeyUpEvent() {
    const { keyBinding } = this.props;
    event.add(
      'keyup',
      `${this.name}_keyup`,
      [
        ...keyBinding.up,
        ...keyBinding.down,
        ...keyBinding.left,
        ...keyBinding.right,
      ],
      (e) => {
        if (keyBinding.up.includes(e.key)) this.isMovingUp = false;
        if (keyBinding.down.includes(e.key)) this.isMovingDown = false;
        if (keyBinding.left.includes(e.key)) this.isMovingLeft = false;
        if (keyBinding.right.includes(e.key)) this.isMovingRight = false;
      }
    );
  }

  init() {
    this.props = data.get(this.keyPath);
    this.addKeyUpEvent();
    this.addKeyDownEvent();
  }

  update(deltaTime) {
    this.props = data.get(this.keyPath);
    const { speed, movement, position, size } = data.get(this.keyPath);
    const window = data.get('ui.window');

    const movementDistancePerFrame = deltaTime * movement * speed * 0.001;
    const newPosition = {
      x: null,
      y: null,
    };
    if (this.isMovingUp) newPosition.y = position.y - movementDistancePerFrame;
    if (this.isMovingDown) newPosition.y = position.y + movementDistancePerFrame;
    if (this.isMovingLeft) newPosition.x = position.x - movementDistancePerFrame;
    if (this.isMovingRight) newPosition.x = position.x + movementDistancePerFrame;
    if (newPosition.y !== null && !localRules.isOverflowY(newPosition.y, size, window)) data.set(`${this.keyPath}.position.y`, newPosition.y);
    if (newPosition.x !== null && !localRules.isOverflowX(newPosition.x, size, window)) data.set(`${this.keyPath}.position.x`, newPosition.x);
  }

  render(ctx) {
    this.drawHead(ctx);
    this.drawBody(ctx);
    this.drawWing(ctx);
    this.drawTail(ctx);
  }
}

module.exports = jet;
