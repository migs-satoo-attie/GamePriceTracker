import { PriceHistory } from '../../domain/entities/PriceHistory';

/**
 * Provider de histórico baseado nos snapshots persistidos (Postgres).
 *
 * Implementa {@link import('../../application/ports/PriceHistoryProvider').PriceHistoryProvider}.
 * Retorna `null` quando não há snapshots — permitindo que o
 * {@link FallbackPriceHistoryProvider} caia para ITAD/mock.
 */
export class DbPriceHistoryProvider {
  /** @param {{ repository: import('../../application/ports/PriceSnapshotRepository').PriceSnapshotRepository }} deps */
  constructor({ repository }) {
    if (!repository) throw new Error('DbPriceHistoryProvider: repository é obrigatório');
    this.repository = repository;
  }

  /** @param {string} gameId */
  async getPriceHistory(gameId) {
    const points = await this.repository.findByGame(gameId);
    if (!points || points.length === 0) return null;
    return { history: new PriceHistory(gameId, points), source: 'db' };
  }
}
