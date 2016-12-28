#!/usr/bin/env node

'use strict';

const spawn = require('child_process').spawn;

const lib = require('../lib');
const Config = lib.Config;

lib.command
  .parse(process.argv);

const config = new Config(lib.command.context);

const child = spawn('docker-compose', ['-f', config.composePath, 'down']);
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
