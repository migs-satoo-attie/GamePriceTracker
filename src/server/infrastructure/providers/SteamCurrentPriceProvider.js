import { Money } from '../../domain/value-objects/Money';

/**
 * Provider de preço atual sobre a Steam Store API.
 * Implementa {@link import('../../application/ports/CurrentPriceProvider').CurrentPriceProvider}.
 *
 * `client.getAppDetails(appId)` retorna o app detail (preços em centavos).
 * Erros são propagados (a retentativa/tolerância fica no use-case de sync).
 */
export class SteamCurrentPriceProvider {
  /** @param {{ client: { getAppDetails: Function } }} deps */
  constructor({ client }) {
    if (!client) throw new Error('SteamCurrentPriceProvider: client é obrigatório');
    this.client = client;
  }

  async getCurrentPrice(gameId) {
    const detail = await this.client.getAppDetails(gameId);
    if (!detail) return null;
    const po = detail.price_overview;
    return {
      price: Money.fromCents(po?.final ?? 0),
      discountPercent: po?.discount_percent ?? 0,
    };
  }
}
