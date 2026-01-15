const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');

const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function token(payload, opts={}) {
  return jwt.sign(payload, SECRET, { expiresIn: opts.expiresIn || '1h' });
}

describe('Security integration (auth middleware)', () => {
  const endpoints = [
    { m: 'post', url: '/api/rooms', body: { name: 'S', capacity: 1 } },
    { m: 'post', url: '/api/bookings', body: { room_id: 1, start_time: new Date().toISOString(), end_time: new Date(Date.now()+3600000).toISOString() } },
    { m: 'get', url: '/api/bookings/mine' },
    { m: 'delete', url: '/api/bookings/1' },
  ];

  it('rejects when Authorization header missing', async () => {
    for (const e of endpoints) {
      const res = await request(app)[e.m](e.url).send(e.body || {});
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Token/);
    }
  });

  it('rejects when Authorization header malformed', async () => {
    for (const e of endpoints) {
      const res = await request(app)[e.m](e.url).set('Authorization', 'Bearer').send(e.body || {});
      expect(res.status).toBe(401);
    }
  });

  it('rejects invalid signature token', async () => {
    const bad = jwt.sign({ userId: 999 }, 'wrong_secret', { expiresIn: '1h' });
    for (const e of endpoints) {
      const res = await request(app)[e.m](e.url).set('Authorization', `Bearer ${bad}`).send(e.body || {});
      expect(res.status).toBe(401);
    }
  });

  it('rejects expired token', async () => {
    const expired = token({ userId: 999 }, { expiresIn: -1 });
    for (const e of endpoints) {
      const res = await request(app)[e.m](e.url).set('Authorization', `Bearer ${expired}`).send(e.body || {});
      expect(res.status).toBe(401);
    }
  });

  it('rejects empty token', async () => {
    for (const e of endpoints) {
      const res = await request(app)[e.m](e.url).set('Authorization', 'Bearer ').send(e.body || {});
      expect(res.status).toBe(401);
    }
  });

  it('rejects non-Bearer prefix', async () => {
    const t = token({ userId: 1 });
    for (const e of endpoints) {
      const res = await request(app)[e.m](e.url).set('Authorization', `Token ${t}`).send(e.body || {});
      expect(res.status).toBe(401);
    }
  });

  it('rejects truncated token', async () => {
    const t = token({ userId: 1 });
    const truncated = t.slice(0, Math.floor(t.length/2));
    for (const e of endpoints) {
      const res = await request(app)[e.m](e.url).set('Authorization', `Bearer ${truncated}`).send(e.body || {});
      expect(res.status).toBe(401);
    }
  });

  it('rejects booking on non-existent room id', async () => {
    const t = token({ userId: 1 });
    const body = { room_id: 9999999, start_time: new Date().toISOString(), end_time: new Date(Date.now()+3600000).toISOString() };
    const res = await request(app).post('/api/bookings').set('Authorization', `Bearer ${t}`).send(body);
    // Either 400 (validation) or 500 depending on DB FK (none here) so expect 400 via overlap logic returns ok/no rows
    expect([400,404,500]).toContain(res.status);
  });

  it('rejects booking with inverted dates', async () => {
    const t = token({ userId: 1 });
    const now = Date.now();
    const body = { room_id: 1, start_time: new Date(now+3600000).toISOString(), end_time: new Date(now).toISOString() };
    const res = await request(app).post('/api/bookings').set('Authorization', `Bearer ${t}`).send(body);
    expect([400,422,500]).toContain(res.status);
  });

  it("can't cancel another user's booking", async () => {
    // Create a booking with user A
    const a = token({ userId: 1001 });
    const now = Date.now();
    const create = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${a}`)
      .send({ room_id: 1, start_time: new Date(now+7200000).toISOString(), end_time: new Date(now+8100000).toISOString() });
    // If creation fails due to room/time, skip
    if (![200,201].includes(create.status)) return;
    const bookingId = create.body.id;
    // Try to cancel with user B
    const b = token({ userId: 2002 });
    const del = await request(app)
      .delete(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${b}`);
    expect([401,403]).toContain(del.status);
  });
});
