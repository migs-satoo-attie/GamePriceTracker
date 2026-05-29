import { GET } from '@/app/api/history/[appId]/route';
import { mockData } from '@/data/mockData';

/** Simula o segundo argumento (context) do route handler do Next 16. */
function ctx(appId) {
  return { params: Promise.resolve({ appId }) };
}

describe('GET /api/history/[appId] (integração)', () => {
  const original = process.env.ITAD_API_KEY;

  afterEach(() => {
    if (original === undefined) delete process.env.ITAD_API_KEY;
    else process.env.ITAD_API_KEY = original;
  });

  it('modo demo: retorna a série mock de 12 meses preservando o contrato', async () => {
    delete process.env.ITAD_API_KEY;

    const res = await GET(new Request('http://localhost/api/history/1091500'), ctx('1091500'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.source).toBe('mock');
    expect(body.history).toHaveLength(12);
    expect(body.history).toEqual(mockData.find((g) => g.id === '1091500').priceHistory);
  });

  it('appId desconhecido: retorna history vazio e source "empty"', async () => {
    delete process.env.ITAD_API_KEY;

    const res = await GET(new Request('http://localhost/api/history/000'), ctx('000'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ history: [], source: 'empty' });
  });
});
