/**
 * GET /api/history/[appId]
 *
 * Retorna histórico de preços mensal (12 pontos) para um jogo.
 * - Com ITAD_API_KEY e itadId disponível: usa IsThereAnyDeal.
 * - Fallback: retorna o priceHistory do mockData quando o appId bate.
 * - Caso contrário: retorna array vazio.
 *
 * Resposta:
 *   { history: number[], source: 'itad' | 'mock' | 'empty' }
 */

import { getPriceHistory, buildMonthlyHistory } from '@/lib/itad';
import { mockData } from '@/data/mockData';

export async function GET(request, { params }) {
  const { appId } = await params;

  // Tenta encontrar no mockData pelo id (Steam AppID)
  const mockGame = mockData.find(g => g.id === appId);

  // ── Modo demo (sem chave ITAD ou sem itadId mapeado) ───────────────────
  if (!process.env.ITAD_API_KEY) {
    if (mockGame) {
      return Response.json({ history: mockGame.priceHistory, source: 'mock' });
    }
    return Response.json({ history: [], source: 'empty' });
  }

  // ── Modo real (ITAD API) ────────────────────────────────────────────────
  // Nota: o ITAD usa IDs próprios, não o AppID Steam.
  // Quando o game foi encontrado via busca ITAD, o campo `id` já é o ITAD ID.
  // Quando veio do mockData ou da Steam diretamente, não temos o ITAD ID mapeado,
  // então usamos o fallback do mock enquanto o mapeamento não está implementado.
  try {
    const rawHistory = await getPriceHistory(appId);
    const fallback = mockGame?.currentPrice ?? 0;
    const history = buildMonthlyHistory(rawHistory, fallback);
    return Response.json({ history, source: 'itad' });
  } catch (err) {
    console.error(`[/api/history/${appId}] Erro ITAD:`, err.message);

    if (mockGame) {
      return Response.json({ history: mockGame.priceHistory, source: 'mock', warning: err.message });
    }
    return Response.json({ history: [], source: 'empty', warning: err.message });
  }
}
