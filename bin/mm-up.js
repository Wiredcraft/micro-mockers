#!/usr/bin/env node

'use strict';

const debug = require('debug')('mm:bin:up');
const spawn = require('child_process').spawn;

const pEvent = require('p-event');
const Promise = require('bluebird');

const lib = require('../lib');
const Config = lib.classes.Config;
const adminApi = lib.kong.adminApi;

lib.command
  .parse(process.argv);

const config = new Config(lib.command.context);
config.load().then(() => {
  const host = config.adminApi;
  const status = new adminApi.Status(host);
  const plugins = new adminApi.Plugins(host);
  const apis = new adminApi.Apis(host);

  debug('running docker-compose up');
  const child = spawn('docker-compose', ['-f', config.compose, 'up', '-d', '--build']);
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  return Promise.resolve(pEvent(child, 'close')).then(Promise.coroutine(function*(code) {
    debug('docker-compose up finished with code %s', code);
    if (code > 0) {
      throw new Error('docker-compose up failed');
    }
    yield status.ping();
    yield plugins.syncAll(config.plugins || []);
    yield apis.syncAll(config.apis || []);
  }));
});
