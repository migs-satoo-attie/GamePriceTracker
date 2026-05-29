/**
 * Value Object para um SteamID64 (17 dígitos). Imutável.
 */
export class SteamId {
  /** @param {string} value */
  constructor(value) {
    if (typeof value !== 'string' || !/^\d{17}$/.test(value)) {
      throw new Error('SteamId: SteamID64 inválido (esperado 17 dígitos)');
    }
    this.value = value;
    Object.freeze(this);
  }

  /** @param {string} value */
  static create(value) {
    return new SteamId(value);
  }

  /**
   * Extrai o SteamID do `claimed_id` retornado pelo OpenID da Steam,
   * ex.: `https://steamcommunity.com/openid/id/76561197960287930`.
   * @param {string} claimedId
   * @returns {SteamId}
   */
  static fromClaimedId(claimedId) {
    if (typeof claimedId !== 'string') {
      throw new Error('SteamId: claimed_id ausente');
    }
    const match = claimedId.match(/^https:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/);
    if (!match) {
      throw new Error('SteamId: claimed_id em formato/host inesperado');
    }
    return new SteamId(match[1]);
  }

  toString() {
    return this.value;
  }

  toJSON() {
    return this.value;
  }
}
