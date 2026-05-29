import { SteamWishlistProvider } from './SteamWishlistProvider';
import { Game } from '../../domain/entities/Game';
import { ProfileReference } from '../../domain/value-objects/ProfileReference';

function makeClient(overrides = {}) {
  return {
    resolveVanityUrl: jest.fn(async () => '76561197960287930'),
    getUserSummary: jest.fn(async () => ({ personaname: 'gaben', avatarfull: 'avatar.jpg' })),
    getWishlist: jest.fn(async () => ({
      '1091500': { name: 'Cyberpunk' },
      '1245620': { name: 'Elden Ring' },
    })),
    getAppDetails: jest.fn(async (appId) => ({
      name: `Game ${appId}`,
      price_overview: { initial: 19990, final: 9995, discount_percent: 50 },
    })),
    ...overrides,
  };
}

describe('SteamWishlistProvider', () => {
  it('resolve vanity, busca perfil + wishlist e mapeia para Game (source "steam")', async () => {
    const client = makeClient();
    const provider = new SteamWishlistProvider({ client });
    const result = await provider.getWishlist(ProfileReference.parse('gaben'));

    expect(client.resolveVanityUrl).toHaveBeenCalledWith('gaben');
    expect(result.source).toBe('steam');
    expect(result.user.username).toBe('gaben');
    expect(result.user.steamId).toBe('76561197960287930');
    expect(result.totalCount).toBe(2);
    expect(result.games[0]).toBeInstanceOf(Game);
    expect(result.games[0].toJSON()).toMatchObject({ currentPrice: 99.95, originalPrice: 199.9, discountPercent: 50 });
  });

  it('não resolve vanity quando o input já é SteamID64', async () => {
    const client = makeClient();
    const provider = new SteamWishlistProvider({ client });
    await provider.getWishlist(ProfileReference.parse('76561197960287930'));

    expect(client.resolveVanityUrl).not.toHaveBeenCalled();
    expect(client.getUserSummary).toHaveBeenCalledWith('76561197960287930');
  });

  it('limita os detalhes buscados a maxDetails', async () => {
    const client = makeClient({
      getWishlist: jest.fn(async () => ({ a: {}, b: {}, c: {} })),
    });
    const provider = new SteamWishlistProvider({ client, maxDetails: 2 });
    const result = await provider.getWishlist(ProfileReference.parse('x'));

    expect(client.getAppDetails).toHaveBeenCalledTimes(2);
    expect(result.totalCount).toBe(3); // total reflete a wishlist inteira
    expect(result.games).toHaveLength(2);
  });

  it('descarta apps sem detalhes (null) ou que falharam', async () => {
    const client = makeClient({
      getWishlist: jest.fn(async () => ({ '1': {}, '2': {}, '3': {} })),
      getAppDetails: jest.fn(async (id) => {
        if (id === '2') return null;
        if (id === '3') throw new Error('store 500');
        return { name: 'OK', price_overview: { initial: 1000, final: 1000, discount_percent: 0 } };
      }),
    });
    const provider = new SteamWishlistProvider({ client });
    const result = await provider.getWishlist(ProfileReference.parse('x'));

    expect(result.games).toHaveLength(1);
    expect(result.games[0].name).toBe('OK');
  });

  it('mapeia apps sem price_overview como preço zero', async () => {
    const client = makeClient({
      getWishlist: jest.fn(async () => ({ '1': {} })),
      getAppDetails: jest.fn(async () => ({ name: 'Free Game' })),
    });
    const provider = new SteamWishlistProvider({ client });
    const result = await provider.getWishlist(ProfileReference.parse('x'));

    expect(result.games[0].toJSON()).toMatchObject({ currentPrice: 0, originalPrice: 0, discountPercent: 0 });
  });
});
