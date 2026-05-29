import { buildGetWishlist } from './wishlist';

const DATA = [
  { id: '1', name: 'A', coverImage: 'cA', originalPrice: 10, currentPrice: 8, historicalLow: 5, discountPercent: 20, store: 'Steam', priceHistory: [] },
  { id: '2', name: 'B', coverImage: 'cB', originalPrice: 50, currentPrice: 50, historicalLow: 25, discountPercent: 0, store: 'Steam', priceHistory: [] },
];

describe('buildGetWishlist (composition root)', () => {
  it('modo demo (sem STEAM_API_KEY): usa o provider mock', async () => {
    const useCase = buildGetWishlist({ env: {}, data: DATA });
    const result = await useCase.execute('authenticated_user_mock');
    expect(result.source).toBe('mock');
    expect(result.totalCount).toBe(12);
    expect(result.games.length).toBeGreaterThan(0);
  });

  it('com STEAM_API_KEY: usa o provider Steam (client injetado)', async () => {
    const steamClient = {
      resolveVanityUrl: async () => '76561197960287930',
      getUserSummary: async () => ({ personaname: 'gaben', avatarfull: 'av' }),
      getWishlist: async () => ({ '1091500': {} }),
      getAppDetails: async () => ({ name: 'Cyberpunk', price_overview: { initial: 19990, final: 9995, discount_percent: 50 } }),
    };
    const useCase = buildGetWishlist({ env: { STEAM_API_KEY: 'x' }, data: DATA, steamClient });
    const result = await useCase.execute('gaben');

    expect(result.source).toBe('steam');
    expect(result.user.username).toBe('gaben');
    expect(result.games[0].toJSON().currentPrice).toBe(99.95);
  });
});
