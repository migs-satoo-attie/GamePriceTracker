import { createLogger } from '../../shared/logger';

const logger = createLogger('FallbackGameSearchProvider');

/**
 * Provider de busca composto: tenta os providers em ordem e retorna o resultado
 * do primeiro que **não lançar** (resultados vazios são uma resposta válida).
 * Provê tolerância a falhas: se a fonte primária cair, usa a próxima.
 *
 * Implementa {@link import('../../application/ports/GameSearchProvider').GameSearchProvider}.
 */
export class FallbackGameSearchProvider {
  /** @param {Array<{ search: Function }>} providers — em ordem de prioridade */
  constructor(providers) {
    if (!Array.isArray(providers) || providers.length === 0) {
      throw new Error('FallbackGameSearchProvider: lista de providers vazia');
    }
    this.providers = providers;
  }

  /**
   * @param {string} query
   * @param {number} limit
   */
  async search(query, limit) {
    for (const provider of this.providers) {
      try {
        return await provider.search(query, limit);
      } catch (err) {
        logger.warn('provider de busca falhou, tentando próximo', {
          provider: provider.constructor?.name,
          error: err.message,
        });
      }
    }
    return { results: [], source: 'empty' };
  }
}
