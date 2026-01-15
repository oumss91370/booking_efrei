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
});
