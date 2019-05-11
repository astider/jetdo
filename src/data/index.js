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
   * set
   * @param {string} keys 'a.b.c'
   * @param {*} value
   */
  static set(keys, value) {
    if (this.data === undefined) throw Error('Please create the initial data by run "init" method');
    this.data = utils.assocPath(keys.split('.'), value, this.data);
  }

  /**
   * get a name of the current game state
   */
  static getCurrentState() {
    return Object.keys(this.data.state).find(stateName => this.data.state[stateName] === true);
  }
}

module.exports = data;
