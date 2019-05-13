const data = require('../data');

const { STATE } = require('../constants');

const rule = require('../rule');

const control = require('./control');
const status = require('./status');
const background = require('./background');
const jet = require('./object/jet');

const PLAYER_ONE_KEY_PATH = 'player.one';
const PLAYER_TWO_KEY_PATH = 'player.two';

class game {
  constructor(width, height) {
    this.width = width;
    this.height= height;
    this.control = new control();
    this.status = new status(width, height);
    this.background = new background(width, height);
    this.playerOne = new jet(PLAYER_ONE_KEY_PATH, false);
    this.playerTwo = new jet(PLAYER_TWO_KEY_PATH, true);

    this.initPlayers = this.initPlayers.bind(this);
  }

  initPlayers() {
    const playerOneData = data.get(PLAYER_ONE_KEY_PATH);
    const playerTwoData = data.get(PLAYER_TWO_KEY_PATH);
    data.set(PLAYER_ONE_KEY_PATH, {
      ...playerOneData,
      position: {
        x: 50,
        y: this.height * 0.5,
      }
    });
    data.set(PLAYER_TWO_KEY_PATH, {
      ...playerTwoData,
      position: {
        x: this.width - 50,
        y: this.height * 0.5,
      }
    });
    this.playerOne.init();
    this.playerTwo.init();
  }

  init() {
    this.control.init();
    rule.init();
    rule.activateAll();

    this.initPlayers();
  }

  update(deltaTime) {
    this.status.update();
    if(!data.get('status.running')) return;

    rule.validateAll();
  }

  render(ctx) {
    const currentState = data.getCurrentState();
    this.status.render();
    this.background.render();
    if (currentState === STATE.INITIAL) {
    } else if (currentState === STATE.PLAYING) {
      this.playerOne.render(ctx);
      this.playerTwo.render(ctx);
    } else if (currentState === STATE.END) {
    }
  }
}

module.exports = game;
