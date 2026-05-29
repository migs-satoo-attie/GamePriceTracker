import { BeginSteamLogin } from './BeginSteamLogin';

describe('BeginSteamLogin (use-case)', () => {
  it('retorna a URL de redirecionamento do OpenID', () => {
    const openIdClient = { buildAuthUrl: () => 'https://steamcommunity.com/openid/login?x=1' };
    const useCase = new BeginSteamLogin({ openIdClient });
    expect(useCase.execute()).toBe('https://steamcommunity.com/openid/login?x=1');
  });
});
