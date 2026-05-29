/**
 * Use-case: obter o usuário autenticado a partir de um token de sessão.
 * Retorna `null` (em vez de lançar) para token ausente/ inválido/ expirado,
 * facilitando o tratamento de "não autenticado" nas rotas.
 */
export class GetCurrentUser {
  /**
   * @param {object} deps
   * @param {{ verify: (token: string) => { steamId: string } }} deps.sessionService
   * @param {import('../ports/UserRepository').UserRepository} deps.userRepository
   */
  constructor({ sessionService, userRepository }) {
    if (!sessionService || !userRepository) {
      throw new Error('GetCurrentUser: dependências obrigatórias ausentes');
    }
    this.sessionService = sessionService;
    this.userRepository = userRepository;
  }

  /**
   * @param {string|null|undefined} token
   * @returns {Promise<import('../../domain/value-objects/UserProfile').UserProfile|null>}
   */
  async execute(token) {
    if (!token) return null;

    let steamId;
    try {
      ({ steamId } = this.sessionService.verify(token));
    } catch {
      return null;
    }

    return this.userRepository.findBySteamId(steamId);
  }
}
