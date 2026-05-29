import { Money } from '../../domain/value-objects/Money';

/**
 * Provider de preço atual no modo demonstração (mockData).
 * Implementa {@link import('../../application/ports/CurrentPriceProvider').CurrentPriceProvider}.
 */
export class MockCurrentPriceProvider {
  /** @param {{ data: Array }} deps */
  constructor({ data }) {
    this.data = data;
  }

  async getCurrentPrice(gameId) {
    const game = this.data.find((g) => g.id === gameId);
    if (!game) return null;
    return {
      price: Money.fromReais(game.currentPrice ?? 0),
      discountPercent: game.discountPercent ?? 0,
    };
  }
}
