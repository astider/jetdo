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
