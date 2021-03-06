'use strict';

require('should');
const path = require('path');

const Apis = require('../lib/kong/adminApi/Apis');
const Plugins = require('../lib/kong/adminApi/Plugins');
const Consumers = require('../lib/kong/adminApi/Consumers');

const Config = require('../lib/classes/Config');

describe('The Kong admin API classes', () => {
  let config;
  let plugins;
  let apis;
  let consumers;

  before(() => {
    config = new Config(path.resolve(__dirname, 'fixture'));
    return config.load();
  });

  describe('Plugins', () => {
    it('should be there', () => {
      Plugins.should.be.Function();
    });

    it('can have an instance', () => {
      plugins = new Plugins(config.adminApi);
    });

    it('can get all global plugins', () => {
      return plugins.getAll().then((data) => {
        data.should.be.Array().with.length(0);
      });
    });

    it('can save a plugin', () => {
      return plugins.post({
        name: 'cors'
      });
    });

    it('can get all global plugins', () => {
      return plugins.getAll().then((data) => {
        data.should.be.Array().with.length(1);
      });
    });

    it('can save a plugin', () => {
      return plugins.post({
        name: 'bot-detection'
      });
    });

    it('can get all global plugins', () => {
      return plugins.getAll().then((data) => {
        data.should.be.Array().with.length(2);
      });
    });

    it('can sync all global plugins', () => {
      return plugins.syncAll([{
        name: 'cors'
      }, {
        name: 'rate-limiting',
        config: {
          second: 5
        }
      }]);
    });

    it('can get all global plugins', () => {
      return plugins.getAll().then((data) => {
        data.should.be.Array().with.length(2);
      });
    });

    it('can delete all global plugins', () => {
      return plugins.getAll().map((item) => {
        return plugins.delete(item.id);
      });
    });

    it('can get all global plugins', () => {
      return plugins.getAll().then((data) => {
        data.should.be.Array().with.length(0);
      });
    });
  });

  describe('Apis', () => {
    after(() => {
      return apis.delete('fixture_ipsum');
    });

    it('should be there', () => {
      Apis.should.be.Function();
    });

    it('can have an instance', () => {
      apis = new Apis(config.adminApi);
    });

    it('can get all apis', () => {
      return apis.getAll().then((data) => {
        data.should.be.Array().with.length(1);
      });
    });

    it('can save an api', () => {
      return apis.post({
        name: 'mockbin',
        hosts: ['mockbin.com'],
        upstream_url: 'http://mockbin.com'
      });
    });

    it('can get all apis', () => {
      return apis.getAll().then((data) => {
        data.should.be.Array().with.length(2);
      });
    });

    it('can sync all apis', () => {
      return apis.syncAll([{
        name: 'fixture_lorem',
        hosts: ['fixture_lorem'],
        upstream_url: 'http://fixture_lorem:3000'
      }, {
        name: 'fixture_ipsum',
        hosts: ['fixture_ipsum'],
        upstream_url: 'http://fixture_ipsum:3000'
      }]);
    });

    it('can get all apis', () => {
      return apis.getAll().then((data) => {
        data.should.be.Array().with.length(2);
      });
    });
  });

  describe('Child Plugins', () => {
    let child;

    before(() => {
      return plugins.post({
        name: 'cors'
      });
    });

    after(() => {
      return plugins.getAll().map((item) => {
        return plugins.delete(item.id);
      });
    });

    it('apis can have child plugins', () => {
      child = apis.childPlugins('fixture_lorem');
      child.should.be.instanceof(Plugins);
      child.should.have.property('rootPath', 'apis/fixture_lorem/plugins');
    });

    it('can get all child plugins', () => {
      return child.getAll().then((data) => {
        data.should.be.Array().with.length(0);
      });
    });

    it('can save a plugin', () => {
      return child.post({
        name: 'cors'
      });
    });

    it('can get all child plugins', () => {
      return child.getAll().then((data) => {
        data.should.be.Array().with.length(1);
      });
    });

    it('can save a plugin', () => {
      return child.post({
        name: 'bot-detection'
      });
    });

    it('can get all child plugins', () => {
      return child.getAll().then((data) => {
        data.should.be.Array().with.length(2);
      });
    });

    it('can sync all child plugins', () => {
      return child.syncAll([{
        name: 'cors'
      }, {
        name: 'rate-limiting',
        config: {
          second: 5
        }
      }]);
    });

    it('can get all child plugins', () => {
      return child.getAll().then((data) => {
        data.should.be.Array().with.length(2);
      });
    });

    it('should not mess with global plugins', () => {
      return plugins.getAll().then((data) => {
        data.should.be.Array().with.length(1);
      });
    });

    it('can delete all child plugins', () => {
      return child.getAll().map((item) => {
        return child.delete(item.id);
      });
    });

    it('can get all child plugins', () => {
      return child.getAll().then((data) => {
        data.should.be.Array().with.length(0);
      });
    });

    it('should not mess with global plugins', () => {
      return plugins.getAll().then((data) => {
        data.should.be.Array().with.length(1);
      });
    });

    it('can sync with the parent sync', () => {
      return apis.syncAll([{
        name: 'fixture_lorem',
        hosts: ['fixture_lorem'],
        upstream_url: 'http://fixture_lorem:3000',
        plugins: [{
          name: 'cors'
        }, {
          name: 'rate-limiting',
          config: {
            second: 5
          }
        }]
      }]);
    });

    it('can get all child plugins', () => {
      return child.getAll().then((data) => {
        data.should.be.Array().with.length(2);
      });
    });

    it('can sync with the parent sync', () => {
      return apis.syncAll([{
        name: 'fixture_lorem',
        hosts: ['fixture_lorem'],
        upstream_url: 'http://fixture_lorem:3000'
      }]);
    });

    it('can get all child plugins', () => {
      return child.getAll().then((data) => {
        data.should.be.Array().with.length(0);
      });
    });
  });

  describe('Consumers', () => {
    after(() => {
      return consumers.getAll().map((item) => {
        consumers.delete(item.id);
      });
    });

    it('should be there', () => {
      Consumers.should.be.Function();
    });

    it('can have an instance', () => {
      consumers = new Consumers(config.adminApi);
    });

    it('can get all consumers', () => {
      return consumers.getAll().then((data) => {
        data.should.be.Array().with.length(0);
      });
    });

    it('can save a consumer', () => {
      return consumers.post({
        username: 'lorem'
      });
    });

    it('can save a consumer', () => {
      return consumers.post({
        custom_id: 'lorem'
      });
    });

    it('can get all consumers', () => {
      return consumers.getAll().then((data) => {
        data.should.be.Array().with.length(2);
      });
    });

    it('can sync all consumers', () => {
      return consumers.syncAll([{
        username: 'ipsum'
      }, {
        custom_id: 'ipsum'
      }, {
        username: 'dolor',
        custom_id: 'dolor'
      }, {
        custom_id: 'dolor'
      }]);
    });

    it('can get all consumers', () => {
      return consumers.getAll().then((data) => {
        data.should.be.Array().with.length(5);
      });
    });
  });
});
