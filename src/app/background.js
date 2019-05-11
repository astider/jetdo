const data = require('../data');
const { getBackgroundImagePath } = require('../utils');

class background {
  constructor(width, height) {
    this.backgroundImagePath = '';

    this.backgroundLayer = document.getElementById('static-background-layer');
    this.backgroundLayer.style.width = `${width}px`;
    this.backgroundLayer.style.height = `${height}px`;
    this.backgroundLayer.style.backgroundRepeat = 'no-repeat';
    this.backgroundLayer.style.backgroundPosition = 'left top';
    this.backgroundLayer.style.backgroundSize = '100% 100%';

    this.backgroundImage = new Image();
    this.backgroundImage.onload = () => {
      this.backgroundLayer.style.backgroundImage = `url("${this.backgroundImage.src}")`;
    };

    this.getPath = this.getPath.bind(this);
    this.shouldItRerender = this.shouldItRerender.bind(this);
  }

  getPath() {
    return getBackgroundImagePath(data.getCurrentState());
  }

  shouldItRerender() {
    return this.backgroundImagePath !== this.getPath();
  }

  render() {
    if (this.shouldItRerender()) {
      this.backgroundImagePath = this.getPath();
      this.backgroundImage.src = this.backgroundImagePath;
    }
  }
}

module.exports = background;
