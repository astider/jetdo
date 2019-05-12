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
