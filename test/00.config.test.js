'use strict';

require('should');
const path = require('path');

const Config = require('../lib/classes/Config');

describe('The Config', () => {
  let config;

  it('should be there', () => {
    Config.should.be.Function();
  });

  it('can construct', () => {
    config = new Config(path.resolve(__dirname, '../example'));
  });

  it('can load', () => {
    return config.load();
  });

  it('should have a schema', () => {
    config.should.have.property('schema');
    config.schema.should.be.Object();
  });

  it('can return config for types', () => {
    config.should.have.property('get').which.is.Function();
    config.get('types').should.be.Object();
  });

  it('can return config for services', () => {
    config.should.have.property('services');
    config.services.should.be.Array();
  });

  it('can read the template', () => {
    return config.readTemplate().then((res) => {
      res.should.be.String();
    });
  });
});
