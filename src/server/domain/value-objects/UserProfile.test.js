import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  const valid = { username: 'gaben', avatar: 'https://x/a.jpg', steamId: '76561197960287930' };

  it('cria com username, avatar e steamId', () => {
    const u = new UserProfile(valid);
    expect(u.username).toBe('gaben');
    expect(u.avatar).toBe('https://x/a.jpg');
    expect(u.steamId).toBe('76561197960287930');
  });

  it('serializa exatamente no formato consumido pelo front', () => {
    expect(new UserProfile(valid).toJSON()).toEqual(valid);
  });

  it('exige username não vazio', () => {
    expect(() => new UserProfile({ ...valid, username: '' })).toThrow(/username/i);
  });

  it('é imutável', () => {
    expect(Object.isFrozen(new UserProfile(valid))).toBe(true);
  });
});
