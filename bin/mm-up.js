#!/usr/bin/env node

'use strict';

const debug = require('debug')('mm:bin:up');
const spawn = require('child_process').spawn;

const Promise = require('bluebird');

const lib = require('../lib');
const Config = lib.classes.Config;
const adminApi = lib.kong.adminApi;

const host = 'http://localhost:8001';

lib.command
  .parse(process.argv);

const config = new Config(lib.command.context);

const status = new adminApi.Status(host);
const apis = new adminApi.Apis(host);

debug('running docker-compose up');
const child = spawn('docker-compose', ['-f', config.compose, 'up', '-d', '--build']);
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

child.on('close', (code) => {
  debug('docker-compose up finished with code %s', code);
  status.ping().then(proxyAll).catch(debug);
});

function proxyAll() {
  return Promise.map(config.apis, proxyService);
}

function proxyService(conf) {
  return apis.post(conf).spread((res, body) => {
    console.log(body);
    return true;
  }).catch((err) => {
    console.log(err);
  });
}
