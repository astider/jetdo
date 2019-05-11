(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class game {
  constructor() {}

  update(deltaTime) {}

  render(ctx) {}
}

module.exports = game;

},{}],2:[function(require,module,exports){
const data = require('../data');
const game = require('./game');

class app {
  constructor() {
    this.ctx = document.getElementById('canvas').getContext('2d');
    this.ctx.width = window.innerWidth;
    this.ctx.height = window.innerHeight;
    this.lastTime = 0;
    this.game = new game();

    this.loop = this.loop.bind(this);
  }

  loop(timestamp) {
    if(!data.get('status.running')) return;

    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.game.update(deltaTime);
    this.ctx.clearRect(0, 0, this.ctx.width, this.ctx.height);
    this.game.render(this.ctx);
    window.requestAnimationFrame(this.loop);
  }

  run() {
    data.init();
    window.requestAnimationFrame(this.loop);
  }
}

module.exports = {
  run: () => (new app()).run(),
};

},{"../data":3,"./game":1}],3:[function(require,module,exports){
const initialData = require('./initialData');
const utils = require('../utils');

class data {
  /**
   * create the initial data
   */
  static init() {
    this.data = initialData;
  }

  /**
   * reset the whole data to initial
   */
  static reset() {
    this.data = initialData;
  }

  /**
   * get
   * @param {string} keys 'a.b.c'
   */
  static get(keys) {
    if (this.data === undefined) throw Error('Please create the initial data by run "init" method');
    return utils.findDeep(keys.split('.'), this.data);
  }

  /**
   * update
   * @param {string} keys 'a.b.c'
   * @param {*} value
   */
  static update(keys, value) {
    if (this.data === undefined) throw Error('Please create the initial data by run "init" method');
    this.data = utils.assocPath(keys, value, this.data);
  }
}

module.exports = data;

},{"../utils":6,"./initialData":4}],4:[function(require,module,exports){
module.exports = {
  status: {
    running: true,
  },
  state: {
    initial: true,
  },
};

},{}],5:[function(require,module,exports){
const app = require('./app');

app.run();

},{"./app":2}],6:[function(require,module,exports){
const isObject = (v) => (!Array.isArray(v) && v !== null && typeof v === 'object');

/**
 * assocPath
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

module.exports = {
  findDeep,
  assocPath
};

},{}]},{},[5]);
