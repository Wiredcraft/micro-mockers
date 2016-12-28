'use strict';

const path = require('path');
const dotProp = require('dot-prop');
const merge = require('mixable-object').merge;
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

// Schema for Kong plugin configs.
const schemaPlugins = Joi.array().items(Joi.object({
  name: Joi.string().trim(),
  config: Joi.object().unknown(true)
}).unknown(true));

module.exports = class Config {

  constructor(options) {
    if (options == null) {
      options = {};
    } else if (typeof options === 'string') {
      options = { root: options };
    }
    this.root = options.root = options.root || process.cwd();
    this.env = options.env || process.env.NODE_ENV || 'development';
    this.settings = options.config || ConfigLoader.loadAppConfig(this.root, this.env);

    /**
     * Resolve path to absolute, assuming it's relative to the root path.
     *
     * Bound to this.
     */
    this.resolvePath = (source) => {
      if (typeof source !== 'string') {
        return source;
      }
      return path.resolve(this.root, source);
    };

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
      if (!res.startsWith('./')) {
        res = './' + res;
      }
      return res;
    };

    // This is how the config should look like.
    this.schema = Joi.object({
      // For the docker compost file.
      compose: Joi.string().trim().transform(this.resolvePath),
      template: Joi.string().trim().transform(this.resolvePath),
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
      }).unknown(true)),
      // For the Kong config.
      adminApi: Joi.string().trim(),
      plugins: schemaPlugins,
      apis: Joi.array().items(Joi.object({
        name: Joi.string().trim(),
        request_host: Joi.string().trim(),
        request_path: Joi.string().trim(),
        strip_request_path: Joi.boolean(),
        preserve_host: Joi.boolean(),
        upstream_url: Joi.string().trim(),
        plugins: schemaPlugins
      }))
    });

    // Shortcuts.
    this.composePath = this.get('compose');
    this.composeRoot = path.dirname(this.composePath);
  }

  get(key) {
    const schema = Joi.reach(this.schema, key);
    if (schema == null) {
      return dotProp.get(this.settings, key);
    }
    return Joi.attempt(dotProp.get(this.settings, key), schema);
  }

  set(key, val) {
    const schema = Joi.reach(this.schema, key);
    if (schema == null) {
      return dotProp.set(this.settings, key, val);
    }
    return dotProp.set(this.settings, key, Joi.attempt(val, schema));
  }

  readTemplate() {
    return fs.readFileAsync(this.get('template'), 'utf8');
  }

  /**
   * Shortcut.
   */
  get services() {
    const types = this.get('types');
    const res = this.get('services');
    for (let key in res) {
      let service = res[key];
      if (service.type != null && types[service.type] != null) {
        res[key] = merge.call(Object.assign({}, types[service.type]), res[key]);
      }
    }
    return res;
  }

};
