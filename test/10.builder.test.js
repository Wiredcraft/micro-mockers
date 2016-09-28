'use strict';

const should = require('should');
const path = require('path');

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

const builder = require('../lib/builder');

describe('The builder', function() {

  it('should be there', function() {
    builder.should.be.Object();
  });

  it('can init', function() {
    builder.init.should.be.Function();
    const res = builder.init(path.resolve(__dirname, '../example'));
    res.should.equal(builder);
    res.should.have.property('config');
  });

  it('can build', function() {
    return builder.build().then(() => {
      return fs.accessAsync(builder.config.composePath);
    });
  });

  it('TODO: check the file content');

  it('can cleanup', function() {
    return builder.cleanup().then(() => {
      return fs.accessAsync(builder.config.composePath).then(() => {
        throw new Error('expected an error');
      }, (err) => {
        err.should.be.Error();
      });
    });
  });

});
