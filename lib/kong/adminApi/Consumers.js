'use strict'

const debug = require('debug')('mm:kong:consumers');
const Promise = require('bluebird');

const lib = require('../../');
const Base = lib.kong.adminApi.Base;
const indexBy = lib.helpers.indexBy;

class Consumers extends Base {

  get rootPath() {
    return 'consumers';
  }

}

/**
 * Update all items, save new items, don't remove those not in the list.
 */
Consumers.prototype.syncAll = Promise.coroutine(function*(data) {
  // Index twice, once by username, another by custom_id.
  let byUsername = indexBy(data, 'username');
  let byCustomId = indexBy(data, 'custom_id');
  for (let item of yield this.getAll()) {
    if (item.username != null && byUsername[item.username] != null) {
      let conf = byUsername[item.username];
      debug('patching %s:', `/${this.rootPath}/${item.id}`, conf);
      yield this.patch(item.id, conf);
      delete byUsername[item.username];
    }
    if (item.custom_id != null && byCustomId[item.custom_id] != null) {
      let conf = byCustomId[item.custom_id];
      debug('patching %s:', `/${this.rootPath}/${item.id}`, conf);
      yield this.patch(item.id, conf);
      delete byCustomId[item.custom_id];
    }
  }
  for (let key in byUsername) {
    let conf = byUsername[key];
    debug('creating %s:', `/${this.rootPath}`, conf);
    yield this.post(conf);
    // Don't create twice.
    if (conf.custom_id != null && byCustomId[conf.custom_id] != null) {
      delete byCustomId[conf.custom_id];
    }
  }
  for (let key in byCustomId) {
    let conf = byCustomId[key];
    debug('creating %s:', `/${this.rootPath}`, conf);
    yield this.post(conf);
  }
});

module.exports = Consumers;
