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

},{"../data":7,"../utils":10}],2:[function(require,module,exports){
const data = require('../data');

const { STATE_INITIAL, STATE_PLAYING } = require('../constants');

const rule = require('./rule');

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
    rule.init();
    rule.activateAll();

    this.initPlayers();
  }

  update(deltaTime) {
    if(!data.get('status.running')) return;

    rule.validateAll();
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

},{"../constants":6,"../data":7,"./background":1,"./object/jet":4,"./rule":5}],3:[function(require,module,exports){
const data = require('../data');
const game = require('./game');

class app {
  constructor(width, height) {
    this.framerateLayer = document.getElementById('framerate-layer');
    const gameLayerCanvas = document.getElementById('game-layer');
    gameLayerCanvas.width = width;
    gameLayerCanvas.height = height;
    this.gameLayer = gameLayerCanvas.getContext('2d');
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
    this.gameLayer.clearRect(0, 0, this.gameLayer.width, this.gameLayer.height);
    this.game.render(this.gameLayer);
    window.requestAnimationFrame(this.loop);
  }

  run() {
    data.init();
    this.game.init();

    setInterval(() => {
      this.framerateLayer.innerHTML = `${this.frameAcc} FPS`;
      this.frameAcc = 0;
    }, 1000);

    window.requestAnimationFrame(this.loop);
  }
}

module.exports = app;

},{"../data":7,"./game":2}],4:[function(require,module,exports){
const data = require('../../data');

class jet {
  /**
   * 
   * @param {String} keyPath 
   * @param {Boolean} [isInverseDirection]
   */
  constructor(keyPath, isInverseDirection) {
    this.keyPath = keyPath;
    this.isInverseDirection = isInverseDirection;
    this.props = {};

    this.drawHead = this.drawHead.bind(this);
    this.drawBody = this.drawBody.bind(this);
    this.drawWing = this.drawWing.bind(this);
    this.drawTail = this.drawTail.bind(this);
  }

  drawHead(ctx) {
    const { position, size, color } = this.props;

    ctx.fillStyle = color.head;
    ctx.beginPath();
    if (this.isInverseDirection) {
      ctx.arc(Math.floor(position.x - (size.w * 0.5)), position.y, Math.floor(size.h * 0.5), Math.PI * 1.5, Math.PI * 0.5, true);
    } else {
      ctx.arc(Math.floor(position.x + (size.w * 0.5)), position.y, Math.floor(size.h * 0.5), Math.PI * 1.5, Math.PI * 0.5);
    }
    ctx.fill();
  }

  drawBody(ctx) {
    const { position, size, color } = this.props;

    ctx.fillStyle = color.base;
    ctx.fillRect(Math.floor(position.x - (size.w * 0.5)), Math.floor(position.y - (size.h * 0.5)), size.w, size.h);
  }

  drawWing(ctx) {
    const { position, size, color } = this.props;

    ctx.fillStyle = color.base;
    ctx.beginPath();
    if (this.isInverseDirection) {
      ctx.moveTo(Math.floor(position.x - (size.w * 0.5)), position.y);
    } else {
      ctx.moveTo(Math.floor(position.x + (size.w * 0.5)), position.y);
    }
    ctx.lineTo(position.x, Math.floor(position.y - size.h * 1.5));
    ctx.lineTo(position.x, Math.floor(position.y + size.h * 1.5));
    ctx.fill();
  }

  drawTail(ctx) {
    const { position, size, color } = this.props;

    ctx.fillStyle = color.base;
    ctx.beginPath();
    if (this.isInverseDirection) {
      ctx.moveTo(position.x + Math.floor(size.w * 0.25), position. y);
      ctx.lineTo(position.x + Math.floor(size.w * 0.5), position.y - size.h);
      ctx.lineTo(position.x + Math.floor(size.w * 0.5), position.y + size.h);
    } else {
      ctx.moveTo(position.x - Math.floor(size.w * 0.25), position. y);
      ctx.lineTo(position.x - Math.floor(size.w * 0.5), position.y - size.h);
      ctx.lineTo(position.x - Math.floor(size.w * 0.5), position.y + size.h);
    }
    ctx.fill();
  }

  init() {
    this.props = data.get(this.keyPath);
  }

  update(deltaTime) {}

  render(ctx) {
    this.drawHead(ctx);
    this.drawBody(ctx);
    this.drawWing(ctx);
    this.drawTail(ctx);
  }
}

module.exports = jet;

},{"../../data":7}],5:[function(require,module,exports){
const data = require('../data');

const ruleModels = {
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

const getRuleModels = () => Immutable.fromJS(ruleModels).toJS();

class rule {
  static init() {
    this.rules = getRuleModels();
  }

  /**
   * activate
   * @param {{name: String, priority?: Number}[]} list [{ name: 'onHit', priority: 0 }]
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
      this.rules[list[i]] = getRuleModels()[list[i]];
    }
  }

  static deactivateAll() {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    Object.keys(this.rules).forEach((key) => {
      this.rules[key] = getRuleModels()[key];
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

  static check(ruleName) {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    if (this.rules[ruleName] === undefined) return {};
    return {
      name: ruleName,
      passed: this.rules[ruleName].check(),
      activated: this.rules[ruleName].activated,
    };
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

  static validate(ruleName) {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    if (this.rules[ruleName] === undefined) return;
    if (this.rules[ruleName].activated !== true) return;

    if (this.rules[ruleName].check()) {
      this.rules[ruleName].matched = true;
    } else {
      this.rules[ruleName].matched = false;
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

},{"../data":7}],6:[function(require,module,exports){
module.exports = {
  STATE_INITIAL: 'initial',
  STATE_PLAYING: 'PLAYING',
};

},{}],7:[function(require,module,exports){
const initialData = require('./initialData');
const utils = require('../utils');

const getInitialData = Immutable.fromJS(initialData).toJS();

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

},{"../utils":10,"./initialData":8}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
const _app = require('./app');

const app = new _app(1360, 768);

app.run();

},{"./app":3}],10:[function(require,module,exports){
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

},{}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwL2JhY2tncm91bmQuanMiLCJzcmMvYXBwL2dhbWUuanMiLCJzcmMvYXBwL2luZGV4LmpzIiwic3JjL2FwcC9vYmplY3QvamV0LmpzIiwic3JjL2FwcC9ydWxlLmpzIiwic3JjL2NvbnN0YW50cy5qcyIsInNyYy9kYXRhL2luZGV4LmpzIiwic3JjL2RhdGEvaW5pdGlhbERhdGEuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGRhdGEgPSByZXF1aXJlKCcuLi9kYXRhJyk7XG5jb25zdCB7IGdldEJhY2tncm91bmRJbWFnZVBhdGggfSA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbmNsYXNzIGJhY2tncm91bmQge1xuICBjb25zdHJ1Y3Rvcih3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdGhpcy5iYWNrZ3JvdW5kSW1hZ2VQYXRoID0gJyc7XG5cbiAgICB0aGlzLmJhY2tncm91bmRMYXllciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGF0aWMtYmFja2dyb3VuZC1sYXllcicpO1xuICAgIHRoaXMuYmFja2dyb3VuZExheWVyLnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgO1xuICAgIHRoaXMuYmFja2dyb3VuZExheWVyLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XG4gICAgdGhpcy5iYWNrZ3JvdW5kTGF5ZXIuc3R5bGUuYmFja2dyb3VuZFJlcGVhdCA9ICduby1yZXBlYXQnO1xuICAgIHRoaXMuYmFja2dyb3VuZExheWVyLnN0eWxlLmJhY2tncm91bmRQb3NpdGlvbiA9ICdsZWZ0IHRvcCc7XG4gICAgdGhpcy5iYWNrZ3JvdW5kTGF5ZXIuc3R5bGUuYmFja2dyb3VuZFNpemUgPSAnMTAwJSAxMDAlJztcblxuICAgIHRoaXMuYmFja2dyb3VuZEltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgdGhpcy5iYWNrZ3JvdW5kSW1hZ2Uub25sb2FkID0gKCkgPT4ge1xuICAgICAgdGhpcy5iYWNrZ3JvdW5kTGF5ZXIuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gYHVybChcIiR7dGhpcy5iYWNrZ3JvdW5kSW1hZ2Uuc3JjfVwiKWA7XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0UGF0aCA9IHRoaXMuZ2V0UGF0aC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc2hvdWxkSXRSZXJlbmRlciA9IHRoaXMuc2hvdWxkSXRSZXJlbmRlci5iaW5kKHRoaXMpO1xuICB9XG5cbiAgZ2V0UGF0aCgpIHtcbiAgICByZXR1cm4gZ2V0QmFja2dyb3VuZEltYWdlUGF0aChkYXRhLmdldEN1cnJlbnRTdGF0ZSgpKTtcbiAgfVxuXG4gIHNob3VsZEl0UmVyZW5kZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuYmFja2dyb3VuZEltYWdlUGF0aCAhPT0gdGhpcy5nZXRQYXRoKCk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgaWYgKHRoaXMuc2hvdWxkSXRSZXJlbmRlcigpKSB7XG4gICAgICB0aGlzLmJhY2tncm91bmRJbWFnZVBhdGggPSB0aGlzLmdldFBhdGgoKTtcbiAgICAgIHRoaXMuYmFja2dyb3VuZEltYWdlLnNyYyA9IHRoaXMuYmFja2dyb3VuZEltYWdlUGF0aDtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYWNrZ3JvdW5kO1xuIiwiY29uc3QgZGF0YSA9IHJlcXVpcmUoJy4uL2RhdGEnKTtcblxuY29uc3QgeyBTVEFURV9JTklUSUFMLCBTVEFURV9QTEFZSU5HIH0gPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcblxuY29uc3QgcnVsZSA9IHJlcXVpcmUoJy4vcnVsZScpO1xuXG5jb25zdCBiYWNrZ3JvdW5kID0gcmVxdWlyZSgnLi9iYWNrZ3JvdW5kJyk7XG5jb25zdCBqZXQgPSByZXF1aXJlKCcuL29iamVjdC9qZXQnKTtcblxuY29uc3QgUExBWUVSX09ORV9LRVlfUEFUSCA9ICdwbGF5ZXIub25lJztcbmNvbnN0IFBMQVlFUl9UV09fS0VZX1BBVEggPSAncGxheWVyLnR3byc7XG5cbmNsYXNzIGdhbWUge1xuICBjb25zdHJ1Y3Rvcih3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0PSBoZWlnaHQ7XG4gICAgdGhpcy5iYWNrZ3JvdW5kID0gbmV3IGJhY2tncm91bmQod2lkdGgsIGhlaWdodCk7XG4gICAgdGhpcy5wbGF5ZXJPbmUgPSBuZXcgamV0KFBMQVlFUl9PTkVfS0VZX1BBVEgsIGZhbHNlKTtcbiAgICB0aGlzLnBsYXllclR3byA9IG5ldyBqZXQoUExBWUVSX1RXT19LRVlfUEFUSCwgdHJ1ZSk7XG5cbiAgICB0aGlzLmluaXRQbGF5ZXJzID0gdGhpcy5pbml0UGxheWVycy5iaW5kKHRoaXMpO1xuICB9XG5cbiAgaW5pdFBsYXllcnMoKSB7XG4gICAgY29uc3QgcGxheWVyT25lRGF0YSA9IGRhdGEuZ2V0KFBMQVlFUl9PTkVfS0VZX1BBVEgpO1xuICAgIGNvbnN0IHBsYXllclR3b0RhdGEgPSBkYXRhLmdldChQTEFZRVJfVFdPX0tFWV9QQVRIKTtcbiAgICBkYXRhLnNldChQTEFZRVJfT05FX0tFWV9QQVRILCB7XG4gICAgICAuLi5wbGF5ZXJPbmVEYXRhLFxuICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgeDogNTAsXG4gICAgICAgIHk6IHRoaXMuaGVpZ2h0ICogMC41LFxuICAgICAgfVxuICAgIH0pO1xuICAgIGRhdGEuc2V0KFBMQVlFUl9UV09fS0VZX1BBVEgsIHtcbiAgICAgIC4uLnBsYXllclR3b0RhdGEsXG4gICAgICBwb3NpdGlvbjoge1xuICAgICAgICB4OiB0aGlzLndpZHRoIC0gNTAsXG4gICAgICAgIHk6IHRoaXMuaGVpZ2h0ICogMC41LFxuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMucGxheWVyT25lLmluaXQoKTtcbiAgICB0aGlzLnBsYXllclR3by5pbml0KCk7XG4gIH1cblxuICBpbml0KCkge1xuICAgIHJ1bGUuaW5pdCgpO1xuICAgIHJ1bGUuYWN0aXZhdGVBbGwoKTtcblxuICAgIHRoaXMuaW5pdFBsYXllcnMoKTtcbiAgfVxuXG4gIHVwZGF0ZShkZWx0YVRpbWUpIHtcbiAgICBpZighZGF0YS5nZXQoJ3N0YXR1cy5ydW5uaW5nJykpIHJldHVybjtcblxuICAgIHJ1bGUudmFsaWRhdGVBbGwoKTtcbiAgICAvLyBpZiAoZGF0YS5nZXRDdXJyZW50U3RhdGUoKSA9PT0gU1RBVEVfSU5JVElBTCkge1xuXG4gICAgLy8gfVxuICB9XG5cbiAgcmVuZGVyKGN0eCkge1xuICAgIHRoaXMuYmFja2dyb3VuZC5yZW5kZXIoKTtcbiAgICBpZiAoZGF0YS5nZXRDdXJyZW50U3RhdGUoKSA9PT0gU1RBVEVfSU5JVElBTCkge1xuICAgICAgdGhpcy5wbGF5ZXJPbmUucmVuZGVyKGN0eCk7XG4gICAgICB0aGlzLnBsYXllclR3by5yZW5kZXIoY3R4KTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnYW1lO1xuIiwiY29uc3QgZGF0YSA9IHJlcXVpcmUoJy4uL2RhdGEnKTtcbmNvbnN0IGdhbWUgPSByZXF1aXJlKCcuL2dhbWUnKTtcblxuY2xhc3MgYXBwIHtcbiAgY29uc3RydWN0b3Iod2lkdGgsIGhlaWdodCkge1xuICAgIHRoaXMuZnJhbWVyYXRlTGF5ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZnJhbWVyYXRlLWxheWVyJyk7XG4gICAgY29uc3QgZ2FtZUxheWVyQ2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWUtbGF5ZXInKTtcbiAgICBnYW1lTGF5ZXJDYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICBnYW1lTGF5ZXJDYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMuZ2FtZUxheWVyID0gZ2FtZUxheWVyQ2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgdGhpcy5mcmFtZUFjYyA9IDA7XG4gICAgdGhpcy5sYXN0VGltZSA9IDA7XG4gICAgdGhpcy5nYW1lID0gbmV3IGdhbWUod2lkdGgsIGhlaWdodCk7XG5cbiAgICB0aGlzLmxvb3AgPSB0aGlzLmxvb3AuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGxvb3AodGltZXN0YW1wKSB7XG4gICAgY29uc3QgZGVsdGFUaW1lID0gdGltZXN0YW1wIC0gdGhpcy5sYXN0VGltZTtcbiAgICB0aGlzLmxhc3RUaW1lID0gdGltZXN0YW1wO1xuICAgIHRoaXMuZnJhbWVBY2MgKz0gMTtcblxuICAgIHRoaXMuZ2FtZS51cGRhdGUoZGVsdGFUaW1lKTtcbiAgICB0aGlzLmdhbWVMYXllci5jbGVhclJlY3QoMCwgMCwgdGhpcy5nYW1lTGF5ZXIud2lkdGgsIHRoaXMuZ2FtZUxheWVyLmhlaWdodCk7XG4gICAgdGhpcy5nYW1lLnJlbmRlcih0aGlzLmdhbWVMYXllcik7XG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmxvb3ApO1xuICB9XG5cbiAgcnVuKCkge1xuICAgIGRhdGEuaW5pdCgpO1xuICAgIHRoaXMuZ2FtZS5pbml0KCk7XG5cbiAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICB0aGlzLmZyYW1lcmF0ZUxheWVyLmlubmVySFRNTCA9IGAke3RoaXMuZnJhbWVBY2N9IEZQU2A7XG4gICAgICB0aGlzLmZyYW1lQWNjID0gMDtcbiAgICB9LCAxMDAwKTtcblxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5sb29wKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFwcDtcbiIsImNvbnN0IGRhdGEgPSByZXF1aXJlKCcuLi8uLi9kYXRhJyk7XG5cbmNsYXNzIGpldCB7XG4gIC8qKlxuICAgKiBcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVBhdGggXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW2lzSW52ZXJzZURpcmVjdGlvbl1cbiAgICovXG4gIGNvbnN0cnVjdG9yKGtleVBhdGgsIGlzSW52ZXJzZURpcmVjdGlvbikge1xuICAgIHRoaXMua2V5UGF0aCA9IGtleVBhdGg7XG4gICAgdGhpcy5pc0ludmVyc2VEaXJlY3Rpb24gPSBpc0ludmVyc2VEaXJlY3Rpb247XG4gICAgdGhpcy5wcm9wcyA9IHt9O1xuXG4gICAgdGhpcy5kcmF3SGVhZCA9IHRoaXMuZHJhd0hlYWQuYmluZCh0aGlzKTtcbiAgICB0aGlzLmRyYXdCb2R5ID0gdGhpcy5kcmF3Qm9keS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZHJhd1dpbmcgPSB0aGlzLmRyYXdXaW5nLmJpbmQodGhpcyk7XG4gICAgdGhpcy5kcmF3VGFpbCA9IHRoaXMuZHJhd1RhaWwuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGRyYXdIZWFkKGN0eCkge1xuICAgIGNvbnN0IHsgcG9zaXRpb24sIHNpemUsIGNvbG9yIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yLmhlYWQ7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGlmICh0aGlzLmlzSW52ZXJzZURpcmVjdGlvbikge1xuICAgICAgY3R4LmFyYyhNYXRoLmZsb29yKHBvc2l0aW9uLnggLSAoc2l6ZS53ICogMC41KSksIHBvc2l0aW9uLnksIE1hdGguZmxvb3Ioc2l6ZS5oICogMC41KSwgTWF0aC5QSSAqIDEuNSwgTWF0aC5QSSAqIDAuNSwgdHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eC5hcmMoTWF0aC5mbG9vcihwb3NpdGlvbi54ICsgKHNpemUudyAqIDAuNSkpLCBwb3NpdGlvbi55LCBNYXRoLmZsb29yKHNpemUuaCAqIDAuNSksIE1hdGguUEkgKiAxLjUsIE1hdGguUEkgKiAwLjUpO1xuICAgIH1cbiAgICBjdHguZmlsbCgpO1xuICB9XG5cbiAgZHJhd0JvZHkoY3R4KSB7XG4gICAgY29uc3QgeyBwb3NpdGlvbiwgc2l6ZSwgY29sb3IgfSA9IHRoaXMucHJvcHM7XG5cbiAgICBjdHguZmlsbFN0eWxlID0gY29sb3IuYmFzZTtcbiAgICBjdHguZmlsbFJlY3QoTWF0aC5mbG9vcihwb3NpdGlvbi54IC0gKHNpemUudyAqIDAuNSkpLCBNYXRoLmZsb29yKHBvc2l0aW9uLnkgLSAoc2l6ZS5oICogMC41KSksIHNpemUudywgc2l6ZS5oKTtcbiAgfVxuXG4gIGRyYXdXaW5nKGN0eCkge1xuICAgIGNvbnN0IHsgcG9zaXRpb24sIHNpemUsIGNvbG9yIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yLmJhc2U7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGlmICh0aGlzLmlzSW52ZXJzZURpcmVjdGlvbikge1xuICAgICAgY3R4Lm1vdmVUbyhNYXRoLmZsb29yKHBvc2l0aW9uLnggLSAoc2l6ZS53ICogMC41KSksIHBvc2l0aW9uLnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdHgubW92ZVRvKE1hdGguZmxvb3IocG9zaXRpb24ueCArIChzaXplLncgKiAwLjUpKSwgcG9zaXRpb24ueSk7XG4gICAgfVxuICAgIGN0eC5saW5lVG8ocG9zaXRpb24ueCwgTWF0aC5mbG9vcihwb3NpdGlvbi55IC0gc2l6ZS5oICogMS41KSk7XG4gICAgY3R4LmxpbmVUbyhwb3NpdGlvbi54LCBNYXRoLmZsb29yKHBvc2l0aW9uLnkgKyBzaXplLmggKiAxLjUpKTtcbiAgICBjdHguZmlsbCgpO1xuICB9XG5cbiAgZHJhd1RhaWwoY3R4KSB7XG4gICAgY29uc3QgeyBwb3NpdGlvbiwgc2l6ZSwgY29sb3IgfSA9IHRoaXMucHJvcHM7XG5cbiAgICBjdHguZmlsbFN0eWxlID0gY29sb3IuYmFzZTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgaWYgKHRoaXMuaXNJbnZlcnNlRGlyZWN0aW9uKSB7XG4gICAgICBjdHgubW92ZVRvKHBvc2l0aW9uLnggKyBNYXRoLmZsb29yKHNpemUudyAqIDAuMjUpLCBwb3NpdGlvbi4geSk7XG4gICAgICBjdHgubGluZVRvKHBvc2l0aW9uLnggKyBNYXRoLmZsb29yKHNpemUudyAqIDAuNSksIHBvc2l0aW9uLnkgLSBzaXplLmgpO1xuICAgICAgY3R4LmxpbmVUbyhwb3NpdGlvbi54ICsgTWF0aC5mbG9vcihzaXplLncgKiAwLjUpLCBwb3NpdGlvbi55ICsgc2l6ZS5oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4Lm1vdmVUbyhwb3NpdGlvbi54IC0gTWF0aC5mbG9vcihzaXplLncgKiAwLjI1KSwgcG9zaXRpb24uIHkpO1xuICAgICAgY3R4LmxpbmVUbyhwb3NpdGlvbi54IC0gTWF0aC5mbG9vcihzaXplLncgKiAwLjUpLCBwb3NpdGlvbi55IC0gc2l6ZS5oKTtcbiAgICAgIGN0eC5saW5lVG8ocG9zaXRpb24ueCAtIE1hdGguZmxvb3Ioc2l6ZS53ICogMC41KSwgcG9zaXRpb24ueSArIHNpemUuaCk7XG4gICAgfVxuICAgIGN0eC5maWxsKCk7XG4gIH1cblxuICBpbml0KCkge1xuICAgIHRoaXMucHJvcHMgPSBkYXRhLmdldCh0aGlzLmtleVBhdGgpO1xuICB9XG5cbiAgdXBkYXRlKGRlbHRhVGltZSkge31cblxuICByZW5kZXIoY3R4KSB7XG4gICAgdGhpcy5kcmF3SGVhZChjdHgpO1xuICAgIHRoaXMuZHJhd0JvZHkoY3R4KTtcbiAgICB0aGlzLmRyYXdXaW5nKGN0eCk7XG4gICAgdGhpcy5kcmF3VGFpbChjdHgpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gamV0O1xuIiwiY29uc3QgZGF0YSA9IHJlcXVpcmUoJy4uL2RhdGEnKTtcblxuY29uc3QgcnVsZU1vZGVscyA9IHtcbiAgb25IaXQ6IHtcbiAgICBwcmlvcml0eTogMCxcbiAgICBhY3RpdmF0ZWQ6IGZhbHNlLFxuICAgIG1hdGNoZWQ6IGZhbHNlLFxuICAgIGNoZWNrOiAoKSA9PiB7fSxcbiAgfSxcbiAgb25EaWU6IHtcbiAgICBwcmlvcml0eTogMCxcbiAgICBhY3RpdmF0ZWQ6IGZhbHNlLFxuICAgIG1hdGNoZWQ6IGZhbHNlLFxuICAgIGNoZWNrOiAoKSA9PiB7fSxcbiAgfSxcbn07XG5cbmNvbnN0IGdldFJ1bGVNb2RlbHMgPSAoKSA9PiBJbW11dGFibGUuZnJvbUpTKHJ1bGVNb2RlbHMpLnRvSlMoKTtcblxuY2xhc3MgcnVsZSB7XG4gIHN0YXRpYyBpbml0KCkge1xuICAgIHRoaXMucnVsZXMgPSBnZXRSdWxlTW9kZWxzKCk7XG4gIH1cblxuICAvKipcbiAgICogYWN0aXZhdGVcbiAgICogQHBhcmFtIHt7bmFtZTogU3RyaW5nLCBwcmlvcml0eT86IE51bWJlcn1bXX0gbGlzdCBbeyBuYW1lOiAnb25IaXQnLCBwcmlvcml0eTogMCB9XVxuICAgKi9cbiAgc3RhdGljIGFjdGl2YXRlKGxpc3QpIHtcbiAgICBpZiAodGhpcy5ydWxlcyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBFcnJvcignUGxlYXNlIHNldHVwIGJ5IHJ1bm5pbmcgXCJpbml0XCIgbWV0aG9kJyk7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGxpc3QpKSB0aHJvdyBFcnJvcignUGFyYW1ldGVyIG11c3QgYmUgYXJyYXknKTtcbiAgICBcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGlmICh0aGlzLnJ1bGVzW2xpc3RbaV0ubmFtZV0gPT09IHVuZGVmaW5lZCkgY29udGludWU7XG4gICAgICBpZiAobGlzdFtpXS5wcmlvcml0eSAhPT0gdW5kZWZpbmVkKSB0aGlzLnJ1bGVzW2xpc3RbaV0ubmFtZV0ucHJpb3JpdHkgPSBsaXN0W2ldLnByaW9yaXR5O1xuICAgICAgdGhpcy5ydWxlc1tsaXN0W2ldLm5hbWVdLmFjdGl2YXRlZCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGFjdGl2YXRlQWxsKCkge1xuICAgIGlmICh0aGlzLnJ1bGVzID09PSB1bmRlZmluZWQpIHRocm93IEVycm9yKCdQbGVhc2Ugc2V0dXAgYnkgcnVubmluZyBcImluaXRcIiBtZXRob2QnKTtcbiAgICBPYmplY3Qua2V5cyh0aGlzLnJ1bGVzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIHRoaXMucnVsZXNba2V5XS5hY3RpdmF0ZWQgPSB0cnVlO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIGRlYWN0aXZhdGVcbiAgICogQHBhcmFtIHtTdHJpbmdbXX0gbGlzdCB0aGUgbGlzdCBvZiBydWxlIG5hbWVcbiAgICovXG4gIHN0YXRpYyBkZWFjdGl2YXRlKGxpc3QpIHtcbiAgICBpZiAodGhpcy5ydWxlcyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBFcnJvcignUGxlYXNlIHNldHVwIGJ5IHJ1bm5pbmcgXCJpbml0XCIgbWV0aG9kJyk7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGxpc3QpKSB0aHJvdyBFcnJvcignUGFyYW1ldGVyIG11c3QgYmUgYXJyYXknKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgaWYgKHRoaXMucnVsZXNbbGlzdFtpXV0gPT09IHVuZGVmaW5lZCkgY29udGludWU7XG4gICAgICB0aGlzLnJ1bGVzW2xpc3RbaV1dID0gZ2V0UnVsZU1vZGVscygpW2xpc3RbaV1dO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBkZWFjdGl2YXRlQWxsKCkge1xuICAgIGlmICh0aGlzLnJ1bGVzID09PSB1bmRlZmluZWQpIHRocm93IEVycm9yKCdQbGVhc2Ugc2V0dXAgYnkgcnVubmluZyBcImluaXRcIiBtZXRob2QnKTtcbiAgICBPYmplY3Qua2V5cyh0aGlzLnJ1bGVzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIHRoaXMucnVsZXNba2V5XSA9IGdldFJ1bGVNb2RlbHMoKVtrZXldO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIGdldEFsbCgpIHtcbiAgICBpZiAodGhpcy5ydWxlcyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBFcnJvcignUGxlYXNlIHNldHVwIGJ5IHJ1bm5pbmcgXCJpbml0XCIgbWV0aG9kJyk7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMucnVsZXMpO1xuICB9XG5cbiAgc3RhdGljIGdldEFjdGl2YXRlZCgpIHtcbiAgICBpZiAodGhpcy5ydWxlcyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBFcnJvcignUGxlYXNlIHNldHVwIGJ5IHJ1bm5pbmcgXCJpbml0XCIgbWV0aG9kJyk7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMucnVsZXMpLmZpbHRlcihydWxlTmFtZSA9PiB0aGlzLnJ1bGVzW3J1bGVOYW1lXS5hY3RpdmF0ZWQpO1xuICB9XG5cbiAgc3RhdGljIGdldE1hdGNoZWQoKSB7XG4gICAgaWYgKHRoaXMucnVsZXMgPT09IHVuZGVmaW5lZCkgdGhyb3cgRXJyb3IoJ1BsZWFzZSBzZXR1cCBieSBydW5uaW5nIFwiaW5pdFwiIG1ldGhvZCcpO1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLnJ1bGVzKS5maWx0ZXIocnVsZU5hbWUgPT4gdGhpcy5ydWxlc1tydWxlTmFtZV0ubWF0Y2hlZCk7XG4gIH1cblxuICBzdGF0aWMgaXNBY3RpdmF0ZWQocnVsZU5hbWUpIHtcbiAgICBpZiAodGhpcy5ydWxlcyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBFcnJvcignUGxlYXNlIHNldHVwIGJ5IHJ1bm5pbmcgXCJpbml0XCIgbWV0aG9kJyk7XG4gICAgaWYgKHRoaXMucnVsZXNbcnVsZU5hbWVdID09PSB1bmRlZmluZWQpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdGhpcy5ydWxlc1tydWxlTmFtZV0uYWN0aXZhdGVkO1xuICB9XG5cbiAgc3RhdGljIGNoZWNrKHJ1bGVOYW1lKSB7XG4gICAgaWYgKHRoaXMucnVsZXMgPT09IHVuZGVmaW5lZCkgdGhyb3cgRXJyb3IoJ1BsZWFzZSBzZXR1cCBieSBydW5uaW5nIFwiaW5pdFwiIG1ldGhvZCcpO1xuICAgIGlmICh0aGlzLnJ1bGVzW3J1bGVOYW1lXSA9PT0gdW5kZWZpbmVkKSByZXR1cm4ge307XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IHJ1bGVOYW1lLFxuICAgICAgcGFzc2VkOiB0aGlzLnJ1bGVzW3J1bGVOYW1lXS5jaGVjaygpLFxuICAgICAgYWN0aXZhdGVkOiB0aGlzLnJ1bGVzW3J1bGVOYW1lXS5hY3RpdmF0ZWQsXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBjaGVja0FsbCgpIHtcbiAgICBpZiAodGhpcy5ydWxlcyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBFcnJvcignUGxlYXNlIHNldHVwIGJ5IHJ1bm5pbmcgXCJpbml0XCIgbWV0aG9kJyk7XG4gICAgcmV0dXJuIE9iamVjdC5lbnRyaWVzKHRoaXMucnVsZXMpXG4gICAgICAuc29ydCgocnVsZUEsIHJ1bGVCKSA9PiBydWxlQVsxXS5wcmlvcml0eSAtIHJ1bGVCWzFdLnByaW9yaXR5KVxuICAgICAgLm1hcCgoW2tleSwgcnVsZV0pID0+ICh7XG4gICAgICAgIG5hbWU6IGtleSxcbiAgICAgICAgcGFzc2VkOiBydWxlLmNoZWNrKCksXG4gICAgICAgIGFjdGl2YXRlZDogcnVsZS5hY3RpdmF0ZWQsXG4gICAgICB9KSk7XG4gIH1cblxuICBzdGF0aWMgdmFsaWRhdGUocnVsZU5hbWUpIHtcbiAgICBpZiAodGhpcy5ydWxlcyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBFcnJvcignUGxlYXNlIHNldHVwIGJ5IHJ1bm5pbmcgXCJpbml0XCIgbWV0aG9kJyk7XG4gICAgaWYgKHRoaXMucnVsZXNbcnVsZU5hbWVdID09PSB1bmRlZmluZWQpIHJldHVybjtcbiAgICBpZiAodGhpcy5ydWxlc1tydWxlTmFtZV0uYWN0aXZhdGVkICE9PSB0cnVlKSByZXR1cm47XG5cbiAgICBpZiAodGhpcy5ydWxlc1tydWxlTmFtZV0uY2hlY2soKSkge1xuICAgICAgdGhpcy5ydWxlc1tydWxlTmFtZV0ubWF0Y2hlZCA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucnVsZXNbcnVsZU5hbWVdLm1hdGNoZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgdmFsaWRhdGVBbGwoKSB7XG4gICAgaWYgKHRoaXMucnVsZXMgPT09IHVuZGVmaW5lZCkgdGhyb3cgRXJyb3IoJ1BsZWFzZSBzZXR1cCBieSBydW5uaW5nIFwiaW5pdFwiIG1ldGhvZCcpO1xuICAgIE9iamVjdC5lbnRyaWVzKHRoaXMucnVsZXMpXG4gICAgICAuZmlsdGVyKChbLCBydWxlXSkgPT4gcnVsZS5hY3RpdmF0ZWQpXG4gICAgICAuc29ydCgocnVsZUEsIHJ1bGVCKSA9PiBydWxlQVsxXS5wcmlvcml0eSAtIHJ1bGVCWzFdLnByaW9yaXR5KVxuICAgICAgLmZvckVhY2goKFtrZXksIHJ1bGVdKSA9PiB7XG4gICAgICAgIGlmIChydWxlLmNoZWNrKCkpIHtcbiAgICAgICAgICB0aGlzLnJ1bGVzW2tleV0ubWF0Y2hlZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5ydWxlc1trZXldLm1hdGNoZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBydWxlO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFNUQVRFX0lOSVRJQUw6ICdpbml0aWFsJyxcbiAgU1RBVEVfUExBWUlORzogJ1BMQVlJTkcnLFxufTtcbiIsImNvbnN0IGluaXRpYWxEYXRhID0gcmVxdWlyZSgnLi9pbml0aWFsRGF0YScpO1xuY29uc3QgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5jb25zdCBnZXRJbml0aWFsRGF0YSA9IEltbXV0YWJsZS5mcm9tSlMoaW5pdGlhbERhdGEpLnRvSlMoKTtcblxuY2xhc3MgZGF0YSB7XG4gIC8qKlxuICAgKiBjcmVhdGUgdGhlIGluaXRpYWwgZGF0YVxuICAgKi9cbiAgc3RhdGljIGluaXQoKSB7XG4gICAgdGhpcy5kYXRhID0gZ2V0SW5pdGlhbERhdGEoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiByZXNldCB0aGUgd2hvbGUgZGF0YSB0byBpbml0aWFsXG4gICAqL1xuICBzdGF0aWMgcmVzZXQoKSB7XG4gICAgdGhpcy5kYXRhID0gZ2V0SW5pdGlhbERhdGEoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXRcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVBhdGggJ2EuYi5jJ1xuICAgKi9cbiAgc3RhdGljIGdldChrZXlQYXRoKSB7XG4gICAgaWYgKHRoaXMuZGF0YSA9PT0gdW5kZWZpbmVkKSB0aHJvdyBFcnJvcignUGxlYXNlIGNyZWF0ZSB0aGUgaW5pdGlhbCBkYXRhIGJ5IHJ1bm5pbmcgXCJpbml0XCIgbWV0aG9kJyk7XG4gICAgcmV0dXJuIHV0aWxzLmZpbmREZWVwKGtleVBhdGguc3BsaXQoJy4nKSwgdGhpcy5kYXRhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBzZXRcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVBhdGggJ2EuYi5jJ1xuICAgKiBAcGFyYW0geyp9IHZhbHVlXG4gICAqL1xuICBzdGF0aWMgc2V0KGtleVBhdGgsIHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuZGF0YSA9PT0gdW5kZWZpbmVkKSB0aHJvdyBFcnJvcignUGxlYXNlIGNyZWF0ZSB0aGUgaW5pdGlhbCBkYXRhIGJ5IHJ1bm5pbmcgXCJpbml0XCIgbWV0aG9kJyk7XG4gICAgdGhpcy5kYXRhID0gdXRpbHMuYXNzb2NQYXRoKGtleVBhdGguc3BsaXQoJy4nKSwgdmFsdWUsIHRoaXMuZGF0YSk7XG4gIH1cblxuICAvKipcbiAgICogZ2V0IGEgbmFtZSBvZiB0aGUgY3VycmVudCBnYW1lIHN0YXRlXG4gICAqL1xuICBzdGF0aWMgZ2V0Q3VycmVudFN0YXRlKCkge1xuICAgIGlmICh0aGlzLmRhdGEgPT09IHVuZGVmaW5lZCkgdGhyb3cgRXJyb3IoJ1BsZWFzZSBjcmVhdGUgdGhlIGluaXRpYWwgZGF0YSBieSBydW5uaW5nIFwiaW5pdFwiIG1ldGhvZCcpO1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmRhdGEuc3RhdGUpLmZpbmQoc3RhdGVOYW1lID0+IHRoaXMuZGF0YS5zdGF0ZVtzdGF0ZU5hbWVdID09PSB0cnVlKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRhdGE7XG4iLCJjb25zdCBiYXNlUGxheWVyTW9kZWwgPSB7XG4gIHBvc2l0aW9uOiB7XG4gICAgeDogMCxcbiAgICB5OiAwLFxuICB9LFxuICBjb2xvcjoge1xuICAgIGJhc2U6ICcnLFxuICAgIGhlYWQ6ICcnLFxuICB9LFxuICBzaXplOiB7XG4gICAgdzogNTAsXG4gICAgaDogMTQsXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzdGF0dXM6IHtcbiAgICBydW5uaW5nOiB0cnVlLFxuICB9LFxuICBzdGF0ZToge1xuICAgIGluaXRpYWw6IHRydWUsXG4gIH0sXG4gIHBsYXllcjoge1xuICAgIG9uZToge1xuICAgICAgLi4uYmFzZVBsYXllck1vZGVsLFxuICAgICAgY29sb3I6IHtcbiAgICAgICAgYmFzZTogJ3JlZCcsXG4gICAgICAgIGhlYWQ6ICdvcmFuZ2UnLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHR3bzoge1xuICAgICAgLi4uYmFzZVBsYXllck1vZGVsLFxuICAgICAgY29sb3I6IHtcbiAgICAgICAgYmFzZTogJ2JsdWUnLFxuICAgICAgICBoZWFkOiAnYXF1YScsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59O1xuIiwiY29uc3QgX2FwcCA9IHJlcXVpcmUoJy4vYXBwJyk7XG5cbmNvbnN0IGFwcCA9IG5ldyBfYXBwKDEzNjAsIDc2OCk7XG5cbmFwcC5ydW4oKTtcbiIsImNvbnN0IGlzT2JqZWN0ID0gKHYpID0+ICghQXJyYXkuaXNBcnJheSh2KSAmJiB2ICE9PSBudWxsICYmIHR5cGVvZiB2ID09PSAnb2JqZWN0Jyk7XG5cbi8qKlxuICogYXNzb2NQYXRoXG4gKiBAcGFyYW0ge1N0cmluZ1tdfSBwYXRoXG4gKiBAcGFyYW0geyp9IHZhbFxuICogQHBhcmFtIHt7fX0gb2JqXG4gKiBAZXhhbXBsZVxuICogYXNzb2NQYXRoKFsnYScsJ2InLCdjJ10sICduZXcnLCB7YToge2I6IHtjOiAnb2xkJ319fSkgLy8gPT4ge2E6IHtiOiB7YzogJ25ldyd9fX1cbiAqIGFzc29jUGF0aChbJ2EnLCdiJywnYyddLCAnbmV3Jywge2E6IHtiOiB7YzogJ29sZCcsIGQ6ICdvbGQnfX19KSAvLyA9PiB7YToge2I6IHtjOiAnbmV3JywgZDogJ29sZCd9fX1cbiAqL1xuY29uc3QgYXNzb2NQYXRoID0gKHBhdGgsIHZhbCwgb2JqKSA9PiB7XG4gIGlmICghQXJyYXkuaXNBcnJheShwYXRoKSkgdGhyb3cgRXJyb3IoJ3RoZSBmaXJzdCBwYXJhbWV0ZXIgbXVzdCBiZSBhcnJheScpO1xuXG4gIGNvbnN0IGlkeCA9IHBhdGhbMF07XG5cbiAgaWYgKHBhdGgubGVuZ3RoID4gMSkge1xuICAgIGNvbnN0IG5leHRPYmogPSAob2JqICE9PSB1bmRlZmluZWQpID8gb2JqW2lkeF0gOiB7fTtcbiAgICB2YWwgPSBhc3NvY1BhdGgocGF0aC5zbGljZSgxKSwgdmFsLCBuZXh0T2JqKTtcbiAgfVxuXG4gIGlmICghaXNPYmplY3Qob2JqKSkgcmV0dXJuIHtbaWR4XTogdmFsfTtcblxuICBsZXQgcmVzdWx0ID0ge307XG5cbiAgZm9yIChsZXQga2V5IGluIG9iaikge1xuICAgIHJlc3VsdFtrZXldID0gb2JqW2tleV07XG4gIH1cbiAgcmVzdWx0W2lkeF0gPSB2YWw7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBmaW5kRGVlcFxuICogICogQHBhcmFtIHtTdHJpbmdbXX0gcGF0aFxuICogQHBhcmFtIHtTdHJpbmdbXX0ga2V5c1xuICogQHBhcmFtIHt7fX0gb2JqXG4gKiBAZXhhbXBsZVxuICogZmluZERlZXAoWydhJywgJ2InXSwgeyBhOiB7IGI6ICd2YWx1ZScgfSB9KSAvLyA9PiAndmFsdWUnXG4gKiBmaW5kRGVlcChbJ2EnLCAnYyddLCB7IGE6IHsgYjogJ3ZhbHVlJyB9IH0pIC8vID0+IHVuZGVmaW5lZFxuICovXG5jb25zdCBmaW5kRGVlcCA9IChrZXlzLCBvYmopID0+IHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KGtleXMpKSB0aHJvdyBFcnJvcigndGhlIGZpcnN0IHBhcmFtZXRlciBtdXN0IGJlIGFycmF5Jyk7XG5cbiAgbGV0IGFjY3VtdWxhdG9yID0gb2JqO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGFjY3VtdWxhdG9yID0gYWNjdW11bGF0b3Jba2V5c1tpXV07XG4gICAgaWYgKGkgPT09IGtleXMubGVuZ3RoIC0gMSkgcmV0dXJuIGFjY3VtdWxhdG9yO1xuICAgIGlmICh0eXBlb2YgYWNjdW11bGF0b3IgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoYWNjdW11bGF0b3IpID09PSB0cnVlIHx8IGFjY3VtdWxhdG9yID09PSBudWxsKSBicmVhaztcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufTtcblxuLyoqXG4gKiBnZXRCYWNrZ3JvdW5kSW1hZ2VQYXRoXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICovXG5jb25zdCBnZXRCYWNrZ3JvdW5kSW1hZ2VQYXRoID0gbmFtZSA9PiBgYXNzZXRzL2JhY2tncm91bmRzLyR7bmFtZX0uanBnYDtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGZpbmREZWVwLFxuICBhc3NvY1BhdGgsXG4gIGdldEJhY2tncm91bmRJbWFnZVBhdGgsXG59O1xuIl19
