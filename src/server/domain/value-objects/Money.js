/**
 * Value Object que representa um valor monetário em BRL.
 *
 * Armazena o valor internamente em **centavos inteiros** para evitar os erros
 * de ponto flutuante típicos de operações com `float` (ex.: 0.1 + 0.2). A API
 * pública expõe reais (`toReais`/`toJSON`) para manter compatibilidade com o
 * schema consumido pelo front-end, onde preços são números em reais.
 *
 * Instâncias são imutáveis (Object.freeze).
 */
export class Money {
  /** @param {number} cents — valor em centavos (inteiro, não-negativo) */
  constructor(cents) {
    if (typeof cents !== 'number' || Number.isNaN(cents)) {
      throw new TypeError('Money: valor deve ser um número');
    }
    if (!Number.isInteger(cents)) {
      throw new RangeError('Money: centavos devem ser um inteiro');
    }
    if (cents < 0) {
      throw new RangeError('Money: valor não pode ser negativo');
    }
    /** @type {number} */
    this.cents = cents;
    Object.freeze(this);
  }

  /**
   * @param {number} cents
   * @returns {Money}
   */
  static fromCents(cents) {
    return new Money(cents);
  }

  /**
   * @param {number} reais — valor em reais; arredondado para o centavo mais próximo
   * @returns {Money}
   */
  static fromReais(reais) {
    if (typeof reais !== 'number' || Number.isNaN(reais)) {
      throw new TypeError('Money: valor deve ser um número');
    }
    if (reais < 0) {
      throw new RangeError('Money: valor não pode ser negativo');
    }
    return new Money(Math.round(reais * 100));
  }

  /** @returns {number} valor em reais com 2 casas decimais */
  toReais() {
    return this.cents / 100;
  }

  /** Serialização JSON: número em reais (compatível com o schema do front). */
  toJSON() {
    return this.toReais();
  }

  /**
   * @param {Money} other
   * @returns {boolean}
   */
  equals(other) {
    return other instanceof Money && other.cents === this.cents;
  }

  /**
   * @param {Money} other
   * @returns {boolean}
   */
  isLessThan(other) {
    return this.cents < other.cents;
  }

  /**
   * @param {Money} other
   * @returns {boolean}
   */
  isGreaterThan(other) {
    return this.cents > other.cents;
  }
}
