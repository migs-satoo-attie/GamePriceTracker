/**
 * GET /api/auth/steam/login
 *
 * Inicia o login via Steam OpenID: redireciona (302) o usuário para a página de
 * autenticação da Steam.
 *
 * Integração com o front (sem alterar o existente): basta o botão
 * "Sign in with Steam" navegar para esta rota (ex.: window.location =
 * '/api/auth/steam/login').
 */
import { buildAuth } from '@/server/infrastructure/composition/auth';

export async function GET(request) {
  const origin = new URL(request.url).origin;
  const { begin } = buildAuth({ origin });
  return Response.redirect(begin.execute(), 302);
}
