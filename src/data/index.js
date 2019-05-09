const initialData = require('./initialData');
const utils = require('../utils');

class data {
  constructor() {
    this.data = initialData;
  }

  static get(keys) {
    return utils.findDeep(keys, this.data);
  }

  static update(keys, value) {
    this.data = utils.assocPath(keys, value, this.data);
  }

  static reset() {
    this.data = initialData;
  }
}

module.exports = data;
