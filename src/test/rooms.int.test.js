const request = require('supertest');
const app = require('../app');
const sql = require('../config/db');

async function getToken() {
  const email = `rooms_${Date.now()}@test.com`;
  const password = 'Passw0rd!';
  const username = 'rooms_user';
  await request(app).post('/api/auth/register').send({ email, password, username });
  const login = await request(app).post('/api/auth/login').send({ email, password });
  return login.body.token;
}

const createdRoomIds = [];

describe('Rooms integration', () => {
  it('lists rooms', async () => {
    const res = await request(app).get('/api/rooms');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('filters available rooms by time window', async () => {
    const start = new Date(Date.now() + 3600_000).toISOString();
    const end = new Date(Date.now() + 7200_000).toISOString();
    const res = await request(app).get(`/api/rooms/available?start_time=${encodeURIComponent(start)}&end_time=${encodeURIComponent(end)}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('requires auth to create a room', async () => {
    const res = await request(app).post('/api/rooms').send({ name: `X-${Date.now()}`, capacity: 3 });
    expect(res.status).toBe(401);
  });

  it('creates a room with auth', async () => {
    const token = await getToken();
    const name = `Salle Test ${Date.now()}`;
    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({ name, capacity: 5, amenities: ['Whiteboard'] });
    expect([200,201]).toContain(res.status);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(name);
    if (res.body?.id) createdRoomIds.push(res.body.id);
  });
});

afterAll(async () => {
  // Cleanup created rooms to keep DB clean for subsequent runs
  if (createdRoomIds.length) {
    try {
      // Delete dependent bookings first if any
      await sql`DELETE FROM bookings WHERE room_id = ANY(${sql.array(createdRoomIds)})`;
      await sql`DELETE FROM rooms WHERE id = ANY(${sql.array(createdRoomIds)})`;
    } catch (_) {}
  }
  if (sql && typeof sql.end === 'function') {
    try { await sql.end({ timeout: 1 }); } catch (_) {}
  }
});
