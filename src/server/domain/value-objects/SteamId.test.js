import { SteamId } from './SteamId';

describe('SteamId (value object)', () => {
  it('cria a partir de um SteamID64 válido (17 dígitos)', () => {
    const id = SteamId.create('76561197960287930');
    expect(id.value).toBe('76561197960287930');
    expect(String(id)).toBe('76561197960287930');
  });

  it('rejeita valores que não sejam 17 dígitos', () => {
    expect(() => SteamId.create('123')).toThrow(/SteamID/i);
    expect(() => SteamId.create('abcdefghijklmnopq')).toThrow(/SteamID/i);
    expect(() => SteamId.create('')).toThrow(/SteamID/i);
  });

  it('extrai o SteamID do claimed_id do OpenID da Steam', () => {
    const id = SteamId.fromClaimedId('https://steamcommunity.com/openid/id/76561197960287930');
    expect(id.value).toBe('76561197960287930');
  });

  it('rejeita claimed_id de host/formato inesperado', () => {
    expect(() => SteamId.fromClaimedId('https://evil.com/openid/id/76561197960287930')).toThrow();
    expect(() => SteamId.fromClaimedId('https://steamcommunity.com/openid/id/abc')).toThrow();
    expect(() => SteamId.fromClaimedId(undefined)).toThrow();
  });

  it('serializa como string e é imutável', () => {
    const id = SteamId.create('76561197960287930');
    expect(id.toJSON()).toBe('76561197960287930');
    expect(Object.isFrozen(id)).toBe(true);
  });
});
