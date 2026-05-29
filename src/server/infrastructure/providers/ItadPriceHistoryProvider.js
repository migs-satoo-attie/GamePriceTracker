import { PriceHistory } from '../../domain/entities/PriceHistory';
import { PricePoint } from '../../domain/value-objects/PricePoint';
import { Money } from '../../domain/value-objects/Money';

/**
 * Provider de histórico baseado na IsThereAnyDeal (ITAD) API.
 *
 * Implementa {@link import('../../application/ports/PriceHistoryProvider').PriceHistoryProvider}.
 * O `client` é injetado (Dependency Inversion) e deve expor
 * `getPriceHistory(gameId) => Promise<Array<{ timestamp: number, price: { amount: number } }>>`.
 * Falhas do client são propagadas — a estratégia de fallback fica a cargo de
 * {@link FallbackPriceHistoryProvider}.
 */
export class ItadPriceHistoryProvider {
  /**
   * @param {object} deps
   * @param {{ getPriceHistory: (gameId: string) => Promise<Array> }} deps.client
   * @param {(gameId: string) => (import('../../domain/value-objects/Money').Money|null)} [deps.resolveFallback]
   */
  constructor({ client, resolveFallback }) {
    if (!client) throw new Error('ItadPriceHistoryProvider: client é obrigatório');
    this.client = client;
    this.resolveFallback = resolveFallback;
  }

  /** @param {string} gameId — ITAD game ID */
  async getPriceHistory(gameId) {
    const raw = await this.client.getPriceHistory(gameId);

    const points = (raw ?? [])
      .filter((p) => p && p.price && typeof p.price.amount === 'number')
      .map(
        (p) =>
          new PricePoint({
            price: Money.fromReais(p.price.amount),
            recordedAt: new Date(p.timestamp * 1000),
          }),
      );

    const fallback = this.resolveFallback ? this.resolveFallback(gameId) : undefined;

    return {
      history: new PriceHistory(gameId, points),
      source: 'itad',
      ...(fallback ? { fallback } : {}),
    };
  }
}
