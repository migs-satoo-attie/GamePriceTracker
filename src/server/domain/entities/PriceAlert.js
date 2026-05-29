import { Money } from '../value-objects/Money';

const VALID_KINDS = new Set(['target_reached', 'price_drop']);

/**
 * Entidade que representa um alerta de preço disparado para um jogo.
 *
 * `kind`:
 *  - `target_reached` — preço atingiu ou ficou abaixo do preço-alvo do usuário
 *  - `price_drop`     — preço caiu em relação ao último registrado
 */
export class PriceAlert {
  /**
   * @param {object} props
   * @param {string} props.gameId
   * @param {string} props.gameName
   * @param {Money} props.currentPrice
   * @param {Money|null} [props.previousPrice]
   * @param {Money|null} [props.targetPrice]
   * @param {'target_reached'|'price_drop'} props.kind
   * @param {Date} props.triggeredAt
   */
  constructor({ gameId, gameName, currentPrice, previousPrice = null, targetPrice = null, kind, triggeredAt }) {
    if (!(currentPrice instanceof Money)) {
      throw new TypeError('PriceAlert: currentPrice deve ser Money');
    }
    if (!VALID_KINDS.has(kind)) {
      throw new Error(`PriceAlert: kind inválido (${kind})`);
    }
    this.gameId = String(gameId);
    this.gameName = gameName;
    this.currentPrice = currentPrice;
    this.previousPrice = previousPrice;
    this.targetPrice = targetPrice;
    this.kind = kind;
    this.triggeredAt = triggeredAt instanceof Date ? triggeredAt : new Date(triggeredAt);
    Object.freeze(this);
  }

  toJSON() {
    return {
      gameId: this.gameId,
      gameName: this.gameName,
      currentPrice: this.currentPrice.toReais(),
      previousPrice: this.previousPrice ? this.previousPrice.toReais() : null,
      targetPrice: this.targetPrice ? this.targetPrice.toReais() : null,
      kind: this.kind,
      triggeredAt: this.triggeredAt.toISOString(),
    };
  }
}
