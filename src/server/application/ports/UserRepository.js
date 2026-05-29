/**
 * Porta (interface) para persistência de usuários (conta Steam associada).
 *
 * @typedef {object} UserInput
 * @property {string} steamId
 * @property {string} username
 * @property {string} [avatar]
 *
 * @interface
 */
export class UserRepository {
  /**
   * Insere ou atualiza o usuário (e registra o login).
   * @param {UserInput} _user
   * @returns {Promise<import('../../domain/value-objects/UserProfile').UserProfile>}
   */
  // eslint-disable-next-line no-unused-vars
  async upsert(_user) {
    throw new Error('UserRepository.upsert não implementado');
  }

  /**
   * @param {string} _steamId
   * @returns {Promise<import('../../domain/value-objects/UserProfile').UserProfile|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findBySteamId(_steamId) {
    throw new Error('UserRepository.findBySteamId não implementado');
  }
}
