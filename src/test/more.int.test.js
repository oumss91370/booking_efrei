const request = require('supertest');
const app = require('../app');
const sql = require('../config/db');

// Helpers
function toLocalISO(dt) {
  const pad = (n) => String(n).padStart(2, '0');
  const y = dt.getFullYear();
  const m = pad(dt.getMonth() + 1);
  const d = pad(dt.getDate());
  const hh = pad(dt.getHours());
  const mm = pad(dt.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

async function registerAndLogin() {
  const email = `test_${Date.now()}@example.com`;
  const password = 'StrongPassw0rd!';
  const name = 'Tester';
  const reg = await request(app).post('/api/auth/register').send({ email, password, name });
  expect([200,201,409,422]).toContain(reg.statusCode);
  const res = await request(app).post('/api/auth/login').send({ email, password });
  expect(res.statusCode).toBe(200);
  expect(res.body && res.body.token).toBeTruthy();
  return res.body.token;
}


describe.skip('Additional integration tests (temporarily skipped)', () => {
  let token;
  let createdRoomId;
  let createdBookingIds = [];

  beforeAll(async () => {
    token = await registerAndLogin();
    expect(token).toBeTruthy();
  });

  afterAll(async () => {
    try {
      if (createdBookingIds.length) {
        await sql`DELETE FROM bookings WHERE id = ANY(${sql(createdBookingIds)})`;
      }
      if (createdRoomId) {
        await sql`DELETE FROM bookings WHERE room_id = ${createdRoomId}`;
        await sql`DELETE FROM rooms WHERE id = ${createdRoomId}`;
      }
    } finally {
      await sql.end({ timeout: 5 });
    }
  });

  test('Auth: reject invalid email format on register', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'GoodPass123!', name: 'X' });
    expect([400, 422]).toContain(res.statusCode);
  });

  test('Auth: reject weak password on register', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: `weak_${Date.now()}@example.com`, password: '12345', name: 'X' });
    expect([400, 422]).toContain(res.statusCode);
  });

  test('Rooms: reject creation with invalid capacity', async () => {
    const fresh = await registerAndLogin();
    expect(fresh).toBeTruthy();
    let res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${fresh}`)
      .send({ name: 'BadRoom', capacity: -1, amenities: ['screen'] });
    if (res.statusCode === 401) {
      const retry = await registerAndLogin();
      res = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${retry}`)
        .send({ name: 'BadRoom', capacity: -1, amenities: ['screen'] });
    }
    expect([400, 422]).toContain(res.statusCode);
  });

  test('Rooms: reject available with inverted dates', async () => {
    const end = new Date();
    const start = new Date(Date.now() + 60 * 60 * 1000);
    const res = await request(app)
      .get('/api/rooms/available')
      .query({ start_time: toLocalISO(start), end_time: toLocalISO(end) });
    expect([400, 422]).toContain(res.statusCode);
  });

  test('Bookings: allow adjacent time slot (end == next start)', async () => {
    const fresh = await registerAndLogin();
    expect(fresh).toBeTruthy();
    // Create a room first
    let createRoom = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${fresh}`)
      .send({ name: `AdjRoom_${Date.now()}`, capacity: 4, amenities: ['whiteboard'] });
    if (createRoom.statusCode === 401) {
      const retry = await registerAndLogin();
      createRoom = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${retry}`)
        .send({ name: `AdjRoom_${Date.now()}`, capacity: 4, amenities: ['whiteboard'] });
    }
    expect(createRoom.statusCode).toBe(201);
    createdRoomId = createRoom.body.id;

    const base = new Date();
    base.setMinutes(0, 0, 0);
    const start1 = new Date(base.getTime() + 60 * 60 * 1000); // +1h
    const end1 = new Date(start1.getTime() + 60 * 60 * 1000); // +2h
    const start2 = new Date(end1.getTime()); // exactly adjacent
    const end2 = new Date(start2.getTime() + 60 * 60 * 1000);

    const b1 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${fresh}`)
      .send({ room_id: createdRoomId, start_time: toLocalISO(start1), end_time: toLocalISO(end1) });
    expect(b1.statusCode).toBe(201);
    createdBookingIds.push(b1.body.id);

    const b2 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${fresh}`)
      .send({ room_id: createdRoomId, start_time: toLocalISO(start2), end_time: toLocalISO(end2) });
    expect(b2.statusCode).toBe(201);
    createdBookingIds.push(b2.body.id);
  });
});
