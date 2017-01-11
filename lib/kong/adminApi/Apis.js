'use strict'

// const debug = require('debug')('mm:kong:apis');
const Promise = require('bluebird');

const lib = require('../../');
const Base = lib.kong.adminApi.Base;
const Plugins = lib.kong.adminApi.Plugins;

class Apis extends Base {

  get rootPath() {
    return 'apis';
  }

  /**
   * Child-plugins are per API.
   */
  childPlugins(key, options) {
    return new Plugins(Object.assign(this.childAttributes(), {
      apis: this,
      rootPath: `${this.rootPath}/${key}/plugins`
    }, options || {}));
  }

}

Apis.prototype.put = ensureSyncPlugins(Apis.prototype.put);
Apis.prototype.post = ensureSyncPlugins(Apis.prototype.post);
Apis.prototype.patch = ensureSyncPlugins(Apis.prototype.patch);

module.exports = Apis;

/**
 * Wrapper. Wrap a method to do more.
 */
function ensureSyncPlugins(original) {
  /**
   * Also sync plugins.
   */
  return Promise.coroutine(function*() {
    const data = arguments[arguments.length - 1];
    let plugins = [];
    if (data.plugins != null) {
      plugins = data.plugins;
      delete data.plugins;
    }
    const res = yield original.apply(this, arguments);
    yield this.childPlugins(res[1].id).syncAll(plugins);
    return res;
  });
}
