(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"../data":9,"../utils":15}],2:[function(require,module,exports){
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

},{"../constants":8,"../data":9}],3:[function(require,module,exports){
/* eslint-disable no-empty */
const data = require('../data');
const event = require('../event');

const { STATE } = require('../constants');

const rule = require('../rule');

const control = require('./control');
const status = require('./status');
const background = require('./background');
const jet = require('./object/jet');
const hp = require('./object/hp');

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
    this.hpOne = new hp(PLAYER_ONE_KEY_PATH, false);
    this.hpTwo = new hp(PLAYER_TWO_KEY_PATH);

    this.initPlayers = this.initPlayers.bind(this);
    this.initHp = this.initHp.bind(this);
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

  initHp() {
    this.hpOne.init();
    this.hpTwo.init();
  }

  init() {
    event.init();
    rule.init();
    this.control.init();
    this.initPlayers();
    this.initHp();

    rule.activateAll();
  }

  update(deltaTime) {
    this.status.update(deltaTime);
    if(!data.get('status.running')) return;
    const currentState = data.getCurrentState();
    if (currentState === STATE.INITIAL) {
      
    } else if (currentState === STATE.PLAYING) {
      this.playerOne.update(deltaTime);
      this.playerTwo.update(deltaTime);
      this.hpOne.update(deltaTime);
      this.hpTwo.update(deltaTime);
    } else if (currentState === STATE.END) {

    }

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
      this.hpOne.render(ctx);
      this.hpTwo.render(ctx);
    } else if (currentState === STATE.END) {
      
    }
  }
}

module.exports = game;

},{"../constants":8,"../data":9,"../event":11,"../rule":13,"./background":1,"./control":2,"./object/hp":5,"./object/jet":6,"./status":7}],4:[function(require,module,exports){
const data = require('../data');
const game = require('./game');

class app {
  constructor(width, height) {
    this.framerateLayer = document.getElementById('framerate-layer');
    const gameLayerCanvas = document.getElementById('game-layer');
    gameLayerCanvas.width = width;
    gameLayerCanvas.height = height;
    this.gameLayer = gameLayerCanvas.getContext('2d');
    this.width = width;
    this.height = height;
    this.frameAcc = 0;
    this.lastTime = 0;
    this.game = new game(width, height);

    this.loop = this.loop.bind(this);
  }

  loop(timestamp) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.frameAcc += 1;

    this.game.update(deltaTime);
    this.gameLayer.clearRect(0, 0, this.width, this.height);
    this.game.render(this.gameLayer);
    window.requestAnimationFrame(this.loop);
  }

  run() {
    data.init();
    data.set('ui.window.w', this.width);
    data.set('ui.window.h', this.height)
    this.game.init();

    setInterval(() => {
      this.framerateLayer.innerHTML = `${this.frameAcc} FPS`;
      this.frameAcc = 0;
    }, 1000);

    window.requestAnimationFrame(this.loop);
  }
}

module.exports = app;

},{"../data":9,"./game":3}],5:[function(require,module,exports){
const data = require('../../data');

const { HP_DIRECTION } = require('../../constants');

class hp {
  /**
   * 
   * @param {String} keyPath path to player data
   */
  constructor(keyPath) {
    this.keyPath = keyPath;
    this.props = {};
    this.direction = null;
    this.width = 30;
    this.height = 30;
    this.startingX = 0;
    this.startingY = 0;

    this.draw = this.draw.bind(this);
    this.drawLeft = this.drawLeft.bind(this);
    this.drawRight = this.drawRight.bind(this);
  }

  drawLeft(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.startingX, this.startingY);
    ctx.lineTo(this.startingX, Math.floor(this.startingY - this.height * 0.75));
    ctx.lineTo(Math.floor(this.startingX - this.width * 0.25), this.startingY - this.height);
    ctx.lineTo(Math.floor(this.startingX - this.width * 0.5), Math.floor(this.startingY - this.height * 0.75));
    ctx.lineTo(this.startingX, this.startingY);
    ctx.fill();
  }

  drawRight(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.startingX, this.startingY);
    ctx.lineTo(this.startingX, Math.floor(this.startingY - this.height * 0.75));
    ctx.lineTo(Math.floor(this.startingX + this.width * 0.25), this.startingY - this.height);
    ctx.lineTo(Math.floor(this.startingX + this.width * 0.5), Math.floor(this.startingY - this.height * 0.75));
    ctx.lineTo(this.startingX, this.startingY);
    ctx.fill();
  }

  draw(ctx) {
    const { color, hp } = this.props;
    const window = data.get('ui.window');
    const marginFromBorder = 8;
    let spaceBetween = 10;
    let sign;
    if (this.direction === HP_DIRECTION.BOTTOM_LEFT) {
      sign = 1;
      this.startingX = spaceBetween + Math.floor(this.width / 2);
      this.startingY = window.h - marginFromBorder;
    } else if (this.direction === HP_DIRECTION.BOTTOM_RIGHT) {
      sign = -1;
      this.startingX = window.w - spaceBetween - Math.floor(this.width / 2);
      this.startingY = window.h - marginFromBorder;
    }

    ctx.fillStyle = color.hp;
    for (let i = 0; i < hp; i += 1) {
      this.drawLeft(ctx);
      this.drawRight(ctx);
      this.startingX += sign * (spaceBetween + this.width);
    }
  }

  init() {
    this.props = data.get(this.keyPath);
    this.direction = data.get(`ui.${this.keyPath}.hpDirection`);
  }

  update(deltaTime) {
    this.props = data.get(this.keyPath);
  }

  render(ctx) {
    this.draw(ctx);
  }
}

