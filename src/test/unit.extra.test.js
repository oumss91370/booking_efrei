const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const roomsController = require('../controllers/roomsController');

const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function mockRes() {
  const res = {};
  res.statusCode = 200;
  res.body = undefined;
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (obj) => { res.body = obj; return res; };
  return res;
}

describe('auth middleware extra (unit)', () => {
  it('returns 401 for random non-jwt token', () => {
    const req = { headers: { authorization: 'Bearer not_a_jwt_token' } };
    const res = mockRes();
    const next = jest.fn();
    auth(req, res, next);
    expect(res.statusCode).toBe(401);
  });

  it('accepts a freshly signed jwt', () => {
    const t = jwt.sign({ userId: 42 }, SECRET, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${t}` } };
    const res = mockRes();
    const next = jest.fn();
    auth(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('roomsController.available (unit-ish validation)', () => {
  it('400 when missing start_time/end_time', async () => {
    const req = { query: {} };
    const res = mockRes();
    const next = jest.fn();
    await roomsController.available(req, res, next);
    expect(res.statusCode).toBe(400);
  });
});
