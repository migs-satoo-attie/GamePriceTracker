import { createLogger } from '../../shared/logger';

const logger = createLogger('CompleteSteamLogin');

/**
 * Use-case: concluir o login via Steam OpenID.
 *
 * Verifica a asserção do callback, (opcionalmente) busca o perfil público para
 * enriquecer o usuário, persiste-o e emite um token de sessão.
 */
export class CompleteSteamLogin {
  /**
   * @param {object} deps
   * @param {{ verify: (params: object) => Promise<string> }} deps.openIdClient
   * @param {{ issue: (steamId: string) => string }} deps.sessionService
   * @param {import('../ports/UserRepository').UserRepository} deps.userRepository
   * @param {(steamId: string) => Promise<{username?:string, avatar?:string}>} [deps.fetchProfile]
   */
  constructor({ openIdClient, sessionService, userRepository, fetchProfile }) {
    if (!openIdClient || !sessionService || !userRepository) {
      throw new Error('CompleteSteamLogin: dependências obrigatórias ausentes');
    }
    this.openIdClient = openIdClient;
    this.sessionService = sessionService;
    this.userRepository = userRepository;
    this.fetchProfile = fetchProfile;
  }

  /**
   * @param {Record<string, string>} params — parâmetros openid.* do callback
   * @returns {Promise<{ token: string, user: import('../../domain/value-objects/UserProfile').UserProfile, steamId: string }>}
   */
  async execute(params) {
    const steamId = await this.openIdClient.verify(params); // lança se inválido

    let username = steamId;
    let avatar = '';
    if (this.fetchProfile) {
      try {
        const profile = await this.fetchProfile(steamId);
        if (profile) {
          username = profile.username || steamId;
          avatar = profile.avatar || '';
        }
      } catch (err) {
        // Perfil é enriquecimento opcional — não bloqueia o login.
        logger.warn('falha ao buscar perfil no login (seguindo sem)', { steamId, error: err.message });
      }
    }

    const user = await this.userRepository.upsert({ steamId, username, avatar });
    const token = this.sessionService.issue(steamId);
    return { token, user, steamId };
  }
}
