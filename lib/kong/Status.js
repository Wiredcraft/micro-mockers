'use strict'

const Rest = require('lib-rest').Rest;

module.exports = class Status extends Rest {

  get rootPath() {
    return 'status';
  }

};
