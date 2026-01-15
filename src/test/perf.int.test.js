const request = require('supertest');
const app = require('../app');

function ms(start) { return Number(process.hrtime.bigint() - start) / 1e6; }

async function measure(method, url, setup) {
  if (setup) await setup();
  const t0 = process.hrtime.bigint();
  const res = await request(app)[method](url);
  const dur = ms(t0);
  return { status: res.status, dur };
}

describe('Performance basic measurements', () => {
  it('GET /health x3', async () => {
    const runs = [];
    for (let i=0;i<3;i++) runs.push(await measure('get', '/health'));
    expect(runs.every(r => r.status === 200)).toBe(true);
    // console.log('health ms:', runs.map(r=>r.dur.toFixed(2)));
  });

  it('GET /api/rooms x3', async () => {
    const runs = [];
    for (let i=0;i<3;i++) runs.push(await measure('get', '/api/rooms'));
    expect(runs.every(r => r.status === 200)).toBe(true);
  });

  it('GET /api/rooms/available x4', async () => {
    const now = Date.now();
    const q = `?start_time=${encodeURIComponent(new Date(now+3600000).toISOString())}&end_time=${encodeURIComponent(new Date(now+7200000).toISOString())}`;
    const runs = [];
    for (let i=0;i<4;i++) runs.push(await measure('get', `/api/rooms/available${q}`));
    expect(runs.every(r => r.status === 200)).toBe(true);
  });

  it('GET /health single run', async () => {
    const r = await measure('get', '/health');
    expect(r.status).toBe(200);
  });

  it('GET /api/rooms single run A', async () => {
    const r = await measure('get', '/api/rooms');
    expect(r.status).toBe(200);
  });

  it('GET /api/rooms single run B', async () => {
    const r = await measure('get', '/api/rooms');
    expect(r.status).toBe(200);
  });

  it('GET /api/rooms/available window 1', async () => {
    const now = Date.now();
    const q = `?start_time=${encodeURIComponent(new Date(now+1800000).toISOString())}&end_time=${encodeURIComponent(new Date(now+2700000).toISOString())}`;
    const r = await measure('get', `/api/rooms/available${q}`);
    expect(r.status).toBe(200);
  });

  it('GET /api/rooms/available window 2', async () => {
    const now = Date.now();
    const q = `?start_time=${encodeURIComponent(new Date(now+5400000).toISOString())}&end_time=${encodeURIComponent(new Date(now+6300000).toISOString())}`;
    const r = await measure('get', `/api/rooms/available${q}`);
    expect(r.status).toBe(200);
  });

  it('GET /api/rooms/available window 3', async () => {
    const now = Date.now();
    const q = `?start_time=${encodeURIComponent(new Date(now+900000).toISOString())}&end_time=${encodeURIComponent(new Date(now+1200000).toISOString())}`;
    const r = await measure('get', `/api/rooms/available${q}`);
    expect(r.status).toBe(200);
  });
});
