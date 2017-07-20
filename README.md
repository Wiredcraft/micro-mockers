# Micro Mockers

[![Build Status](https://travis-ci.org/Wiredcraft/micro-mockers.svg?branch=master)](https://travis-ci.org/Wiredcraft/micro-mockers) [![Coverage Status](https://coveralls.io/repos/github/Wiredcraft/micro-mockers/badge.svg?branch=master)](https://coveralls.io/github/Wiredcraft/micro-mockers?branch=master)

Mock multiple (micro-)services with Docker boxes and gateway with Kong.

## How to use

- _Always shutdown the docker boxes before you change anything_
- Download and install Docker
- `npm install -g micro-mockers`
- `cd` to your work directory (see `example` as an example)
- `mm build`
- `mm up`
- `mm down`

## Features

### Mock service boxes management

_TODO_

### Kong admin API libraries

```js
const mm = require('micro-mockers');
const adminApi = mm.kong.adminApi;
```

`Status` can be used to ping the Admin API.

```js
const status = new adminApi.Status('http://localhost:8001');
status.ping([max]).then(...);
```

`Plugins` can be used to ensure what in Kong matches an array of plugin definitions.

```js
const plugins = new adminApi.Plugins('http://localhost:8001');
plugins.syncAll([{
  name: 'rate-limiting',
  config: {
    hour: 3000
  }
}, {
  name: 'syslog',
  config: {}
}]).then(...);
```

`Apis` can be used to ensure what in Kong matches an array of API definitions.

```js
const apis = new adminApi.Apis('http://localhost:8001');
apis.syncAll([{
  name: 'lorem',
  hosts: ['...'],
  upstream_url: '...',
  plugins: [...]
}, ...]).then(...);
```
