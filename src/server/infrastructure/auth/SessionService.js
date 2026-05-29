import crypto from 'node:crypto';

/**
 * Serviço de sessão baseado em token assinado por HMAC-SHA256 (stateless).
 *
 * Formato do token: `<payload-base64url>.<assinatura-base64url>`, onde o payload
 * é `{ sub: steamId, exp: epochMs }`. Não usa dependências externas (node:crypto).
 *
 * O `secret` deve vir de variável de ambiente (`SESSION_SECRET`).
 */
export class SessionService {
  /**
   * @param {object} deps
   * @param {string} deps.secret — segredo HMAC (obrigatório)
   * @param {number} [deps.ttlSeconds] — validade (default 7 dias)
   * @param {() => number} [deps.now] — relógio em ms (injetável p/ testes)
   */
  constructor({ secret, ttlSeconds = 7 * 24 * 3600, now = () => Date.now() }) {
    if (!secret || typeof secret !== 'string') {
      throw new Error('SessionService: secret é obrigatório');
    }
    this.secret = secret;
    this.ttlSeconds = ttlSeconds;
    this.now = now;
  }

  /** @param {string} data */
  #sign(data) {
    return crypto.createHmac('sha256', this.secret).update(data).digest('base64url');
  }

  /**
   * @param {string} steamId
   * @returns {string} token assinado
   */
  issue(steamId) {
    const payload = { sub: String(steamId), exp: this.now() + this.ttlSeconds * 1000 };
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${body}.${this.#sign(body)}`;
  }

  /**
   * @param {string} token
   * @returns {{ steamId: string }}
   * @throws se inválido, adulterado ou expirado
   */
  verify(token) {
    if (typeof token !== 'string' || !token.includes('.')) {
      throw new Error('Sessão: token malformado');
    }
    const [body, sig] = token.split('.');
    if (!body || !sig) throw new Error('Sessão: token malformado');

    const expected = this.#sign(body);
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      throw new Error('Sessão: assinatura inválida');
    }

    let payload;
    try {
      payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    } catch {
      throw new Error('Sessão: payload inválido');
    }

    if (typeof payload.exp !== 'number' || payload.exp <= this.now()) {
      throw new Error('Sessão: token expirado');
    }

    return { steamId: payload.sub };
  }
}
