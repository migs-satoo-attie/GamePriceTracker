/**
 * GET /api/wishlist?profile={input}
 *
 * Retorna a wishlist e os dados do perfil de um usuário Steam.
 * O parâmetro `profile` aceita SteamID64, URL de perfil (/profiles/ ou /id/) ou
 * vanity/username.
 *
 * A lógica vive na camada de back-end (`src/server`):
 *   route handler (controller fino) → use-case GetWishlist → providers.
 *
 * - Com STEAM_API_KEY: consulta a Steam Web API / Store API.
 * - Sem chave: modo demonstração (mockData).
 *
 * Resposta:
 *   { user: { username, avatar, steamId }, games: Game[], totalCount, source: 'steam' | 'mock' }
 */

import { buildGetWishlist } from '@/server/infrastructure/composition/wishlist';
import { createLogger } from '@/server/shared/logger';

const logger = createLogger('api/wishlist');

export async function GET(request) {
  const profileInput = new URL(request.url).searchParams.get('profile')?.trim();

  if (!profileInput) {
    return Response.json({ error: 'Parâmetro profile obrigatório' }, { status: 400 });
  }

  try {
    const useCase = buildGetWishlist();
    const result = await useCase.execute(profileInput);
    return Response.json(result);
  } catch (err) {
    logger.error('falha ao obter wishlist', { error: err.message });
    return Response.json({ error: err.message }, { status: 502 });
  }
}
