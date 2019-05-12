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
        up: 87,
        down: 83,
        left: 65,
        right: 68,
        fire: 70,
        ultimate: 71,
      }
    },
    two: {
      ...basePlayerModel,
      color: {
        base: 'blue',
        head: 'aqua',
      },
      keyBinding: {
        up: 38,
        down: 40,
        left: 37,
        right: 39,
        fire: 219,
        ultimate: 221,
      }
    },
  },
};
