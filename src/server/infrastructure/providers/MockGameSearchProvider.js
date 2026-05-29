import { gameFromMockEntry } from '../mappers/gameMapper';

/**
 * Provider de busca do modo demonstração: filtra o mockData por título.
 * Implementa {@link import('../../application/ports/GameSearchProvider').GameSearchProvider}.
 */
export class MockGameSearchProvider {
  /** @param {{ data: Array }} deps */
  constructor({ data }) {
    this.data = data;
  }

  /**
   * @param {string} query
   * @param {number} limit
   */
  async search(query, limit) {
    const q = query.toLowerCase();
    const results = this.data
      .filter((g) => g.name.toLowerCase().includes(q))
      .slice(0, limit)
      .map(gameFromMockEntry);

    return { results, source: 'mock' };
  }
}
