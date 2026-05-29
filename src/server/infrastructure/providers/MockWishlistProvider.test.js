import { MockWishlistProvider } from './MockWishlistProvider';
import { Game } from '../../domain/entities/Game';
import { UserProfile } from '../../domain/value-objects/UserProfile';
import { ProfileReference } from '../../domain/value-objects/ProfileReference';

const DATA = [
  { id: '1', name: 'A', coverImage: 'cA', originalPrice: 10, currentPrice: 8, historicalLow: 5, discountPercent: 20, store: 'Steam', priceHistory: [10, 8] },
  { id: '2', name: 'B', coverImage: 'cB', originalPrice: 50, currentPrice: 50, historicalLow: 25, discountPercent: 0, store: 'Steam', priceHistory: [50, 50] },
];

const USER = { username: 'GamerUser99', avatar: 'av', steamId: '76561198000000000' };

// Sampler determinístico para os testes (sem aleatoriedade).
const headSampler = (data, count) => data.slice(0, count);

describe('MockWishlistProvider', () => {
  it('retorna user, games (entidades), totalCount e source "mock"', async () => {
    const provider = new MockWishlistProvider({ data: DATA, user: USER, count: 1, totalCount: 12, sampler: headSampler });
    const result = await provider.getWishlist(ProfileReference.parse('qualquer'));

    expect(result.source).toBe('mock');
    expect(result.totalCount).toBe(12);
    expect(result.user).toBeInstanceOf(UserProfile);
    expect(result.user.username).toBe('GamerUser99');
    expect(result.games).toHaveLength(1);
    expect(result.games[0]).toBeInstanceOf(Game);
  });

  it('mapeia preços e preserva o priceHistory do mock', async () => {
    const provider = new MockWishlistProvider({ data: DATA, user: USER, count: 2, sampler: headSampler });
    const result = await provider.getWishlist(ProfileReference.parse('x'));
    const json = result.games[0].toJSON();

    expect(json).toMatchObject({ id: '1', currentPrice: 8, originalPrice: 10, historicalLow: 5, discountPercent: 20 });
    expect(json.priceHistory).toEqual([10, 8]);
  });

  it('limita a quantidade de games ao count', async () => {
    const provider = new MockWishlistProvider({ data: DATA, user: USER, count: 1, sampler: headSampler });
    const result = await provider.getWishlist(ProfileReference.parse('x'));
    expect(result.games).toHaveLength(1);
  });
});
