'use strict';

const path = require('path');

const defaultContext = process.cwd();

// For all the sub commands.
const command = require('commander');

command
  .version('0.0.0')
  .option('-c, --context <directory>', 'context directory, default to where you run the command',
    absPath, defaultContext);

module.exports = command;

function absPath(directory) {
  return path.resolve(defaultContext, directory);
}
