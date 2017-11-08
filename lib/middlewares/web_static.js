'use static'

const fs = require('fs');

module.exports = function (express, path) {
  if (fs.existsSync(path + '/dist')) {
    return express.static(path + '/dist');
  } else {
    return express.static(path + '/res');
  }
}
