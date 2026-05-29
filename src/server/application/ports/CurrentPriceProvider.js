/**
 * Porta (interface) para obter o preço atual de um jogo.
 *
 * @typedef {object} CurrentPrice
 * @property {import('../../domain/value-objects/Money').Money} price
 * @property {number} discountPercent
 *
 * @interface
 */
export class CurrentPriceProvider {
  /**
   * @param {string} _gameId
   * @returns {Promise<CurrentPrice|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async getCurrentPrice(_gameId) {
    throw new Error('CurrentPriceProvider.getCurrentPrice não implementado');
  }
}
