const request = require('supertest');
const app = require('../app');
const sql = require('../config/db');

async function registerAndLogin() {
  const email = `book_${Date.now()}@test.com`;
  const password = 'Passw0rd!';
  const username = 'book_user';
  await request(app).post('/api/auth/register').send({ email, password, username });
  const login = await request(app).post('/api/auth/login').send({ email, password });
  return login.body.token;
}

async function createFreshRoom() {
  const token = await registerAndLogin();
  const name = `Salle Book ${Date.now()}-${Math.floor(Math.random()*1e6)}`;
  const res = await request(app)
    .post('/api/rooms')
    .set('Authorization', `Bearer ${token}`)
    .send({ name, capacity: 3, amenities: [] });
  if (![200,201].includes(res.status)) {
    throw new Error(`Failed to create room for test: ${res.status}`);
  }
  return res.body;
}

describe('Bookings integration', () => {
  it('creates, lists and deletes a booking; prevents overlap', async () => {
    const token = await registerAndLogin();
    const room = await createFreshRoom();

    const start = new Date(Date.now() + 3600_000).toISOString();
    const end = new Date(Date.now() + 7200_000).toISOString();

    // Create booking
    const createRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ room_id: room.id, start_time: start, end_time: end });
    expect([200,201]).toContain(createRes.status);
    const bookingId = createRes.body.id;

    // List mine
    const mine = await request(app)
      .get('/api/bookings/mine')
      .set('Authorization', `Bearer ${token}`);
    expect(mine.status).toBe(200);
    expect(Array.isArray(mine.body)).toBe(true);
    expect(mine.body.find(b => b.id === bookingId)).toBeTruthy();

    // Overlap should fail
    const overlapRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ room_id: room.id, start_time: start, end_time: end });
    expect([400,409]).toContain(overlapRes.status);

    // Cancel booking
    const del = await request(app)
      .delete(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(200);
  });

  it('requires auth to create/list/cancel bookings', async () => {
    const start = new Date(Date.now() + 3600_000).toISOString();
    const end = new Date(Date.now() + 7200_000).toISOString();
    const rooms = await request(app).get('/api/rooms');
    const roomId = rooms.body[0]?.id;

    const noAuthCreate = await request(app).post('/api/bookings').send({ room_id: roomId, start_time: start, end_time: end });
    expect(noAuthCreate.status).toBe(401);
    const noAuthList = await request(app).get('/api/bookings/mine');
    expect(noAuthList.status).toBe(401);
    const noAuthCancel = await request(app).delete('/api/bookings/1');
    expect(noAuthCancel.status).toBe(401);
  });
});

afterAll(async () => {
  if (sql && typeof sql.end === 'function') {
    try { await sql.end({ timeout: 1 }); } catch (_) {}
  }
});
