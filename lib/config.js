'use strict';

const path = require('path');
const merge = require('mixable-object').merge;
const valueObtainer = require('value-obtainer');
const ConfigLoader = require('loopback-boot').ConfigLoader;

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

// Extending Joi so it can be easier to transform a sub-attribute.
const origJoi = require('joi');
const Joi = origJoi.extend({
  base: origJoi.string(),
  name: 'string',
  pre(value, state, options) {
    if (options.convert && this._flags.transform) {
      return this._flags.transform(value);
    }
    return value;
  },
  rules: [{
    name: 'transform',
    params: {
      func: origJoi.func().required()
    },
    setup(params) {
      this._flags.transform = params.func;
    },
    validate(params, value, state, options) {
      return value;
    }
  }]
});

class Config {

  init(options) {
    if (options == null) {
      options = {};
    } else if (typeof options === 'string') {
      options = { root: options };
    }
    this.root = options.root = options.root || process.cwd();
    this.env = options.env || process.env.NODE_ENV || 'development';
    this.config = options.config || ConfigLoader.loadAppConfig(this.root, this.env);
    this.composePath = path.resolve(this.root, this.config.compose);
    this.composeRoot = path.dirname(this.composePath);

    /**
     * Convert the path from "relative to config file" to "relative to compose file".
     *
     * Bound to this.
     */
    this.relativeToCompose = (source) => {
      if (typeof source !== 'string' || !source.startsWith('.')) {
        return source;
      }
      let res = path.relative(this.composeRoot, path.resolve(this.root, source));
      if (res.length === 0) {
        res = '.';
      }
      return res;
    };

    return this;
  }

  /**
   * This is how the config should look like.
   */
  get schema() {
    return Joi.object({
      compose: Joi.string().trim(),
      template: Joi.string().trim(),
      types: Joi.object({
        mock: Joi.object({
          build: Joi.string().trim().transform(this.relativeToCompose)
        }).unknown(true),
        doc: Joi.object({
          build: Joi.string().trim().transform(this.relativeToCompose)
        }).unknown(true)
      }),
      services: Joi.array().items(Joi.object({
        type: Joi.string().trim(),
        volume: Joi.string().trim().transform(this.relativeToCompose)
      }).unknown(true))
    });
  }

  get template() {
    return path.resolve(this.root, valueObtainer(this.schema, 'template')(this.config));
  }

  readTemplate() {
    return fs.readFileAsync(this.template, 'utf8');
  }

  get types() {
    return valueObtainer(this.schema, 'types')(this.config);
  }

  get services() {
    let res = valueObtainer(this.schema, 'services')(this.config);
    for (let key in res) {
      let service = res[key];
      if (service.type != null && this.types[service.type] != null) {
        res[key] = merge.call(Object.assign({}, this.types[service.type]), res[key]);
      }
    }
    return res;
  }

}

// Singleton.
exports = module.exports = new Config();

// The class.
exports.Config = Config;
