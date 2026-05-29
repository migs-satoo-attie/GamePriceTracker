/**
 * GET /api/auth/steam/callback
 *
 * Callback do Steam OpenID. Verifica a asserção, cria a sessão (cookie httpOnly
 * assinado) e redireciona de volta para a aplicação.
 *
 *   sucesso → 302 para `/`
 *   falha   → 302 para `/?auth=error`
 */
import { buildAuth, SESSION_COOKIE } from '@/server/infrastructure/composition/auth';
import { serializeCookie } from '@/server/infrastructure/http/cookies';
import { createLogger } from '@/server/shared/logger';

const logger = createLogger('api/auth/callback');

export async function GET(request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const params = Object.fromEntries(url.searchParams.entries());

  const { complete, cookieOptions } = buildAuth({ origin });

  try {
    const { token } = await complete.execute(params);
    const cookie = serializeCookie(SESSION_COOKIE, token, cookieOptions);
    return new Response(null, {
      status: 302,
      headers: { Location: `${origin}/`, 'Set-Cookie': cookie },
    });
  } catch (err) {
    logger.warn('falha no callback de login', { error: err.message });
    return new Response(null, { status: 302, headers: { Location: `${origin}/?auth=error` } });
  }
}
