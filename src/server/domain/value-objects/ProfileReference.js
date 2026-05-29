/**
 * Value Object que representa a referência a um perfil Steam informada pelo
 * usuário, normalizada para `{ type, value }`.
 *
 * Aceita: SteamID64 (17 dígitos), URL /profiles/<id>, URL /id/<vanity> ou um
 * username/vanity solto.
 *
 * Instâncias são imutáveis.
 */
export class ProfileReference {
  /**
   * @param {'steamid'|'vanity'} type
   * @param {string} value
   */
  constructor(type, value) {
    this.type = type;
    this.value = value;
    Object.freeze(this);
  }

  /** @returns {boolean} true para strings com exatamente 17 dígitos (SteamID64) */
  static isSteamId64(str) {
    return /^\d{17}$/.test(str);
  }

  /**
   * @param {string} input — entrada bruta do usuário
   * @returns {ProfileReference}
   */
  static parse(input) {
    if (typeof input !== 'string' || input.trim().length === 0) {
      throw new Error('ProfileReference: parâmetro profile é obrigatório');
    }

    const trimmed = input.trim();

    const profileMatch = trimmed.match(/steamcommunity\.com\/profiles\/(\d{17})/);
    if (profileMatch) return new ProfileReference('steamid', profileMatch[1]);

    const idMatch = trimmed.match(/steamcommunity\.com\/id\/([^/?#]+)/);
    if (idMatch) return new ProfileReference('vanity', idMatch[1]);

    if (ProfileReference.isSteamId64(trimmed)) return new ProfileReference('steamid', trimmed);

    return new ProfileReference('vanity', trimmed);
  }
}
