const data = require('../data');

class status {
  constructor(width, height) {
    const statusCanvasLayer = document.getElementById('status-layer');
    statusCanvasLayer.width = width;
    statusCanvasLayer.height = height;
    this.statusLayer = statusCanvasLayer.getContext('2d');
    this.width = width;
    this.height = height;
    this.props = {};

    this.drawText = this.drawText.bind(this);
    this.drawBackground = this.drawBackground.bind(this);
  }

  drawText() {
    this.statusLayer.font = '48px serif';
    this.statusLayer.fillStyle = 'white';
    this.statusLayer.textAlign = "center";
    this.statusLayer.fillText(this.props.text, this.width / 2, this.height / 2);
  }

  drawBackground() {
    this.statusLayer.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.statusLayer.fillRect(0, 0, this.width, this.height);
  }

  // init() {
  //   this.props = data.get('status');
  // }

  update(deltaTime) {
    this.props = data.get('status');
  }

  render() {
    this.statusLayer.clearRect(0, 0, this.width, this.height);
    if (this.props.text !== null && this.props.text !== undefined) {
      this.drawBackground();
      this.drawText();
    }
  }
}

module.exports = status;
