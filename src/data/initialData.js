const basePlayerModel = {
  position: {
    x: 0,
    y: 0,
  },
  color: {
    base: '',
    head: '',
  },
  size: {
    w: 50,
    h: 14,
  },
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
    running: true,
  },
  state: {
    initial: true,
  },
  keyBinding: {
    enter: 13,
  },
  player: {
    one: {
      ...basePlayerModel,
      color: {
        base: 'red',
        head: 'orange',
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
