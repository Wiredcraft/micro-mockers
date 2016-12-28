'use strict'

const debug = require('debug')('mm:kong:status');
const Promise = require('bluebird');
const Rest = require('lib-rest').Rest;

module.exports = class Status extends Rest {

  get rootPath() {
    return 'status';
  }

  /**
   * Helper.
   */
  ping(max) {
    if (max == null) {
      max = 10;
    }
    debug('max', max);
    if (max-- <= 0) {
      return Promise.reject(new Error('pinged too many times'));
    }
    return this.get().spread((res, body) => {
      debug('status:', body);
      return true;
    }).catch((err) => {
      debug('error: %s', err);
      return Promise.delay(5000).then(() => {
        return this.ping(max);
      });
    });
  }

};
