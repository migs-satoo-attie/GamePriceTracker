import { POST } from '@/app/api/jobs/sync/route';
import { mockData } from '@/data/mockData';

describe('POST /api/jobs/sync (integração)', () => {
  const saved = {
    STEAM_API_KEY: process.env.STEAM_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    CRON_SECRET: process.env.CRON_SECRET,
  };

  beforeEach(() => {
    delete process.env.STEAM_API_KEY;
    delete process.env.DATABASE_URL;
    delete process.env.CRON_SECRET;
  });

  afterEach(() => {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  it('modo demo: sincroniza o catálogo e retorna o resumo', async () => {
    const res = await POST(new Request('http://localhost/api/jobs/sync', { method: 'POST' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.synced).toBe(mockData.length);
    expect(body.failures).toBe(0);
    expect(Array.isArray(body.triggered)).toBe(true);
  });

  it('exige x-cron-secret quando CRON_SECRET está definido', async () => {
    process.env.CRON_SECRET = 'segredo';

    const unauthorized = await POST(new Request('http://localhost/api/jobs/sync', { method: 'POST' }));
    expect(unauthorized.status).toBe(401);

    const authorized = await POST(
      new Request('http://localhost/api/jobs/sync', { method: 'POST', headers: { 'x-cron-secret': 'segredo' } }),
    );
    expect(authorized.status).toBe(200);
  });
});
