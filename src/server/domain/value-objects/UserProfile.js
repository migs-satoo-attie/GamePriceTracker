/**
 * Value Object com os dados públicos de um perfil Steam exibidos pelo front.
 * Serializa exatamente como `{ username, avatar, steamId }`.
 *
 * Instâncias são imutáveis.
 */
export class UserProfile {
  /**
   * @param {object} params
   * @param {string} params.username
   * @param {string} params.avatar
   * @param {string} params.steamId
   */
  constructor({ username, avatar, steamId }) {
    if (typeof username !== 'string' || username.trim().length === 0) {
      throw new Error('UserProfile: username é obrigatório');
    }
    this.username = username;
    this.avatar = avatar ?? '';
    this.steamId = steamId ?? '';
    Object.freeze(this);
  }

  toJSON() {
    return { username: this.username, avatar: this.avatar, steamId: this.steamId };
  }
}
