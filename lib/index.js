var Register = require('file-register');

// The lib.
var lib = Register();

// Register files.
lib.register(__dirname);

// Export.
module.exports = lib;
