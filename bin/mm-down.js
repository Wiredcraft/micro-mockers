#!/usr/bin/env node

'use strict';

const spawn = require('child_process').spawn;

const lib = require('../lib');
const Config = lib.classes.Config;

lib.command
  .parse(process.argv);

const config = new Config(lib.command.context);
config.load().then(() => {
  const child = spawn('docker-compose', ['-f', config.compose, 'down']);
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
});
