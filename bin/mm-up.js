#!/usr/bin/env node

'use strict';

const debug = require('debug')('mm:bin:up');
const spawn = require('child_process').spawn;

const lib = require('../lib');
const Config = lib.classes.Config;
const adminApi = lib.kong.adminApi;

lib.command
  .parse(process.argv);

const config = new Config(lib.command.context);

const status = new adminApi.Status(config.adminApi);
const plugins = new adminApi.Plugins(config.adminApi);
const apis = new adminApi.Apis(config.adminApi);

debug('running docker-compose up');
const child = spawn('docker-compose', ['-f', config.compose, 'up', '-d', '--build']);
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

child.on('close', (code) => {
  debug('docker-compose up finished with code %s', code);
  status.ping().then(syncPlugins).then(syncApis).catch(debug);
});

function syncPlugins() {
  return plugins.syncAll(config.plugins || []);
}

function syncApis() {
  return apis.syncAll(config.apis || []);
}
