'use strict';

require('should');
const path = require('path');

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

const Builder = require('../lib/classes/Builder');

describe('The Builder', function() {

  it('should be there', function() {
    Builder.should.be.Function();
  });

  let builder;

  it('can construct', function() {
    builder = new Builder(path.resolve(__dirname, '../example'));
    builder.should.have.property('config');
  });

  it('can build', function() {
    return builder.build().then(() => {
      return fs.accessAsync(builder.config.compose);
    });
  });

  it('TODO: check the file content');

  it('can cleanup', function() {
    return builder.cleanup().then(() => {
      return fs.accessAsync(builder.config.compose).then(() => {
        throw new Error('expected an error');
      }, (err) => {
        err.should.be.Error();
      });
    });
  });

});
