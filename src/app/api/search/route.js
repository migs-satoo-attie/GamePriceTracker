/**
 * GET /api/search?q={query}
 *
 * Busca jogos por título.
 *
 * A lógica vive na camada de back-end (`src/server`):
 *   route handler (controller fino) → use-case SearchGames → providers.
 *
 * - Com ITAD_API_KEY: IsThereAnyDeal como fonte primária, com fallback para o
 *   mock em caso de falha.
 * - Sem chave: modo demonstração (filtra o mockData).
 *
 * Resposta:
 *   { results: Game[], source: 'itad' | 'mock' | 'empty' }
 */

import { buildSearchGames } from '@/server/infrastructure/composition/search';
import { createLogger } from '@/server/shared/logger';

const logger = createLogger('api/search');

export async function GET(request) {
  const query = new URL(request.url).searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return Response.json(
      { error: 'Parâmetro q obrigatório (mínimo 2 caracteres)' },
      { status: 400 },
    );
  }

  try {
    const useCase = buildSearchGames();
    const result = await useCase.execute(query);
    return Response.json(result);
  } catch (err) {
    logger.error('falha na busca', { query, error: err.message });
    return Response.json({ results: [], source: 'mock', warning: err.message });
  }
}