module.exports = hp;

},{"../../constants":8,"../../data":9}],6:[function(require,module,exports){
const data = require('../../data');
const event = require('../../event');

const gameBorderWidth = 10;

const localRules = {
  isOverflowX: (x, size, window) => {
    const xRange = [gameBorderWidth + size.w * 0.5, window.w - gameBorderWidth - size.w * 0.5];
    return x < xRange[0] || x > xRange[1] ? true : false;
  },
  isOverflowY: (y, size, window) => {
    const yRange = [gameBorderWidth + size.h * 0.5, window.h - gameBorderWidth - size.h * 0.5];
    return y < yRange[0] || y > yRange[1] ? true : false;
  },
};

class jet {
  /**
   * 
   * @param {String} keyPath path to player data
   * @param {Boolean} [isInverseDirection]
   */
  constructor(keyPath, isInverseDirection) {
    this.keyPath = keyPath;
    this.name = keyPath.replace('.', '_');
    this.isInverseDirection = isInverseDirection;
    this.props = {};
    this.isMovingUp = false;
    this.isMovingLeft = false;
    this.isMovingRight = false;
    this.isMovingDown = false;

    this.drawHead = this.drawHead.bind(this);
    this.drawBody = this.drawBody.bind(this);
    this.drawWing = this.drawWing.bind(this);
    this.drawTail = this.drawTail.bind(this);
    this.addKeyDownEvent = this.addKeyDownEvent.bind(this);
    this.addKeyUpEvent = this.addKeyUpEvent.bind(this);
  }

  drawHead(ctx) {
    const { position, size, color } = this.props;

    ctx.fillStyle = color.head;
    ctx.beginPath();
    if (this.isInverseDirection) {
      ctx.arc(Math.floor(position.x - (size.w * 0.5)), Math.floor(position.y), Math.floor(size.h * 0.5), Math.PI * 1.5, Math.PI * 0.5, true);
    } else {
      ctx.arc(Math.floor(position.x + (size.w * 0.5)), Math.floor(position.y), Math.floor(size.h * 0.5), Math.PI * 1.5, Math.PI * 0.5);
    }
    ctx.fill();
  }

  drawBody(ctx) {
    const { position, size, color } = this.props;

    ctx.fillStyle = color.base;
    ctx.fillRect(Math.floor(position.x - (size.w * 0.5)), Math.floor(position.y - (size.h * 0.5)), Math.floor(size.w), Math.floor(size.h));
  }

  drawWing(ctx) {
    const { position, size, color } = this.props;

    ctx.fillStyle = color.base;
    ctx.beginPath();
    if (this.isInverseDirection) {
      ctx.moveTo(Math.floor(position.x - (size.w * 0.5)), Math.floor(position.y));
    } else {
      ctx.moveTo(Math.floor(position.x + (size.w * 0.5)), Math.floor(position.y));
    }
    ctx.lineTo(Math.floor(position.x), Math.floor(position.y - size.h * 1.5));
    ctx.lineTo(Math.floor(position.x), Math.floor(position.y + size.h * 1.5));
    ctx.fill();
  }

  drawTail(ctx) {
    const { position, size, color } = this.props;

    ctx.fillStyle = color.base;
    ctx.beginPath();
    if (this.isInverseDirection) {
      ctx.moveTo(Math.floor(position.x + size.w * 0.25), Math.floor(position. y));
      ctx.lineTo(Math.floor(position.x + size.w * 0.5), Math.floor(position.y - size.h));
      ctx.lineTo(Math.floor(position.x + size.w * 0.5), Math.floor(position.y + size.h));
    } else {
      ctx.moveTo(Math.floor(position.x - size.w * 0.25), Math.floor(position. y));
      ctx.lineTo(Math.floor(position.x - size.w * 0.5), Math.floor(position.y - size.h));
      ctx.lineTo(Math.floor(position.x - size.w * 0.5), Math.floor(position.y + size.h));
    }
    ctx.fill();
  }

  addKeyDownEvent() {
    const { keyBinding } = this.props;
    event.add(
      'keydown',
      `${this.name}_keydown`,
      [
        ...keyBinding.up,
        ...keyBinding.down,
        ...keyBinding.left,
        ...keyBinding.right,
      ],
      (e) => {
        if (keyBinding.up.includes(e.key)) this.isMovingUp = true;
        if (keyBinding.down.includes(e.key)) this.isMovingDown = true;
        if (keyBinding.left.includes(e.key)) this.isMovingLeft = true;
        if (keyBinding.right.includes(e.key)) this.isMovingRight = true;
      }
    );
  }

  addKeyUpEvent() {
    const { keyBinding } = this.props;
    event.add(
      'keyup',
      `${this.name}_keyup`,
      [
        ...keyBinding.up,
        ...keyBinding.down,
        ...keyBinding.left,
        ...keyBinding.right,
      ],
      (e) => {
        if (keyBinding.up.includes(e.key)) this.isMovingUp = false;
        if (keyBinding.down.includes(e.key)) this.isMovingDown = false;
        if (keyBinding.left.includes(e.key)) this.isMovingLeft = false;
        if (keyBinding.right.includes(e.key)) this.isMovingRight = false;
      }
    );
  }

  init() {
    this.props = data.get(this.keyPath);
    this.addKeyUpEvent();
    this.addKeyDownEvent();
  }

  update(deltaTime) {
    this.props = data.get(this.keyPath);
    const { speed, movement, position, size } = data.get(this.keyPath);
    const window = data.get('ui.window');

    const movementDistancePerFrame = deltaTime * movement * speed * 0.001;
    const newPosition = {
      x: null,
      y: null,
    };
    if (this.isMovingUp) newPosition.y = position.y - movementDistancePerFrame;
    if (this.isMovingDown) newPosition.y = position.y + movementDistancePerFrame;
    if (this.isMovingLeft) newPosition.x = position.x - movementDistancePerFrame;
    if (this.isMovingRight) newPosition.x = position.x + movementDistancePerFrame;
    if (newPosition.y !== null && !localRules.isOverflowY(newPosition.y, size, window)) data.set(`${this.keyPath}.position.y`, newPosition.y);
    if (newPosition.x !== null && !localRules.isOverflowX(newPosition.x, size, window)) data.set(`${this.keyPath}.position.x`, newPosition.x);
  }

  render(ctx) {
    this.drawHead(ctx);
    this.drawBody(ctx);
    this.drawWing(ctx);
    this.drawTail(ctx);
  }
}

module.exports = jet;

},{"../../data":9,"../../event":11}],7:[function(require,module,exports){
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
    this.statusLayer.fillStyle = 'rgba(0, 0, 0, 0.75)';
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

},{"../data":9}],8:[function(require,module,exports){
module.exports = {
  STATE: {
    INITIAL: 'initial',
    PLAYING: 'playing',
    END: 'end',
  },
  STATUS_TEXT: {
    INITIAL: 'Press start button ...',
    PAUSE: 'Pause',
  },
  HP_DIRECTION: {
    BOTTOM_LEFT: 'BOTTOM_LEFT',
    BOTTOM_RIGHT: 'BOTTOM_RIGHT',
  },
};

},{}],9:[function(require,module,exports){
const initialData = require('./initialData');
const utils = require('../utils');

const getInitialData = () => Immutable.fromJS(initialData).toJS();

class data {
  /**
   * create the initial data
   */
  static init() {
    this.data = getInitialData();
  }

  /**
   * reset the whole data to initial
   */
  static reset() {
    this.data = getInitialData();
  }

  /**
   * get
   * @param {String} keyPath 'a.b.c'
   */
  static get(keyPath) {
    if (this.data === undefined) throw Error('Please create the initial data by running "init" method');
    return utils.findDeep(keyPath.split('.'), this.data);
  }

  /**
   * set
   * @param {String} keyPath 'a.b.c'
   * @param {*} value
   */
  static set(keyPath, value) {
    if (this.data === undefined) throw Error('Please create the initial data by running "init" method');
    this.data = utils.assocPath(keyPath.split('.'), value, this.data);
  }

  /**
   * get a name of the current game state
   */
  static getCurrentState() {
    if (this.data === undefined) throw Error('Please create the initial data by running "init" method');
    return Object.keys(this.data.state).find(stateName => this.data.state[stateName] === true);
  }
}

module.exports = data;

},{"../utils":15,"./initialData":10}],10:[function(require,module,exports){
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

},{"../constants":8}],11:[function(require,module,exports){
class event {
  static init() {
    this.eventList = {};
  }

  /**
   * add an event listener
   * @param {String} eventType e.g. keyup, keydown
   * @param {String} eventName unique name (it must include letters or underscore only => _aAbBcCdD...)
   * @param {string[]} keys
   * @param {Function} func
   */
  static add(eventType, eventName, keys, func) {
    if (this.eventList === undefined) throw Error('Please setup by running "init" method');
    if (Object.keys(this.eventList).indexOf(eventName) !== -1) throw Error('Duplicate event name');
    this.eventList[eventName] = {
      type: eventType,
      codes: keys,
      func: (e) => {
        if (keys.indexOf(e.key) !== -1) func(e);
      } };
    document.addEventListener(eventType, this.eventList[eventName].func);
  }

  static remove(eventName) {
    if (this.eventList === undefined) throw Error('Please setup by running "init" method');
    if (Object.keys(this.eventList).indexOf(eventName) === -1) throw Error('Event not found');
    document.removeEventListener(this.eventList[eventName].type, this.eventList[eventName].func);
    delete this.eventList[eventName];
  }

  static clear(eventType) {
    if (this.eventList === undefined) throw Error('Please setup by running "init" method');
    Object.keys(this.eventList).forEach(eventName => {
      if (this.eventList[eventName].type === eventType) {
        document.removeEventListener(eventType, this.eventList[eventName].func);
        delete this.eventList[eventName];
      }
    });
  }

  static clearAll() {
    if (this.eventList === undefined) throw Error('Please setup by running "init" method');
    Object.keys(this.eventList).forEach(eventName => {
      document.removeEventListener(this.eventList.type, this.eventList[eventName].func);
      delete this.eventList[eventName];
    });
  }

  getEventList() {
    return this.eventList;
  }
}

module.exports = event;

},{}],12:[function(require,module,exports){
const _app = require('./app');

const app = new _app(1360, 768);

app.run();

},{"./app":4}],13:[function(require,module,exports){
const ruleModel = require('./ruleModel');

const getRuleModel = () => Immutable.fromJS(ruleModel).toJS(); // => return object

class rule {
  static init() {
    this.rules = getRuleModel();
  }

  /**
   * activate
   * @param {{name: String, priority?: Number}[]} list [{ name: 'onHit', priority: 0 }, { name: 'onDie', priority: 1 }]
   */
  static activate(list) {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    if (!Array.isArray(list)) throw Error('Parameter must be array');
    
    for (let i = 0; i < list.length; i += 1) {
      if (this.rules[list[i].name] === undefined) continue;
      if (list[i].priority !== undefined) this.rules[list[i].name].priority = list[i].priority;
      this.rules[list[i].name].activated = true;
    }
  }

  static activateAll() {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    Object.keys(this.rules).forEach((key) => {
      this.rules[key].activated = true;
    });
  }

  /**
   * deactivate
   * @param {String[]} list the list of rule name
   */
  static deactivate(list) {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    if (!Array.isArray(list)) throw Error('Parameter must be array');

    for (let i = 0; i < list.length; i += 1) {
      if (this.rules[list[i]] === undefined) continue;
      this.rules[list[i]] = getRuleModel()[list[i]];
    }
  }

  static deactivateAll() {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    Object.keys(this.rules).forEach((key) => {
      this.rules[key] = getRuleModel()[key];
    });
  }

  static getAll() {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    return Object.keys(this.rules);
  }

  static getActivated() {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    return Object.keys(this.rules).filter(ruleName => this.rules[ruleName].activated);
  }

  static getMatched() {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    return Object.keys(this.rules).filter(ruleName => this.rules[ruleName].matched);
  }

  static isActivated(ruleName) {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    if (this.rules[ruleName] === undefined) return false;
    return this.rules[ruleName].activated;
  }

  /**
   * check
   * @param {String[]} list the list of rule name
   */
  static check(list) {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    const rules = [];
    for (let i = 0; i < list.length; i += 1) {
      const ruleName = list[i];
      if (this.rules[ruleName] === undefined) rules.push({});
      rules.push({
        name: ruleName,
        passed: this.rules[ruleName].check(),
        activated: this.rules[ruleName].activated,
      });
    }
    return rules
  }

  static checkAll() {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    return Object.entries(this.rules)
      .sort((ruleA, ruleB) => ruleA[1].priority - ruleB[1].priority)
      .map(([key, rule]) => ({
        name: key,
        passed: rule.check(),
        activated: rule.activated,
      }));
  }

  /**
   * validate
   * @param {String[]} list the list of rule name
   */
  static validate(list) {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    for (let i = 0; i < list.length; i += 1) {
      const ruleName = list[i];
      if (this.rules[ruleName] === undefined) continue;
      if (!this.rules[ruleName].activated) continue;
      if (this.rules[ruleName].check()) {
        this.rules[ruleName].matched = true;
      } else {
        this.rules[ruleName].matched = false;
      }
    }
  }

  static validateAll() {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    Object.entries(this.rules)
      .filter(([, rule]) => rule.activated)
      .sort((ruleA, ruleB) => ruleA[1].priority - ruleB[1].priority)
      .forEach(([key, rule]) => {
        if (rule.check()) {
          this.rules[key].matched = true;
        } else {
          this.rules[key].matched = false;
        }
      });
  }
}

module.exports = rule;

},{"./ruleModel":14}],14:[function(require,module,exports){
const data = require('../data');

module.exports = {
  onHit: {
    priority: 0,
    activated: false,
    matched: false,
    check: () => {},
  },
  onDie: {
    priority: 0,
    activated: false,
    matched: false,
    check: () => {},
  },
};

},{"../data":9}],15:[function(require,module,exports){
const isObject = (v) => (!Array.isArray(v) && v !== null && typeof v === 'object');

/**
 * assocPath
 * @param {String[]} path
 * @param {*} val
 * @param {{}} obj
 * @example
 * assocPath(['a','b','c'], 'new', {a: {b: {c: 'old'}}}) // => {a: {b: {c: 'new'}}}
 * assocPath(['a','b','c'], 'new', {a: {b: {c: 'old', d: 'old'}}}) // => {a: {b: {c: 'new', d: 'old'}}}
 */
const assocPath = (path, val, obj) => {
  if (!Array.isArray(path)) throw Error('the first parameter must be array');

  const idx = path[0];

  if (path.length > 1) {
    const nextObj = (obj !== undefined) ? obj[idx] : {};
    val = assocPath(path.slice(1), val, nextObj);
  }

  if (!isObject(obj)) return {[idx]: val};

  let result = {};

  for (let key in obj) {
    result[key] = obj[key];
  }
  result[idx] = val;

  return result;
}

/**
 * findDeep
 *  * @param {String[]} path
 * @param {String[]} keys
 * @param {{}} obj
 * @example
 * findDeep(['a', 'b'], { a: { b: 'value' } }) // => 'value'
 * findDeep(['a', 'c'], { a: { b: 'value' } }) // => undefined
 */
const findDeep = (keys, obj) => {
  if (!Array.isArray(keys)) throw Error('the first parameter must be array');

  let accumulator = obj;

  for (let i = 0; i < keys.length; i += 1) {
    accumulator = accumulator[keys[i]];
    if (i === keys.length - 1) return accumulator;
    if (typeof accumulator !== 'object' || Array.isArray(accumulator) === true || accumulator === null) break;
  }
  return undefined;
};

/**
 * getBackgroundImagePath
 * @param {String} name
 */
const getBackgroundImagePath = name => `assets/backgrounds/${name}.jpg`;

module.exports = {
  findDeep,
  assocPath,
  getBackgroundImagePath,
};

},{}]},{},[12]);
