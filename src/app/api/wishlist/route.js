/**
 * GET /api/wishlist?profile={input}
 *
 * Retorna wishlist e dados do perfil de um usuário Steam.
 * O parâmetro `profile` aceita:
 *   - SteamID64 (17 dígitos)              → ex.: "76561198000000000"
 *   - URL completa do perfil              → ex.: "https://steamcommunity.com/id/username/"
 *   - URL de perfil numérico             → ex.: "https://steamcommunity.com/profiles/76561198..."
 *   - Vanity URL / username              → ex.: "username"
 *
 * - Com STEAM_API_KEY configurada: consulta a Steam Web API e Store API.
 * - Sem chave: retorna dados mock (modo demo).
 *
 * Resposta:
 *   { user: UserProfile, games: Game[], totalCount: number, source: 'steam' | 'mock' }
 */

import { resolveVanityUrl, getUserSummary, getWishlist, getAppDetails, normalizeAppDetail } from '@/lib/steam';
import { mockData } from '@/data/mockData';

const MOCK_AVATAR = 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg';
const MAX_WISHLIST_DETAILS = 8; // limite de app details buscados por vez (evita rate limit)

/** Retorna true para strings com exatamente 17 dígitos (SteamID64) */
function isSteamId64(str) {
  return /^\d{17}$/.test(str);
}

/**
 * Interpreta o input do usuário e retorna { type: 'steamid' | 'vanity', value: string }.
 */
function parseProfileInput(input) {
  const trimmed = input.trim();

  // URL do tipo /profiles/STEAMID64
  const profileMatch = trimmed.match(/steamcommunity\.com\/profiles\/(\d{17})/);
  if (profileMatch) return { type: 'steamid', value: profileMatch[1] };

  // URL do tipo /id/vanity
  const idMatch = trimmed.match(/steamcommunity\.com\/id\/([^/?#]+)/);
  if (idMatch) return { type: 'vanity', value: idMatch[1] };

  // SteamID64 direto
  if (isSteamId64(trimmed)) return { type: 'steamid', value: trimmed };

  // Assume vanity URL / username
  return { type: 'vanity', value: trimmed };
}

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const profileInput = searchParams.get('profile')?.trim();

  if (!profileInput) {
    return Response.json({ error: 'Parâmetro profile obrigatório' }, { status: 400 });
  }

  // ── Modo demo (sem chave Steam) ─────────────────────────────────────────
  if (!process.env.STEAM_API_KEY) {
    const shuffled = [...mockData].sort(() => 0.5 - Math.random()).slice(0, 4);
    return Response.json({
      user: { username: 'GamerUser99', avatar: MOCK_AVATAR, steamId: '76561198000000000' },
      games: shuffled,
      totalCount: 12,
      source: 'mock',
    });
  }

  // ── Modo real (Steam API) ───────────────────────────────────────────────
  try {
    const parsed = parseProfileInput(profileInput);
    let steamId64;

    if (parsed.type === 'vanity') {
      steamId64 = await resolveVanityUrl(parsed.value);
    } else {
      steamId64 = parsed.value;
    }

    // Busca perfil e wishlist em paralelo
    const [userSummary, wishlistData] = await Promise.all([
      getUserSummary(steamId64),
      getWishlist(steamId64),
    ]);

    const appIds = Object.keys(wishlistData);
    const totalCount = appIds.length;

    // Busca detalhes dos primeiros MAX_WISHLIST_DETAILS jogos
    const detailResults = await Promise.allSettled(
      appIds.slice(0, MAX_WISHLIST_DETAILS).map(id => getAppDetails(id))
    );

    const games = detailResults
      .map((result, i) => {
        if (result.status === 'rejected' || !result.value) return null;
        return normalizeAppDetail(appIds[i], result.value);
      })
      .filter(Boolean);

    return Response.json({
      user: {
        username: userSummary?.personaname ?? 'Desconhecido',
        avatar: userSummary?.avatarfull ?? MOCK_AVATAR,
        steamId: steamId64,
      },
      games,
      totalCount,
      source: 'steam',
    });
  } catch (err) {
    console.error('[/api/wishlist] Erro Steam API:', err.message);
    return Response.json({ error: err.message }, { status: 502 });
  }
}
