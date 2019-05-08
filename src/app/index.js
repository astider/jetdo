const database = require('../database');

const run = () => {
  const db = new database();

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
}

module.exports = {
  run,
};
