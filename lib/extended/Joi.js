'use strict';

const Joi = require('joi');

// Extending Joi so it can be easier to transform a sub-attribute.
module.exports = Joi.extend({
  base: Joi.string(),
  name: 'string',
  pre(value, state, options) {
    if (options.convert && this._flags.transform) {
      return this._flags.transform(value);
    }
    return value;
  },
  rules: [{
    // Simply run through the provided function.
    name: 'transform',
    params: {
      func: Joi.func().required()
    },
    setup(params) {
      this._flags.transform = params.func;
    },
    validate(params, value, state, options) {
      return value;
    }
  }]
});
