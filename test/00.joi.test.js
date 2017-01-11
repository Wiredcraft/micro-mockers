'use strict';

require('should');

const Joi = require('../lib/extended/Joi');

describe('The extended Joi', function() {

  it('should be there', function() {
    Joi.should.be.Object();
    Joi.should.have.property('string').which.is.Function();
  });

  describe('Transform', function() {

    it('should be there', function() {
      Joi.string().should.have.property('transform').which.is.Function();
    });

    it('can transform a string', function() {
      const schema = Joi.string().transform(function(value) {
        return value.toUpperCase();
      });
      Joi.attempt('lorem', schema).should.equal('LOREM');
    });

  });

});
