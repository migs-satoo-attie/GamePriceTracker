import { ProfileReference } from './ProfileReference';

describe('ProfileReference.parse', () => {
  it('reconhece SteamID64 (17 dígitos)', () => {
    const ref = ProfileReference.parse('76561198000000000');
    expect(ref.type).toBe('steamid');
    expect(ref.value).toBe('76561198000000000');
  });

  it('extrai SteamID64 de URL /profiles/', () => {
    const ref = ProfileReference.parse('https://steamcommunity.com/profiles/76561197960287930/');
    expect(ref.type).toBe('steamid');
    expect(ref.value).toBe('76561197960287930');
  });

  it('extrai vanity de URL /id/', () => {
    const ref = ProfileReference.parse('https://steamcommunity.com/id/gaben/');
    expect(ref.type).toBe('vanity');
    expect(ref.value).toBe('gaben');
  });

  it('trata texto solto como vanity', () => {
    const ref = ProfileReference.parse('gaben');
    expect(ref.type).toBe('vanity');
    expect(ref.value).toBe('gaben');
  });

  it('faz trim do input', () => {
    expect(ProfileReference.parse('  gaben  ').value).toBe('gaben');
  });

  it('rejeita input vazio', () => {
    expect(() => ProfileReference.parse('')).toThrow(/profile|vazio|obrigat/i);
    expect(() => ProfileReference.parse('   ')).toThrow(/profile|vazio|obrigat/i);
    expect(() => ProfileReference.parse(null)).toThrow(/profile|vazio|obrigat/i);
  });

  it('é imutável', () => {
    expect(Object.isFrozen(ProfileReference.parse('gaben'))).toBe(true);
  });
});
