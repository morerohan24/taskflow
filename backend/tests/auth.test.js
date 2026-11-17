const request = require('supertest');
const app = require('../src/server');

describe('Authentication & Authorization Suite', () => {
  const testUser = {
    full_name: 'Test Engineer',
    email: `test_${Date.now()}@taskflow.ai`,
    password: 'password123',
    role: 'Full Stack Engineer'
  };

  let authToken = '';

  test('POST /api/auth/register - Should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.user.full_name).toBe(testUser.full_name);
    authToken = res.body.data.token;
  });

  test('POST /api/auth/register - Should reject duplicate email with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/register - Should reject registration with short password (<6 chars)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        full_name: 'Short Pass',
        email: 'shortpass@taskflow.ai',
        password: '123'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/login - Should successfully log in registered user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
  });

  test('POST /api/auth/login - Should reject login with invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/demo - Should grant instant demo access', async () => {
    const res = await request(app)
      .post('/api/auth/demo');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('demo@taskflow.ai');
    expect(res.body.data).toHaveProperty('token');
  });

  test('GET /api/auth/me - Should reject request without Authorization header', async () => {
    const res = await request(app)
      .get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me - Should return profile when Bearer token is provided', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testUser.email.toLowerCase());
  });
});
