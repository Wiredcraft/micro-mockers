#!/usr/bin/env node

'use strict';

const program = require('commander');

program
  .command('build', 'build all the required files')
  .command('down', 'shutdown the services')
  .command('up', 'start the services')
  .parse(process.argv);
