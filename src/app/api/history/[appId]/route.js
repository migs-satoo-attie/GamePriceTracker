/**
 * GET /api/history/[appId]
 *
 * Retorna o histórico de preços mensal (12 pontos) de um jogo, no formato
 * consumido pelo gráfico do front-end (`PriceChartModal`).
 *
 * A lógica de negócio vive na camada de back-end (`src/server`):
 *   route handler (controller fino) → use-case GetGameHistory → providers.
 *
 * - Com ITAD_API_KEY: usa IsThereAnyDeal como fonte primária, com fallback
 *   automático para o mock em caso de falha (tolerância a falhas externas).
 * - Sem chave: modo demonstração, usa o priceHistory do mockData.
 *
 * Resposta:
 *   { history: number[], source: 'itad' | 'mock' | 'empty' }
 */

import { buildGetGameHistory } from '@/server/infrastructure/composition/priceHistory';
import { createLogger } from '@/server/shared/logger';

const logger = createLogger('api/history');

export async function GET(request, { params }) {
  const { appId } = await params;

  try {
    const useCase = buildGetGameHistory();
    const result = await useCase.execute(String(appId));
    return Response.json(result);
  } catch (err) {
    // Resiliência: o gráfico nunca deve quebrar a página por falha de back-end.
    logger.error('falha ao obter histórico', { appId, error: err.message });
    return Response.json({ history: [], source: 'empty', warning: err.message });
  }
}
