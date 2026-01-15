const request = require('supertest');
const app = require('../app');
const sql = require('../config/db');

function randEmail() {
  const n = Math.floor(Math.random() * 1e9);
  return `user${n}@test.com`;
}

describe('Auth integration', () => {
  it('registers then logs in a user', async () => {
    const email = randEmail();
    const password = 'Passw0rd!';
    const username = 'tester';

    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email, password, username });
    expect(reg.status).toBe(201);
    expect(reg.body).toHaveProperty('token');

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    expect(login.status).toBe(200);
    expect(login.body).toHaveProperty('token');
    expect(login.body.user.email).toBe(email);
  });

  it('rejects duplicate email on register', async () => {
    const email = randEmail();
    const password = 'Passw0rd!';
    const username = 'dup';

    const first = await request(app).post('/api/auth/register').send({ email, password, username });
    expect(first.status).toBe(201);

    const second = await request(app).post('/api/auth/register').send({ email, password, username });
    expect([400, 409]).toContain(second.status);
  });

  it('rejects invalid login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nouser@test.com', password: 'wrong' });
    expect([401, 400]).toContain(res.status);
  });
});

afterAll(async () => {
  if (sql && typeof sql.end === 'function') {
    try { await sql.end({ timeout: 1 }); } catch (_) {}
  }
});
