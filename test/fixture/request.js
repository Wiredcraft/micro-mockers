'use strict';

const Rest = require('lib-rest').Rest;

module.exports = class Apis extends Rest {
  get rootPath() {
    return 'api/lorems';
  }

  preRequest(options) {
    const mockLorem = this.env.get('X-MOCK-LOREM');
    if (mockLorem) {
      options.headers['X-MOCK-LOREM'] = mockLorem;
    }
  }
};
