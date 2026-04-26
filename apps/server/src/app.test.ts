import { describe, expect, it } from 'bun:test';
import { app } from './app';

describe('app', () => {
  it('GET /health returns 200', async () => {
    const res = await app.handle(new Request('http://test/health'));
    expect(res.status).toBe(200);
  });
});
