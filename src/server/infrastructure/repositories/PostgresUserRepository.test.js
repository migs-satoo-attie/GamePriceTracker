import { PostgresUserRepository } from './PostgresUserRepository';
import { UserProfile } from '../../domain/value-objects/UserProfile';

function fakeDb(rows = []) {
  return {
    calls: [],
    rows,
    async query(sql, params) {
      this.calls.push({ sql, params });
      return { rows: this.rows };
    },
  };
}

describe('PostgresUserRepository', () => {
  it('upsert: INSERT ... ON CONFLICT DO UPDATE com os campos do usuário', async () => {
    const db = fakeDb();
    const repo = new PostgresUserRepository({ db });
    await repo.upsert({ steamId: '76561197960287930', username: 'gaben', avatar: 'av' });

    expect(db.calls[0].sql).toMatch(/INSERT INTO users/i);
    expect(db.calls[0].sql).toMatch(/ON CONFLICT \(steam_id\) DO UPDATE/i);
    expect(db.calls[0].params).toEqual(['76561197960287930', 'gaben', 'av']);
  });

  it('findBySteamId: SELECT e mapeia linha para UserProfile', async () => {
    const db = fakeDb([{ steam_id: '76561197960287930', username: 'gaben', avatar: 'av' }]);
    const repo = new PostgresUserRepository({ db });

    const user = await repo.findBySteamId('76561197960287930');
    expect(db.calls[0].sql).toMatch(/SELECT .*FROM users WHERE steam_id = \$1/is);
    expect(user).toBeInstanceOf(UserProfile);
    expect(user.username).toBe('gaben');
  });

  it('findBySteamId: null quando não há linhas', async () => {
    const repo = new PostgresUserRepository({ db: fakeDb([]) });
    expect(await repo.findBySteamId('000')).toBeNull();
  });
});
