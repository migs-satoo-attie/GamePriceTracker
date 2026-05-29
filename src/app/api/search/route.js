/**
 * GET /api/search?q={query}
 *
 * Busca jogos por título.
 * - Com ITAD_API_KEY configurada: consulta a IsThereAnyDeal API.
 * - Sem chave: filtra o mockData local (modo demo).
 *
 * Resposta:
 *   { results: Game[], source: 'itad' | 'mock' }
 */

import { searchGames, getGamePrices, normalizeItadGame } from '@/lib/itad';
import { mockData } from '@/data/mockData';

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return Response.json({ error: 'Parâmetro q obrigatório (mínimo 2 caracteres)' }, { status: 400 });
  }

  // ── Modo demo (sem chave ITAD) ──────────────────────────────────────────
  if (!process.env.ITAD_API_KEY) {
    const results = mockData.filter(g =>
      g.name.toLowerCase().includes(query.toLowerCase())
    );
    return Response.json({ results, source: 'mock' });
  }

  // ── Modo real (ITAD API) ────────────────────────────────────────────────
  try {
    const games = await searchGames(query, 20);

    if (!games.length) {
      return Response.json({ results: [], source: 'itad' });
    }

    const ids = games.map(g => g.id);
    const pricesRaw = await getGamePrices(ids);

    // Indexar preços por id para cruzamento O(n)
    const priceMap = Object.fromEntries(pricesRaw.map(p => [p.id, p]));

    const results = games.map(g => normalizeItadGame(g, priceMap[g.id]));

    return Response.json({ results, source: 'itad' });
  } catch (err) {
    console.error('[/api/search] Erro ITAD, usando fallback:', err.message);

    const results = mockData.filter(g =>
      g.name.toLowerCase().includes(query.toLowerCase())
    );
    return Response.json({ results, source: 'mock', warning: err.message });
  }
}
