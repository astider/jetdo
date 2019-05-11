const basePlayerModel = {
  position: {
    x: 0,
    y: 0,
  },
  color: '',
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
      color: 'red',
    },
    two: {
      ...basePlayerModel,
      color: 'blue',
    },
  },
};
