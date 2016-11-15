'use strict';

const lib = require('./');
const config = lib.config;

const yaml = require('js-yaml');

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

const doT = require('dot');
doT.templateSettings.strip = false;

class Builder {

  init() {
    this.config = config.init.apply(config, arguments);
    return this;
  }

  build() {
    // Prepare the docker compose file.
    const composeDoc = config.readTemplate().bind(this)
      .then(yaml.safeLoad)
      .then(this.prepareRelativePaths)
      .then(this.prepareServices)
      .then(yaml.safeDump);
    // Write to file.
    return Promise.join(this.config.composePath, composeDoc, 'utf8', fs.writeFileAsync);
  }

  prepareRelativePaths(doc) {
    for (let key in doc.services) {
      if (key === 'template') {
        continue;
      }
      let service = doc.services[key];
      for (let conf in service) {
        // https://docs.docker.com/compose/compose-file/#/build
        // TODO: context + dockerfile.
        if (typeof service[conf] === 'string') {
          doc.services[key][conf] = service[conf].split(':').map(config.relativeToCompose).join(':');
        }
        // https://docs.docker.com/compose/compose-file/#/envfile
        // https://docs.docker.com/compose/compose-file/#/volumes-volumedriver
        else if (Array.isArray(service[conf])) {
          doc.services[key][conf] = service[conf].map((item) => {
            if (typeof item === 'string') {
              return item.split(':').map(config.relativeToCompose).join(':');
            }
            return item;
          });
        }
      }
    }
    return doc;
  }

  prepareServices(doc) {
    if (doc.services.template == null) {
      return doc;
    }
    // .
    const render = doT.template(yaml.safeDump(doc.services.template));
    // .
    const res = Object.assign({}, doc);
    delete res.services.template;
    // .
    const services = this.config.services;
    // .
    for (let key in services) {
      let name = services[key].name;
      let service = yaml.safeLoad(render(services[key]));
      // Add the service.
      for (let key in service) {
        if (service[key] == null) {
          delete service[key];
        }
      }
      res.services[name] = service;
      // Link it.
      // TODO: config for "link to".
      res.services.kong.links.push(name + ':' + name);
    }
    return res;
  }

  cleanup() {
    return fs.unlinkAsync(this.config.composePath);
  }

}

// Singleton.
exports = module.exports = new Builder();

// The class.
exports.Builder = Builder;
