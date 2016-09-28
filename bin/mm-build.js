#!/usr/bin/env node

'use strict';

const lib = require('../lib');

lib.command
  .parse(process.argv);

lib.builder
  .init(lib.command.context)
  .build()
  .tap(() => console.log('done'))
  .catch(console.log);
