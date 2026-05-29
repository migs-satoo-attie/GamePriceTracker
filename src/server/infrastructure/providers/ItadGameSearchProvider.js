import { gameFromItadSearch } from '../mappers/gameMapper';

/**
 * Provider de busca real, sobre a IsThereAnyDeal (ITAD) API.
 * Implementa {@link import('../../application/ports/GameSearchProvider').GameSearchProvider}.
 *
 * O `client` é injetado e deve expor:
 *   searchGames(query, limit) e getGamePrices(ids).
 * Erros são propagados (a estratégia de fallback fica em
 * {@link FallbackGameSearchProvider}).
 */
export class ItadGameSearchProvider {
  /** @param {{ client: object }} deps */
  constructor({ client }) {
    if (!client) throw new Error('ItadGameSearchProvider: client é obrigatório');
    this.client = client;
  }

  /**
   * @param {string} query
   * @param {number} limit
   */
  async search(query, limit) {
    const games = await this.client.searchGames(query, limit);

    if (!games || games.length === 0) {
      return { results: [], source: 'itad' };
    }

    const ids = games.map((g) => g.id);
    const pricesRaw = await this.client.getGamePrices(ids);
    const priceMap = Object.fromEntries((pricesRaw ?? []).map((p) => [p.id, p]));

    const results = games.map((g) => gameFromItadSearch(g, priceMap[g.id]));
    return { results, source: 'itad' };
  }
}
