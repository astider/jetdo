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
}

module.exports = {
  status: {
    running: true,
  },
  state: {
    initial: true,
  },
  player: {
    one: {
      ...basePlayerModel,
      color: {
        base: 'red',
        head: 'orange',
      },
    },
    two: {
      ...basePlayerModel,
      color: {
        base: 'blue',
        head: 'aqua',
      },
    },
  },
};
