/**
 * Porta (interface) para busca de jogos por título.
 *
 * @typedef {object} GameSearchResult
 * @property {import('../../domain/entities/Game').Game[]} results
 * @property {string} source — origem ('itad' | 'mock')
 *
 * @interface
 */
export class GameSearchProvider {
  /**
   * @param {string} query — termo de busca (já validado/trimado)
   * @param {number} limit — máximo de resultados
   * @returns {Promise<GameSearchResult>}
   */
  // eslint-disable-next-line no-unused-vars
  async search(query, limit) {
    throw new Error('GameSearchProvider.search não implementado');
  }
}
