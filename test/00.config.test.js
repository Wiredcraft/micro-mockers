'use strict';

require('should');
const path = require('path');

const Config = require('../lib/Config');

describe('The Config', function() {

  it('should be there', function() {
    Config.should.be.Function();
  });

  let config;

  it('can construct', function() {
    config = new Config(path.resolve(__dirname, '../example'));
    config.should.have.property('composePath');
    config.should.have.property('composeRoot');
  });

  it('should have a schema', function() {
    config.should.have.property('schema');
    config.schema.should.be.Object();
  });

  it('can return config for types', function() {
    config.should.have.property('get').which.is.Function();
    config.get('types').should.be.Object();
  });

  it('can return config for services', function() {
    config.should.have.property('services');
    config.services.should.be.Array();
  });

  it('can read the template', function() {
    return config.readTemplate().then((res) => {
      res.should.be.String();
    });
  });

});
