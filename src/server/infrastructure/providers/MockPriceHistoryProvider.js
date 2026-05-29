import { PriceHistory } from '../../domain/entities/PriceHistory';
import { PricePoint } from '../../domain/value-objects/PricePoint';
import { Money } from '../../domain/value-objects/Money';

/**
 * Converte uma série mensal pré-agregada (number[], do mês mais antigo ao mais
 * recente) em PricePoints posicionados no meio de cada mês relativo a `now`.
 * O dia 15 ao meio-dia evita ambiguidades de fuso nas bordas do mês.
 *
 * @param {number[]} series
 * @param {Date} now
 * @returns {PricePoint[]}
 */
function pointsFromMonthlySeries(series, now) {
  const len = series.length;
  return series.map((reais, i) => {
    const offset = len - 1 - i;
    const recordedAt = new Date(now.getFullYear(), now.getMonth() - offset, 15, 12, 0, 0, 0);
    return new PricePoint({ price: Money.fromReais(reais), recordedAt });
  });
}

/**
 * Provider de histórico baseado no mock local (modo demonstração).
 *
 * Implementa {@link import('../../application/ports/PriceHistoryProvider').PriceHistoryProvider}.
 * Nunca lança por falha de rede (é dados locais); retorna `null` quando o jogo
 * não existe no mock ou não tem histórico.
 */
export class MockPriceHistoryProvider {
  /**
   * @param {object} deps
   * @param {Array<{id: string, priceHistory: number[]}>} deps.data — mockData
   * @param {() => Date} [deps.clock]
   */
  constructor({ data, clock = () => new Date() }) {
    this.data = data;
    this.clock = clock;
  }

  /** @param {string} gameId */
  async getPriceHistory(gameId) {
    const game = this.data.find((g) => g.id === gameId);
    if (!game || !Array.isArray(game.priceHistory) || game.priceHistory.length === 0) {
      return null;
    }

    const points = pointsFromMonthlySeries(game.priceHistory, this.clock());
    return {
      history: new PriceHistory(gameId, points),
      source: 'mock',
    };
  }
}
