(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const database = require('../database');

const run = () => {
  const db = new database();

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  console.log('test');
}

module.exports = {
  run,
};

},{"../database":2}],2:[function(require,module,exports){
const initialData = require('./initialData');
const utils = require('../utils');

class database {
  constructor() {
    this.data = initialData;
  }

  get(keys) {
    return utils.findDeep(keys, this.data);
  }

  update(keys, value) {
    this.data = utils.assocPath(keys, value, this.data);
  }

  reset() {
    this.data = initialData;
  }
}

module.exports = database;

},{"../utils":5,"./initialData":3}],3:[function(require,module,exports){
module.exports = {
  state: 'init'
};

},{}],4:[function(require,module,exports){
const app = require('./app');

app.run();

},{"./app":1}],5:[function(require,module,exports){
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

},{}]},{},[4]);
