# Micro Mockers

[![Build Status](https://travis-ci.org/Wiredcraft/micro-mockers.svg?branch=master)](https://travis-ci.org/Wiredcraft/micro-mockers) [![Coverage Status](https://coveralls.io/repos/github/Wiredcraft/micro-mockers/badge.svg?branch=master)](https://coveralls.io/github/Wiredcraft/micro-mockers?branch=master)

Mock multiple (micro-)services with Docker boxes and gateway with Kong.

Massy (for now) but works.

## How to use

- _Always shutdown the docker boxes before you change anything_
- Download and install Docker
- `npm install -g micro-mockers`
- `cd` to your work directory (see `example` as an example)
- `mm build`
- `mm up`
- `mm down`
