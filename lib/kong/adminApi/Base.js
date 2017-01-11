'use strict'

const debug = require('debug')('mm:kong:base');
const Promise = require('bluebird');
const Rest = require('lib-rest').Rest;

const lib = require('../../');
const indexBy = lib.helpers.indexBy;

class Base extends Rest {

  /**
   * The attributes that should be passed to a sub-endpoint.
   */
  childAttributes() {
    return {
      env: this.env,
      baseUrl: this.baseUrl,
      defaults: this.defaults
    };
  }

  get filter() {
    return (item) => item;
  }

  /**
   * Get by query string.
   */
  getAll(qs) {
    return this.get(Object.assign({
      size: 1000
    }, qs || {})).spread((res, body) => {
      return body.data;
    }).filter(this.filter);
  }

}

/**
 * Update all items, also save new items and remove those not in the list.
 */
Base.prototype.syncAll = Promise.coroutine(function*(data) {
  // Index by name.
  let dataObj = indexBy(data, 'name');
  for (let item of yield this.getAll()) {
    let conf = dataObj[item.name];
    if (conf == null) {
      // Remove.
      debug('deleting %s:', `/${this.rootPath}/${item.id}`, item);
      yield this.delete(item.id);
    } else {
      // Update.
      debug('patching %s:', `/${this.rootPath}/${item.id}`, conf);
      yield this.patch(item.id, conf);
      delete dataObj[item.name];
    }
  }
  for (let key in dataObj) {
    let conf = dataObj[key];
    // Create.
    debug('creating %s:', `/${this.rootPath}`, conf);
    yield this.post(conf);
  }
});

module.exports = Base;
