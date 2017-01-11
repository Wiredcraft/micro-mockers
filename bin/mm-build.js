#!/usr/bin/env node

'use strict';

const debug = require('debug')('mm:bin:build');

const lib = require('../lib');
const Builder = lib.classes.Builder;

lib.command
  .parse(process.argv);

const builder = new Builder(lib.command.context);
builder
  .build()
  .tap(() => debug('done'))
  .catch(debug);
