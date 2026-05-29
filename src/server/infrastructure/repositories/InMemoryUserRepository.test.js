import { InMemoryUserRepository } from './InMemoryUserRepository';
import { UserProfile } from '../../domain/value-objects/UserProfile';

describe('InMemoryUserRepository', () => {
  it('upsert insere e findBySteamId devolve um UserProfile', async () => {
    const repo = new InMemoryUserRepository();
    await repo.upsert({ steamId: '76561197960287930', username: 'gaben', avatar: 'av' });

    const user = await repo.findBySteamId('76561197960287930');
    expect(user).toBeInstanceOf(UserProfile);
    expect(user.toJSON()).toEqual({ username: 'gaben', avatar: 'av', steamId: '76561197960287930' });
  });

  it('upsert atualiza um usuário existente', async () => {
    const repo = new InMemoryUserRepository();
    await repo.upsert({ steamId: '76561197960287930', username: 'old', avatar: 'a1' });
    await repo.upsert({ steamId: '76561197960287930', username: 'new', avatar: 'a2' });

    const user = await repo.findBySteamId('76561197960287930');
    expect(user.username).toBe('new');
    expect(user.avatar).toBe('a2');
  });

  it('findBySteamId devolve null quando não existe', async () => {
    expect(await new InMemoryUserRepository().findBySteamId('000')).toBeNull();
  });
});
