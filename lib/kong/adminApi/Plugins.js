'use strict';

// const debug = require('debug')('mm:kong:plugins');

const lib = require('../../');
const Base = lib.kong.adminApi.Base;

class Plugins extends Base {
  constructor(options) {
    super(options);
    // A reference to the parent Apis class, used to understand we are global or not.
    if (options.apis != null) {
      this.apis = options.apis;
    }
  }

  get rootPath() {
    return this._rootPath || 'plugins';
  }

  set rootPath(value) {
    this._rootPath = value;
  }

  get filter() {
    if (this.apis) {
      return (item) => {
        return item.consumer_id == null;
      };
    } else {
      return (item) => {
        return item.api_id == null && item.consumer_id == null;
      };
    }
  }
}

module.exports = Plugins;
