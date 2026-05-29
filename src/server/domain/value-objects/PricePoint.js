import { Money } from './Money';

/**
 * Value Object que representa o preço de um jogo em um instante no tempo.
 * É a unidade básica do histórico temporal de preços.
 *
 * Instâncias são imutáveis.
 */
export class PricePoint {
  /**
   * @param {object} params
   * @param {Money} params.price — preço registrado
   * @param {Date|string|number} params.recordedAt — momento do registro
   */
  constructor({ price, recordedAt }) {
    if (!(price instanceof Money)) {
      throw new TypeError('PricePoint: price deve ser uma instância de Money');
    }

    const date = recordedAt instanceof Date ? recordedAt : new Date(recordedAt);
    if (Number.isNaN(date.getTime())) {
      throw new TypeError('PricePoint: recordedAt deve ser uma data válida');
    }

    /** @type {Money} */
    this.price = price;
    /** @type {Date} */
    this.recordedAt = date;
    Object.freeze(this);
  }

  toJSON() {
    return {
      price: this.price.toReais(),
      recordedAt: this.recordedAt.toISOString(),
    };
  }
}
