'use strict'

const Rest = require('lib-rest').Rest;

module.exports = class Apis extends Rest {

  get rootPath() {
    return 'apis';
  }

};
