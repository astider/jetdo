const data = require('../data');
const { STATE_INITIAL, STATE_PLAYING } = require('../constants');

const background = require('./background');
const jet = require('./object/jet');

const PLAYER_ONE_KEY_PATH = 'player.one';
const PLAYER_TWO_KEY_PATH = 'player.two';

class game {
  constructor(width, height) {
    this.width = width;
    this.height= height;
    this.background = new background(width, height);
    this.playerOne = new jet(PLAYER_ONE_KEY_PATH, false);
    this.playerTwo = new jet(PLAYER_TWO_KEY_PATH, true);
  }

  init() {
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

  update(deltaTime) {
    if(!data.get('status.running')) return;
    // if (data.getCurrentState() === STATE_INITIAL) {

    // }
  }

  render(ctx) {
    this.background.render();
    if (data.getCurrentState() === STATE_INITIAL) {
      this.playerOne.render(ctx);
      this.playerTwo.render(ctx);
    }
  }
}

module.exports = game;
