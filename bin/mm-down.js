#!/usr/bin/env node

'use strict';

const spawn = require('child_process').spawn;

const lib = require('../lib');
const config = lib.config;

lib.command
  .parse(process.argv);

config.init(lib.command.context);

const child = spawn('docker-compose', ['-f', config.composePath, 'down']);
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
