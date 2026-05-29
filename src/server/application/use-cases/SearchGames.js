/**
 * Use-case: buscar jogos por título.
 *
 * Valida a query (mínimo 2 caracteres) e delega a um {@link GameSearchProvider}.
 * Mantém o contrato da rota `/api/search`: { results, source }.
 */
export class SearchGames {
  /**
   * @param {object} deps
   * @param {import('../ports/GameSearchProvider').GameSearchProvider} deps.provider
   * @param {number} [deps.limit] — máximo de resultados (default 20)
   */
  constructor({ provider, limit = 20 }) {
    if (!provider) throw new Error('SearchGames: provider é obrigatório');
    this.provider = provider;
    this.limit = limit;
  }

  /**
   * @param {string} query
   * @returns {Promise<import('../ports/GameSearchProvider').GameSearchResult>}
   */
  async execute(query) {
    const trimmed = typeof query === 'string' ? query.trim() : '';
    if (trimmed.length < 2) {
      throw new Error('SearchGames: query deve ter no mínimo 2 caracteres');
    }
    return this.provider.search(trimmed, this.limit);
  }
}
