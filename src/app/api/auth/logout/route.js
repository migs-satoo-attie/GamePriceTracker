/**
 * POST /api/auth/logout
 *
 * Encerra a sessão limpando o cookie.
 */
import { buildAuth, SESSION_COOKIE } from '@/server/infrastructure/composition/auth';
import { serializeCookie } from '@/server/infrastructure/http/cookies';

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const { cookieOptions } = buildAuth({ origin });

  const cleared = serializeCookie(SESSION_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Set-Cookie': cleared },
  });
}
