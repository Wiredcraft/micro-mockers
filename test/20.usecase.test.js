'use strict';

require('should');

const Lorem = require('./fixture/request');

const Env = require('lib-rest').Env;

describe('Request the fixture', () => {

  const env = new Env();
  const lorem = new Lorem({
    baseUrl: 'http://localhost:8000',
    env: env,
    defaults: {
      headers: {
        host: 'fixture_lorem'
      }
    }
  });

  it('description', () => {
    env.set('X-MOCK-LOREM', 200);
    return lorem.get('a9ba2379-ae7a-4cbf-b3a8-284d7aa54a6e').spread((res, body) => {
      body.should.be.Object();
      body.should.have.property('id', 'a9ba2379-ae7a-4cbf-b3a8-284d7aa54a6e');
      body.should.have.property('name', 'Ipsum');
    });
  });

  it('description', () => {
    env.set('X-MOCK-LOREM', 404);
    return lorem.get('a9ba2379-ae7a-4cbf-b3a8-284d7aa54a6e').then(() => {
      throw new Error('expected an error');
    }, (err) => {
      err.should.be.Error();
      err.should.have.property('statusCode', 404);
    });
  });

  it('description', () => {
    env.set('X-MOCK-LOREM', 500);
    return lorem.get('a9ba2379-ae7a-4cbf-b3a8-284d7aa54a6e').then(() => {
      throw new Error('expected an error');
    }, (err) => {
      err.should.be.Error();
      err.should.have.property('statusCode', 500);
    });
  });

  it('description', () => {
    env.set('X-MOCK-LOREM', 200);
    return lorem.post({ name: 'Dolor' }).spread((res, body) => {
      body.should.be.Object();
      body.should.have.property('id', '45aa0c6a-ca94-41db-ba15-b8e4c3b98646');
      body.should.have.property('name', 'Dolor');
    });
  });

  it('description', () => {
    env.set('X-MOCK-LOREM', 409);
    return lorem.post({ name: 'Dolor' }).then(() => {
      throw new Error('expected an error');
    }, (err) => {
      err.should.be.Error();
      err.should.have.property('statusCode', 409);
    });
  });

  it('description', () => {
    env.set('X-MOCK-LOREM', 500);
    return lorem.post({ name: 'Dolor' }).then(() => {
      throw new Error('expected an error');
    }, (err) => {
      err.should.be.Error();
      err.should.have.property('statusCode', 500);
    });
  });

});
