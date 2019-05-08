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
