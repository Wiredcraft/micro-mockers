#!/usr/bin/env node

'use strict';

const spawn = require('child_process').spawn;

const Promise = require('bluebird');

const lib = require('../lib');
const config = lib.config;

const host = 'http://localhost:8001';
const status = new lib.kong.Status(host);
const apis = new lib.kong.Apis(host);

lib.command
  .parse(process.argv);

config.init(lib.command.context);

const child = spawn('docker-compose', ['-f', config.composePath, 'up', '-d', '--build']);
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

child.on('close', (code) => {
  Promise.delay(5000).then(ping).then(proxyAll);
});

function ping(count) {
  if (!count) {
    count = 0;
  }
  if (count++ > 20) {
    return Promise.reject(new Error('pinged too many times'));
  }
  return status.get().spread((res, body) => {
    console.log(body);
    return true;
  }).catch((err) => {
    console.log(err);
    return Promise.delay(5000).return(count).then(ping);
  });
}

function proxyAll() {
  return Promise.map(config.services, proxyService);
}

function proxyService(service) {
  const json = {
    name: service.name,
    upstream_url: 'http://' + service.name + ':' + (service.port || '3000')
  };
  if (service.proxyPath) {
    json.request_path = service.proxyPath;
    json.strip_request_path = true;
  } else {
    json.request_host = service.name;
  }
  return apis.post(json).spread((res, body) => {
    console.log(body);
    return true;
  }).catch((err) => {
    console.log(err);
  });
}
