const request = require('supertest');
const app = require('../src/server');

describe('AI Intelligence Features Suite', () => {
  let authToken = '';

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/demo');
    authToken = res.body.data.token;
  });

  test('POST /api/ai/generate-description - Should generate spec with subtasks and acceptance criteria', async () => {
    const res = await request(app)
      .post('/api/ai/generate-description')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Configure Stripe Subscription Webhook Handling',
        context: 'Handle recurring SaaS customer billing events and upgrade user tiers.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('description');
    expect(res.body.data).toHaveProperty('acceptanceCriteria');
    expect(res.body.data).toHaveProperty('suggestedSubtasks');
    expect(Array.isArray(res.body.data.suggestedSubtasks)).toBe(true);
    expect(res.body.data.suggestedSubtasks.length).toBeGreaterThan(0);
  });

  test('POST /api/ai/generate-description - Should reject when title is missing', async () => {
    const res = await request(app)
      .post('/api/ai/generate-description')
      .set('Authorization', `Bearer ${authToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/ai/smart-prioritize - Should calculate priority, score (1-100), and rationale', async () => {
    const res = await request(app)
      .post('/api/ai/smart-prioritize')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Fix critical authentication token leak security vulnerability',
        description: 'Immediate hotfix required before public release.',
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        tags: ['Security', 'Hotfix', 'Critical']
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(['urgent', 'high']).toContain(res.body.data.priority);
    expect(res.body.data.score).toBeGreaterThanOrEqual(70);
    expect(res.body.data).toHaveProperty('rationale');
  });

  test('POST /api/ai/generate-summary - Should generate daily standup pulse', async () => {
    const res = await request(app)
      .post('/api/ai/generate-summary')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('headline');
    expect(res.body.data).toHaveProperty('completionRate');
    expect(res.body.data).toHaveProperty('accomplishments');
    expect(res.body.data).toHaveProperty('focusAreas');
    expect(res.body.data).toHaveProperty('blockersAndRisks');
    expect(res.body.data).toHaveProperty('aiRecommendation');
  });
});
