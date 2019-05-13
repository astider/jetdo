const data = require('../data');
const { STATE, STATUS_TEXT } = require('../constants');

class control {
  constructor() {
    this.controlLayer = document.getElementById('control');
    this.startButton = document.getElementById('start-button');

    this.disabled = true;

    this.init = this.init.bind(this);
    this.disable = this.disable.bind(this);
    this.enable = this.enable.bind(this);
    this.onClickStartButton = this.onClickStartButton.bind(this);
  }

  onClickStartButton() {
    if (this.disabled) return;

    const state = data.getCurrentState();

    if (data.get('status.running')) {
      if (state === STATE.INITIAL) {
        data.set('state.initial', false);
        data.set('state.playing', true);
        data.set('status.text', null)
      }
      if (state === STATE.PLAYING) {
        data.set('status.running', false);
        data.set('status.text', STATUS_TEXT.PAUSE);
      }
    } else {
      data.set('status.running', true);
      data.set('status.text', null);
    }
  }

  init() {
    this.disabled = false;
    this.startButton.addEventListener('click', this.onClickStartButton);
  }

  disable() {
    this.disabled = true;
  }

  enable() {
    this.disabled = false;
  }
}

module.exports = control;
