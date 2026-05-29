/**
 * Use-case: iniciar o login via Steam OpenID.
 * Retorna a URL para a qual o usuário deve ser redirecionado.
 */
export class BeginSteamLogin {
  /** @param {{ openIdClient: { buildAuthUrl: () => string } }} deps */
  constructor({ openIdClient }) {
    if (!openIdClient) throw new Error('BeginSteamLogin: openIdClient é obrigatório');
    this.openIdClient = openIdClient;
  }

  /** @returns {string} URL de redirecionamento para a Steam */
  execute() {
    return this.openIdClient.buildAuthUrl();
  }
}
