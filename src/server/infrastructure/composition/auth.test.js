import { buildAuth, SESSION_COOKIE } from './auth';
import { InMemoryUserRepository } from '../repositories/InMemoryUserRepository';

describe('buildAuth (composition root)', () => {
  it('expõe os use-cases e o nome do cookie', () => {
    const auth = buildAuth({ env: {}, origin: 'http://localhost:3000' });
    expect(auth.begin).toBeDefined();
    expect(auth.complete).toBeDefined();
    expect(auth.getCurrentUser).toBeDefined();
    expect(SESSION_COOKIE).toBe('gpt_session');
  });

  it('begin gera a URL de login com o returnTo baseado no origin', () => {
    const auth = buildAuth({ env: {}, origin: 'http://localhost:3000' });
    const url = new URL(auth.begin.execute());
    expect(`${url.origin}${url.pathname}`).toBe('https://steamcommunity.com/openid/login');
    expect(url.searchParams.get('openid.return_to')).toBe('http://localhost:3000/api/auth/steam/callback');
  });

  it('cookieOptions é httpOnly e não-secure fora de produção', () => {
    const auth = buildAuth({ env: { NODE_ENV: 'development' }, origin: 'http://localhost:3000' });
    expect(auth.cookieOptions.httpOnly).toBe(true);
    expect(auth.cookieOptions.secure).toBe(false);
  });

  it('login round-trip em memória: complete persiste e getCurrentUser recupera', async () => {
    const userRepository = new InMemoryUserRepository();
    const openIdClient = { verify: async () => '76561197960287930', buildAuthUrl: () => 'x' };
    const auth = buildAuth({ env: {}, origin: 'http://localhost:3000', deps: { userRepository, openIdClient } });

    const { token } = await auth.complete.execute({ 'openid.mode': 'id_res' });
    const user = await auth.getCurrentUser.execute(token);
    expect(user.steamId).toBe('76561197960287930');
  });
});
