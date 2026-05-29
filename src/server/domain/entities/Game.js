import { Money } from '../value-objects/Money';

/**
 * Entidade que representa um jogo monitorável.
 *
 * Mantém preços como {@link Money} (centavos) internamente e serializa via
 * `toJSON()` no schema exato consumido pelo front-end (preços em reais),
 * idêntico ao `mockData`.
 */
export class Game {
  /**
   * @param {object} props
   * @param {string|number} props.id — Steam AppID
   * @param {string} props.name
   * @param {string} props.coverImage
   * @param {Money} props.originalPrice
   * @param {Money} props.currentPrice
   * @param {Money} [props.historicalLow] — default: currentPrice
   * @param {number} [props.discountPercent] — 0..100
   * @param {string} [props.store]
   * @param {number[]} [props.priceHistory] — série mensal em reais (default [])
   */
  constructor({
    id,
    name,
    coverImage,
    originalPrice,
    currentPrice,
    historicalLow,
    discountPercent = 0,
    store = 'Steam',
    priceHistory = [],
  }) {
    if (id === undefined || id === null || String(id).length === 0) {
      throw new Error('Game: id é obrigatório');
    }
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Game: name é obrigatório');
    }
    if (!(originalPrice instanceof Money) || !(currentPrice instanceof Money)) {
      throw new TypeError('Game: originalPrice e currentPrice devem ser Money');
    }
    if (historicalLow !== undefined && !(historicalLow instanceof Money)) {
      throw new TypeError('Game: historicalLow deve ser Money');
    }
    if (!Number.isInteger(discountPercent) || discountPercent < 0 || discountPercent > 100) {
      throw new RangeError('Game: discountPercent (desconto) deve ser inteiro entre 0 e 100');
    }

    this.id = String(id);
    this.name = name;
    this.coverImage = coverImage;
    this.originalPrice = originalPrice;
    this.currentPrice = currentPrice;
    this.historicalLow = historicalLow ?? currentPrice;
    this.discountPercent = discountPercent;
    this.store = store;
    this.priceHistory = [...priceHistory];
    Object.freeze(this);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      coverImage: this.coverImage,
      originalPrice: this.originalPrice.toReais(),
      currentPrice: this.currentPrice.toReais(),
      historicalLow: this.historicalLow.toReais(),
      discountPercent: this.discountPercent,
      store: this.store,
      priceHistory: this.priceHistory,
    };
  }
}
