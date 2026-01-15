const request = require('supertest');
const app = require('../app');

describe('URL smoke tests', () => {
  test('Unknown route returns 404', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.statusCode).toBe(404);
  });

  test('HEAD /health returns 200', async () => {
    const res = await request(app).head('/health');
    expect(res.statusCode).toBe(200);
  });

  test('OPTIONS /api/rooms responds successfully', async () => {
    const res = await request(app).options('/api/rooms');
    expect([200, 204]).toContain(res.statusCode);
  });

  test('Protected endpoints require auth (rooms create)', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .send({ name: 'NoAuth', capacity: 2, amenities: [] });
    expect(res.statusCode).toBe(401);
  });

  test('Protected endpoints require auth (bookings mine)', async () => {
    const res = await request(app).get('/api/bookings/mine');
    expect(res.statusCode).toBe(401);
  });
});
