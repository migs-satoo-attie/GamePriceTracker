import { GET } from '@/app/api/wishlist/route';

describe('GET /api/wishlist (integração)', () => {
  const original = process.env.STEAM_API_KEY;

  afterEach(() => {
    if (original === undefined) delete process.env.STEAM_API_KEY;
    else process.env.STEAM_API_KEY = original;
  });

  it('400 quando o parâmetro profile está ausente', async () => {
    delete process.env.STEAM_API_KEY;
    const res = await GET(new Request('http://localhost/api/wishlist'));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/profile/i);
  });

  it('modo demo: retorna o contrato { user, games, totalCount, source }', async () => {
    delete process.env.STEAM_API_KEY;
    const res = await GET(new Request('http://localhost/api/wishlist?profile=authenticated_user_mock'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.source).toBe('mock');
    expect(body.totalCount).toBe(12);
    expect(Array.isArray(body.games)).toBe(true);
    expect(body.games.length).toBeGreaterThan(0);
    expect(body.user).toEqual(
      expect.objectContaining({ username: expect.any(String), avatar: expect.any(String), steamId: expect.any(String) }),
    );
    // schema de um game preservado
    expect(body.games[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        coverImage: expect.any(String),
        originalPrice: expect.any(Number),
        currentPrice: expect.any(Number),
        historicalLow: expect.any(Number),
        discountPercent: expect.any(Number),
        store: expect.any(String),
        priceHistory: expect.any(Array),
      }),
    );
  });
});
