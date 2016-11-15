'use strict';

require('should');
const path = require('path');

const config = require('../lib/config');

describe('The config', function() {

  it('should be there', function() {
    config.should.be.Object();
  });

  it('can init', function() {
    config.init.should.be.Function();
    const res = config.init(path.resolve(__dirname, '../example'));
    res.should.equal(config);
    res.should.have.property('composePath');
    res.should.have.property('composeRoot');
  });

  it('can return a schema', function() {
    config.should.have.property('schema');
    config.schema.should.be.Object();
  });

  it('can return config for types', function() {
    config.should.have.property('types');
    config.types.should.be.Object();
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
