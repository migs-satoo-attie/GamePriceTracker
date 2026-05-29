/**
 * Porta (interface) para fontes de histórico de preços.
 *
 * A camada de aplicação depende desta abstração, não de implementações
 * concretas (ITAD, banco de dados, mock). Adapters na camada de infraestrutura
 * implementam este contrato, permitindo múltiplos providers desacoplados e
 * substituíveis (Dependency Inversion).
 *
 * @typedef {object} PriceHistoryResult
 * @property {import('../../domain/entities/PriceHistory').PriceHistory} history
 *   Histórico de preços do jogo (pode estar vazio).
 * @property {string} source — origem dos dados (ex.: 'itad', 'mock', 'db').
 * @property {import('../../domain/value-objects/Money').Money} [fallback]
 *   Preço usado para meses anteriores ao primeiro dado conhecido.
 *
 * @interface
 */
export class PriceHistoryProvider {
  /**
   * Retorna o histórico de preços de um jogo, ou `null` se não encontrado.
   * @param {string} gameId — Steam AppID
   * @returns {Promise<PriceHistoryResult|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async getPriceHistory(gameId) {
    throw new Error('PriceHistoryProvider.getPriceHistory não implementado');
  }
}
