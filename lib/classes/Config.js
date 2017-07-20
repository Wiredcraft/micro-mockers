'use strict';

const path = require('path');
const dotProp = require('dot-prop');
const merge = require('mixable-object').merge;
const ConfigLoader = require('loopback-boot').ConfigLoader;

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

const lib = require('../');

// Extended Joi.
const Joi = lib.extended.Joi;

// Schema for Kong plugin configs.
const schemaPlugins = Joi.array().items(Joi.object({
  name: Joi.string().trim(),
  config: Joi.object().unknown(true)
}).unknown(true));
// Schema for Kong API configs.
const schemaApis = Joi.array().items(Joi.object({
  name: Joi.string().trim(),
  hosts: Joi.array().items(Joi.string().trim()),
  uris: Joi.array().items(Joi.string().trim()),
  methods: Joi.array().items(Joi.string().trim()),
  strip_uri: Joi.boolean(),
  preserve_host: Joi.boolean(),
  upstream_url: Joi.string().trim(),
  retries: Joi.number(),
  upstream_connect_timeout: Joi.number(),
  upstream_send_timeout: Joi.number(),
  upstream_read_timeout: Joi.number(),
  https_only: Joi.boolean(),
  http_if_terminated: Joi.boolean(),
  plugins: schemaPlugins
}));

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
      if (!res.startsWith('.')) {
        // TODO: what about Windows?
        res = './' + res;
      }
      return res;
    };

    // This is how the config should look like.
    const schema = {
      // For the docker compose file.
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
      adminApi: Joi.string().trim().default('http://localhost:8001'),
      plugins: schemaPlugins,
      apis: schemaApis
    };
    this.schema = Joi.object(schema);

    // Shortcuts.
    for (let key in schema) {
      if (!(key in this)) {
        Object.defineProperty(this, key, {
          get: function() {
            return this.get(key);
          }
        });
      }
    }
    Object.defineProperty(this, 'composeRoot', {
      get: function() {
        return path.dirname(this.get('compose'));
      }
    });
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

  /**
   * Shortcut.
   */
  get apis() {
    const res = this.get('apis');
    if (res) {
      return res;
    }
    // Build from services.
    return this.services.map(this.serviceToApi);
  }

  /**
   * Helper.
   */
  serviceToApi(service) {
    const json = {
      name: service.name,
      upstream_url: 'http://' + service.name + ':' + (service.port || '3000')
    };
    if (service.proxyPath) {
      json.uris = [service.proxyPath];
      json.strip_uri = true;
    } else {
      json.hosts = [service.name];
    }
    return json;
  }

};
