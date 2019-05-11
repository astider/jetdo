const data = require('../data');
const { getBackgroundImagePath } = require('../utils');

class background {
  constructor(width, height) {
    this.backgroundState = '';

    this.backgroundLayer = document.getElementById('static-background-layer');
    this.backgroundLayer.style.width = `${width}px`;
    this.backgroundLayer.style.height = `${height}px`;
    this.backgroundLayer.style.transition = 'opacity 1s';
    this.backgroundLayer.style.backgroundRepeat = 'no-repeat';
    this.backgroundLayer.style.backgroundPosition = 'left top';
    this.backgroundLayer.style.backgroundSize = '100% 100%';

    this.backgroundImage = new Image();
    this.backgroundImage.onload = () => {
      this.backgroundLayer.style.backgroundImage = `url("${this.backgroundImage.src}")`;
      this.backgroundLayer.style.opacity = 1;
    };

    this.getPath = this.getPath.bind(this);
    this.shouldItRerender = this.shouldItRerender.bind(this);
  }

  getPath() {
    return getBackgroundImagePath(data.getCurrentState());
  }

  shouldItRerender() {
    return this.backgroundState !== data.getCurrentState();
  }

  render() {
    if (this.shouldItRerender()) {
      this.backgroundState = data.getCurrentState();
      this.backgroundLayer.style.opacity = 0;
      this.backgroundImage.src = this.getPath();
    }
  }
}

module.exports = background;
