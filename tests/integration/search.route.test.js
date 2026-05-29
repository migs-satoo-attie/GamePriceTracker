import { GET } from '@/app/api/search/route';

describe('GET /api/search (integração)', () => {
  const original = process.env.ITAD_API_KEY;

  afterEach(() => {
    if (original === undefined) delete process.env.ITAD_API_KEY;
    else process.env.ITAD_API_KEY = original;
  });

  it('400 quando q está ausente ou curto demais', async () => {
    delete process.env.ITAD_API_KEY;
    const r1 = await GET(new Request('http://localhost/api/search'));
    expect(r1.status).toBe(400);
    const r2 = await GET(new Request('http://localhost/api/search?q=a'));
    expect(r2.status).toBe(400);
  });

  it('modo demo: retorna { results, source } filtrando o mock', async () => {
    delete process.env.ITAD_API_KEY;
    const res = await GET(new Request('http://localhost/api/search?q=cyber'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.source).toBe('mock');
    expect(Array.isArray(body.results)).toBe(true);
    expect(body.results.length).toBeGreaterThan(0);
    expect(body.results[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        currentPrice: expect.any(Number),
        discountPercent: expect.any(Number),
      }),
    );
  });
});
