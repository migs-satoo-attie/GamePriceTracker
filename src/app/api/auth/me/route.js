/**
 * GET /api/auth/me
 *
 * Retorna o usuário autenticado (a partir do cookie de sessão).
 *
 *   autenticado     → 200 { authenticated: true, user: { username, avatar, steamId } }
 *   não autenticado → 401 { authenticated: false }
 */
import { buildAuth, SESSION_COOKIE } from '@/server/infrastructure/composition/auth';
import { parseCookies } from '@/server/infrastructure/http/cookies';

export async function GET(request) {
  const origin = new URL(request.url).origin;
  const { getCurrentUser } = buildAuth({ origin });

  const token = parseCookies(request.headers.get('cookie'))[SESSION_COOKIE];
  const user = await getCurrentUser.execute(token);

  if (!user) {
    return Response.json({ authenticated: false }, { status: 401 });
  }
  return Response.json({ authenticated: true, user });
}
