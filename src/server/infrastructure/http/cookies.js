/**
 * Helpers de cookie para os route handlers (sem dependências externas),
 * usando as APIs Web Request/Response.
 */

/**
 * @param {string|undefined|null} header — valor do header `Cookie`
 * @returns {Record<string, string>}
 */
export function parseCookies(header) {
  if (!header) return {};
  const out = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (!key) continue;
    try {
      out[key] = decodeURIComponent(value);
    } catch {
      out[key] = value;
    }
  }
  return out;
}

/**
 * @param {string} name
 * @param {string} value
 * @param {object} [options]
 * @param {boolean} [options.httpOnly]
 * @param {boolean} [options.secure]
 * @param {'Lax'|'Strict'|'None'} [options.sameSite]
 * @param {string} [options.path]
 * @param {number} [options.maxAge] — em segundos
 * @returns {string} valor para o header `Set-Cookie`
 */
export function serializeCookie(name, value, options = {}) {
  const { httpOnly, secure, sameSite, path = '/', maxAge } = options;
  const segments = [`${name}=${encodeURIComponent(value)}`];

  segments.push(`Path=${path}`);
  if (typeof maxAge === 'number') segments.push(`Max-Age=${maxAge}`);
  if (sameSite) segments.push(`SameSite=${sameSite}`);
  if (httpOnly) segments.push('HttpOnly');
  if (secure) segments.push('Secure');

  return segments.join('; ');
}
