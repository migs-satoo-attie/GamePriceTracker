import { Money } from '../value-objects/Money';
import { PriceAlert } from '../entities/PriceAlert';

/**
 * Regra de domínio que decide se um novo preço dispara um alerta.
 *
 * Prioridade: `target_reached` (preço ≤ alvo) > `price_drop` (caiu vs anterior).
 *
 * @param {object} params
 * @param {string} params.gameId
 * @param {string} params.gameName
 * @param {Money} params.currentPrice
 * @param {Money|null} [params.previousPrice]
 * @param {Money|null} [params.targetPrice]
 * @param {Date} [params.now]
 * @returns {PriceAlert|null}
 */
export function detectAlert({ gameId, gameName, currentPrice, previousPrice = null, targetPrice = null, now = new Date() }) {
  if (!(currentPrice instanceof Money)) {
    throw new TypeError('detectAlert: currentPrice deve ser Money');
  }

  const common = { gameId, gameName, currentPrice, previousPrice, targetPrice, triggeredAt: now };

  if (targetPrice instanceof Money && !currentPrice.isGreaterThan(targetPrice)) {
    return new PriceAlert({ ...common, kind: 'target_reached' });
  }

  if (previousPrice instanceof Money && currentPrice.isLessThan(previousPrice)) {
    return new PriceAlert({ ...common, kind: 'price_drop' });
  }

  return null;
}
