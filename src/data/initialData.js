const { STATUS_TEXT, HP_DIRECTION } = require('../constants');

const basePlayerModel = {
  position: {
    x: 0,
    y: 0,
  },
  color: {
    base: '',
    head: '',
    hp: '',
  },
  size: {
    w: 50,
    h: 14,
  },
  speed: 100,
  movement: 10,
  hp: 5,
  keyBinding: {
    up: null,
    down: null,
    left: null,
    right: null,
    fire: null,
    ultimate: null,
  }
}

module.exports = {
  status: {
    text: STATUS_TEXT.INITIAL,
    running: true,
  },
  state: {
    initial: true,
    playing: false,
    end: false,
  },
  keyBinding: {
    enter: 13,
  },
  ui: {
    player: {
      one: {
        hpDirection: HP_DIRECTION.BOTTOM_LEFT,
      },
      two: {
        hpDirection: HP_DIRECTION.BOTTOM_RIGHT,
      },
    },
    window: {
      h: 0,
      w: 0,
    }
  },
  player: {
    one: {
      ...basePlayerModel,
      color: {
        base: 'red',
        head: 'orange',
        hp: 'red',
      },
      keyBinding: {
        up: ['w', 'W'],
        down: ['s', 'S'],
        left: ['a', 'A'],
        right: ['d', 'D'],
        fire: ['f', 'F'],
        ultimate: ['g', 'G'],
      }
    },
    two: {
      ...basePlayerModel,
      color: {
        base: 'blue',
        head: 'aqua',
        hp: 'blue',
      },
      keyBinding: {
        up: ['ArrowUp'],
        down: ['ArrowDown'],
        left: ['ArrowLeft'],
        right: ['ArrowRight'],
        fire: ['['],
        ultimate: [']'],
      }
    },
  },
};
