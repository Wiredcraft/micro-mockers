'use strict';

require('should');

const Joi = require('../lib/extended/Joi');

describe('The extended Joi', () => {

  it('should be there', () => {
    Joi.should.be.Object();
    Joi.should.have.property('string').which.is.Function();
  });

  describe('Transform', () => {

    it('should be there', () => {
      Joi.string().should.have.property('transform').which.is.Function();
    });

    it('can transform a string', () => {
      const schema = Joi.string().transform((value) => {
        return value.toUpperCase();
      });
      Joi.attempt('lorem', schema).should.equal('LOREM');
    });

  });

});
