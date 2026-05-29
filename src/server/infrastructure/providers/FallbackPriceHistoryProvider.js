import { createLogger } from '../../shared/logger';

const logger = createLogger('FallbackPriceHistoryProvider');

/**
 * Provider composto: tenta uma cadeia de providers em ordem e usa o primeiro
 * que retornar um resultado com pontos. Providers que lançam ou retornam
 * `null`/vazio são pulados — provendo tolerância a falhas de fontes externas.
 *
 * Implementa {@link import('../../application/ports/PriceHistoryProvider').PriceHistoryProvider}.
 */
export class FallbackPriceHistoryProvider {
  /** @param {Array<{ getPriceHistory: Function }>} providers — em ordem de prioridade */
  constructor(providers) {
    if (!Array.isArray(providers) || providers.length === 0) {
      throw new Error('FallbackPriceHistoryProvider: lista de providers vazia');
    }
    this.providers = providers;
  }

  /** @param {string} gameId */
  async getPriceHistory(gameId) {
    for (const provider of this.providers) {
      try {
        const result = await provider.getPriceHistory(gameId);
        if (result && result.history && result.history.points.length > 0) {
          return result;
        }
      } catch (err) {
        logger.warn('provider falhou, tentando próximo', {
          gameId,
          provider: provider.constructor?.name,
          error: err.message,
        });
      }
    }
    return null;
  }
}
