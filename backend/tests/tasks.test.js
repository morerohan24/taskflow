const request = require('supertest');
const app = require('../src/server');

describe('Task Management & Field Security Suite', () => {
  let authToken = '';
  let createdTaskId = '';

  beforeAll(async () => {
    // Authenticate as demo user
    const res = await request(app).post('/api/auth/demo');
    authToken = res.body.data.token;
  });

  test('POST /api/tasks - Should create a new task successfully', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Build Automated Integration Tests',
        description: 'Implement Jest and Supertest suites for end-to-end API verification.',
        status: 'in_progress',
        priority: 'high',
        estimated_hours: 4,
        tags: ['Testing', 'QA']
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.title).toBe('Build Automated Integration Tests');
    expect(res.body.data.status).toBe('in_progress');
    createdTaskId = res.body.data.id;
  });

  test('POST /api/tasks - Should reject task creation without title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        description: 'Missing title task'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/tasks - Should reject task with invalid status enum', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Invalid Status Task',
        status: 'not_a_valid_status'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/tasks - Should fetch user-scoped tasks list', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('PUT /api/tasks/:id - Should update allowed fields successfully', async () => {
    const res = await request(app)
      .put(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Updated Test Title',
        priority: 'urgent',
        estimated_hours: 6
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Updated Test Title');
    expect(res.body.data.priority).toBe('urgent');
    expect(res.body.data.estimated_hours).toBe(6);
  });

  test('PUT /api/tasks/:id - Security: Should reject attempt to reassign user_id owner (403 Forbidden)', async () => {
    const res = await request(app)
      .put(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Tampering Attempt',
        user_id: 'malicious_user_999' // Illegal attempt to reassign ownership
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('cannot modify or reassign the task user_id');
  });

  test('PATCH /api/tasks/:id/status - Should update Kanban status column', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${createdTaskId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'completed' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('completed');
  });

  test('DELETE /api/tasks/:id - Should delete task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/tasks - Should reject unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });
});
