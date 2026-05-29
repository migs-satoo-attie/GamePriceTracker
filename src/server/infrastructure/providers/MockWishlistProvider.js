import { UserProfile } from '../../domain/value-objects/UserProfile';
import { gameFromMockEntry } from '../mappers/gameMapper';

const DEFAULT_USER = {
  username: 'GamerUser99',
  avatar: 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
  steamId: '76561198000000000',
};

/** Sampler padrão: embaralha e fatia (modo demonstração). */
const shuffleSampler = (data, count) => [...data].sort(() => 0.5 - Math.random()).slice(0, count);

/**
 * Provider de wishlist do modo demonstração (dados locais do mockData).
 *
 * Implementa {@link import('../../application/ports/WishlistProvider').WishlistProvider}.
 * Ignora o perfil informado e retorna uma amostra de jogos do mock.
 */
export class MockWishlistProvider {
  /**
   * @param {object} deps
   * @param {Array} deps.data — mockData
   * @param {{username,avatar,steamId}} [deps.user]
   * @param {number} [deps.count] — quantos jogos retornar (default 4)
   * @param {number} [deps.totalCount] — total simulado da wishlist (default 12)
   * @param {(data: Array, count: number) => Array} [deps.sampler]
   */
  constructor({ data, user = DEFAULT_USER, count = 4, totalCount = 12, sampler = shuffleSampler }) {
    this.data = data;
    this.user = user;
    this.count = count;
    this.totalCount = totalCount;
    this.sampler = sampler;
  }

  /** @param {import('../../domain/value-objects/ProfileReference').ProfileReference} _profileRef */
  // eslint-disable-next-line no-unused-vars
  async getWishlist(_profileRef) {
    const games = this.sampler(this.data, this.count).map(gameFromMockEntry);
    return {
      user: new UserProfile(this.user),
      games,
      totalCount: this.totalCount,
      source: 'mock',
    };
  }
}
