const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const { errorHandler } = require('../middleware/errorHandler');
const roomsController = require('../controllers/roomsController');
const bookingsController = require('../controllers/bookingsController');

const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function mockRes() {
  const res = {};
  res.statusCode = 200;
  res.body = undefined;
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (obj) => { res.body = obj; return res; };
  return res;
}

describe('auth middleware (unit)', () => {
  it('returns 401 when header missing', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();
    auth(req, res, next);
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 when malformed header', () => {
    const req = { headers: { authorization: 'Bearer' } };
    const res = mockRes();
    const next = jest.fn();
    auth(req, res, next);
    expect(res.statusCode).toBe(401);
  });

  it('calls next on valid token', () => {
    const token = jwt.sign({ userId: 1 }, SECRET, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();
    auth(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('errorHandler (unit)', () => {
  it('maps ValidationError to 400', () => {
    const err = new Error('bad');
    err.name = 'ValidationError';
    const req = {}; const res = mockRes(); const next = jest.fn();
    errorHandler(err, req, res, next);
    expect(res.statusCode).toBe(400);
  });

  it('maps UnauthorizedError to 401', () => {
    const err = new Error('no');
    err.name = 'UnauthorizedError';
    const req = {}; const res = mockRes(); const next = jest.fn();
    errorHandler(err, req, res, next);
    expect(res.statusCode).toBe(401);
  });

  it('defaults to 500', () => {
    const err = new Error('x');
    const req = {}; const res = mockRes(); const next = jest.fn();
    errorHandler(err, req, res, next);
    expect(res.statusCode).toBe(500);
  });
});

describe('controllers validations (unit)', () => {
  it('roomsController.create 400 when missing name/capacity', async () => {
    const req = { body: { name: undefined, capacity: undefined } };
    const res = mockRes();
    const next = jest.fn();
    await roomsController.create(req, res, next);
    expect(res.statusCode).toBe(400);
  });

  it('bookingsController.create 400 when missing fields', async () => {
    const req = { user: { userId: 1 }, body: { } };
    const res = mockRes();
    const next = jest.fn();
    await bookingsController.create(req, res, next);
    expect(res.statusCode).toBe(400);
  });
});
