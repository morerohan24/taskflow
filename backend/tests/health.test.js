const request = require('supertest');
const app = require('../src/server');

describe('Healthcheck & Security Configuration Suite', () => {
  test('GET /api/health - Should accurately report database mode and connectivity status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'healthy');
    expect(res.body).toHaveProperty('database');
    expect(res.body.database).toHaveProperty('mode');
    expect(res.body.database).toHaveProperty('connected', true);
    expect(res.body).toHaveProperty('aiEngine');
    expect(res.body).toHaveProperty('security');
    expect(res.body.security.corsAllowlistActive).toBe(true);
    expect(res.body.security.rateLimitingActive).toBe(true);
  });
});
