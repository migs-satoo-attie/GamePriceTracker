import { GetWishlist } from './GetWishlist';
import { Game } from '../../domain/entities/Game';
import { UserProfile } from '../../domain/value-objects/UserProfile';
import { ProfileReference } from '../../domain/value-objects/ProfileReference';
import { Money } from '../../domain/value-objects/Money';

function sampleResult() {
  return {
    user: new UserProfile({ username: 'gaben', avatar: 'a', steamId: '76561197960287930' }),
    games: [
      new Game({
        id: '1091500',
        name: 'Cyberpunk 2077',
        coverImage: 'c',
        originalPrice: Money.fromReais(199.9),
        currentPrice: Money.fromReais(99.95),
      }),
    ],
    totalCount: 12,
    source: 'steam',
  };
}

function fakeProvider(result) {
  return {
    refs: [],
    async getWishlist(ref) {
      this.refs.push(ref);
      return typeof result === 'function' ? result(ref) : result;
    },
  };
}

describe('GetWishlist (use-case)', () => {
  it('valida o profile (vazio → erro)', async () => {
    const useCase = new GetWishlist({ provider: fakeProvider(sampleResult()) });
    await expect(useCase.execute('')).rejects.toThrow(/profile/i);
    await expect(useCase.execute('   ')).rejects.toThrow(/profile/i);
  });

  it('passa uma ProfileReference parseada ao provider', async () => {
    const provider = fakeProvider(sampleResult());
    const useCase = new GetWishlist({ provider });
    await useCase.execute('https://steamcommunity.com/id/gaben/');

    expect(provider.refs).toHaveLength(1);
    expect(provider.refs[0]).toBeInstanceOf(ProfileReference);
    expect(provider.refs[0]).toMatchObject({ type: 'vanity', value: 'gaben' });
  });

  it('retorna user, games (entidades), totalCount e source', async () => {
    const useCase = new GetWishlist({ provider: fakeProvider(sampleResult()) });
    const result = await useCase.execute('76561197960287930');

    expect(result.user).toBeInstanceOf(UserProfile);
    expect(result.games[0]).toBeInstanceOf(Game);
    expect(result.totalCount).toBe(12);
    expect(result.source).toBe('steam');
  });

  it('serializa no contrato exato do front via JSON', async () => {
    const useCase = new GetWishlist({ provider: fakeProvider(sampleResult()) });
    const result = await useCase.execute('76561197960287930');

    const json = JSON.parse(JSON.stringify(result));
    expect(json.user).toEqual({ username: 'gaben', avatar: 'a', steamId: '76561197960287930' });
    expect(json.games[0]).toMatchObject({ id: '1091500', currentPrice: 99.95, originalPrice: 199.9 });
    expect(json).toHaveProperty('totalCount', 12);
    expect(json).toHaveProperty('source', 'steam');
  });

  it('propaga erro do provider', async () => {
    const provider = { async getWishlist() { throw new Error('Steam 502'); } };
    const useCase = new GetWishlist({ provider });
    await expect(useCase.execute('gaben')).rejects.toThrow('Steam 502');
  });
});
