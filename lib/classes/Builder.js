'use strict';

const lib = require('../');
const Config = lib.classes.Config;

const yaml = require('js-yaml');

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

const doT = require('dot');
doT.templateSettings.strip = false;

/**
 * Build a docker-compose file out of a template and a set of config.
 */
module.exports = class Builder {
  constructor(options) {
    this.config = new Config(options);
  }

  build() {
    // Prepare the docker compose file.
    return this.config.readTemplate().bind(this)
      .then(yaml.safeLoad)
      .then(this.prepareRelativePaths)
      .then(this.prepareServices)
      .then(yaml.safeDump)
      .then((composeDoc) => {
        // Write to file.
        return fs.writeFileAsync(this.config.compose, composeDoc, 'utf8');
      });
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
          doc.services[key][conf] = service[conf].split(':').map(this.config.relativeToCompose).join(':');
        }
        // https://docs.docker.com/compose/compose-file/#/envfile
        // https://docs.docker.com/compose/compose-file/#/volumes-volumedriver
        else if (Array.isArray(service[conf])) {
          doc.services[key][conf] = service[conf].map((item) => {
            if (typeof item === 'string') {
              return item.split(':').map(this.config.relativeToCompose).join(':');
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
    // The template render.
    const render = doT.template(yaml.safeDump(doc.services.template));
    // Clone and remove template.
    const res = Object.assign({}, doc);
    delete res.services.template;
    // Render services.
    const services = this.config.services;
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
};
