import { UserProfile } from '../../domain/value-objects/UserProfile';
import { gameFromSteamAppDetail } from '../mappers/gameMapper';
import { createLogger } from '../../shared/logger';

const logger = createLogger('SteamWishlistProvider');

const DEFAULT_AVATAR =
  'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg';

/**
 * Provider de wishlist real, sobre a Steam Web API / Store API.
 *
 * Implementa {@link import('../../application/ports/WishlistProvider').WishlistProvider}.
 * O `client` é injetado e deve expor: resolveVanityUrl, getUserSummary,
 * getWishlist, getAppDetails (ver `src/lib/steam.js`).
 *
 * Busca detalhes de no máximo `maxDetails` jogos por vez (evita rate limit);
 * `totalCount` reflete o tamanho total da wishlist.
 */
export class SteamWishlistProvider {
  /**
   * @param {object} deps
   * @param {object} deps.client
   * @param {number} [deps.maxDetails] — máx. de app details por requisição (default 8)
   */
  constructor({ client, maxDetails = 8 }) {
    if (!client) throw new Error('SteamWishlistProvider: client é obrigatório');
    this.client = client;
    this.maxDetails = maxDetails;
  }

  /** @param {import('../../domain/value-objects/ProfileReference').ProfileReference} profileRef */
  async getWishlist(profileRef) {
    const steamId =
      profileRef.type === 'vanity'
        ? await this.client.resolveVanityUrl(profileRef.value)
        : profileRef.value;

    const [summary, wishlistData] = await Promise.all([
      this.client.getUserSummary(steamId),
      this.client.getWishlist(steamId),
    ]);

    const appIds = Object.keys(wishlistData);
    const totalCount = appIds.length;

    const settled = await Promise.allSettled(
      appIds.slice(0, this.maxDetails).map((id) => this.client.getAppDetails(id)),
    );

    const games = settled
      .map((res, i) => {
        if (res.status === 'rejected') {
          logger.warn('falha ao obter detalhes do app', { appId: appIds[i], error: res.reason?.message });
          return null;
        }
        if (!res.value) return null;
        return gameFromSteamAppDetail(appIds[i], res.value);
      })
      .filter(Boolean);

    const user = new UserProfile({
      username: summary?.personaname ?? 'Desconhecido',
      avatar: summary?.avatarfull ?? DEFAULT_AVATAR,
      steamId,
    });

    return { user, games, totalCount, source: 'steam' };
  }
}
