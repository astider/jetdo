const initialData = require('./initialData');
const utils = require('../utils');

class data {
  constructor() {
    this.data = initialData;
  }

  /**
   * get
   * @param {string} keys 'a.b.c'
   */
  static get(keys) {
    return utils.findDeep(keys.split('.'), this.data);
  }

  /**
   * update
   * @param {string} keys 'a.b.c'
   * @param {*} value
   */
  static update(keys, value) {
    this.data = utils.assocPath(keys, value, this.data);
  }

  /**
   * reset the whole data to initial
   */
  static reset() {
    this.data = initialData;
  }
}

module.exports = data;
