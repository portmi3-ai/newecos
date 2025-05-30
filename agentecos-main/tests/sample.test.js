const request = require('supertest');
const express = require('express');
const routes = require('../backend/routes');

describe('GET /', () => {
  it('should return hello message', async () => {
    const app = express();
    app.use('/', routes);
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Hello from Mport Media Group Node.js API!');
  });
}); 