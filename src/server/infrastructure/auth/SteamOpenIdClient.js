import { SteamId } from '../../domain/value-objects/SteamId';

const OPENID_NS = 'http://specs.openid.net/auth/2.0';
const IDENTIFIER_SELECT = 'http://specs.openid.net/auth/2.0/identifier_select';
const STEAM_OPENID_ENDPOINT = 'https://steamcommunity.com/openid/login';

/**
 * Client de autenticação Steam via OpenID 2.0.
 *
 * - `buildAuthUrl()` monta a URL de redirecionamento (checkid_setup).
 * - `verify(params)` valida a asserção do callback chamando a Steam
 *   (`check_authentication`) e retorna o SteamID64.
 *
 * O `fetchFn` é injetável para testes (default: fetch global).
 */
export class SteamOpenIdClient {
  /**
   * @param {object} deps
   * @param {string} deps.realm — domínio da aplicação (ex.: http://localhost:3000)
   * @param {string} deps.returnTo — URL de callback
   * @param {string} [deps.endpoint]
   * @param {typeof fetch} [deps.fetchFn]
   */
  constructor({ realm, returnTo, endpoint = STEAM_OPENID_ENDPOINT, fetchFn = fetch }) {
    if (!realm || !returnTo) throw new Error('SteamOpenIdClient: realm e returnTo são obrigatórios');
    this.realm = realm;
    this.returnTo = returnTo;
    this.endpoint = endpoint;
    this.fetchFn = fetchFn;
  }

  /** @returns {string} URL para redirecionar o usuário ao login da Steam */
  buildAuthUrl() {
    const params = new URLSearchParams({
      'openid.ns': OPENID_NS,
      'openid.mode': 'checkid_setup',
      'openid.return_to': this.returnTo,
      'openid.realm': this.realm,
      'openid.identity': IDENTIFIER_SELECT,
      'openid.claimed_id': IDENTIFIER_SELECT,
    });
    return `${this.endpoint}?${params.toString()}`;
  }

  /**
   * @param {Record<string, string>} params — parâmetros openid.* do callback
   * @returns {Promise<string>} SteamID64
   * @throws se a asserção for inválida
   */
  async verify(params) {
    if (params['openid.mode'] !== 'id_res') {
      throw new Error('OpenID: modo de resposta inesperado');
    }

    const body = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (key.startsWith('openid.')) body.set(key, value);
    }
    body.set('openid.mode', 'check_authentication');

    const res = await this.fetchFn(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    const text = await res.text();

    if (!/is_valid\s*:\s*true/i.test(text)) {
      throw new Error('OpenID: asserção inválida (is_valid != true)');
    }

    // Valida host/formato do claimed_id antes de confiar no SteamID.
    return SteamId.fromClaimedId(params['openid.claimed_id']).value;
  }
}
