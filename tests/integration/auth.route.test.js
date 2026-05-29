import { GET as login } from '@/app/api/auth/steam/login/route';
import { GET as callback } from '@/app/api/auth/steam/callback/route';
import { GET as me } from '@/app/api/auth/me/route';
import { POST as logout } from '@/app/api/auth/logout/route';

const STEAM_ID = '76561197960287930';
const CLAIMED = `https://steamcommunity.com/openid/id/${STEAM_ID}`;

function callbackUrl() {
  const p = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'id_res',
    'openid.claimed_id': CLAIMED,
    'openid.identity': CLAIMED,
    'openid.sig': 'sig',
    'openid.signed': 'signed',
  });
  return `http://localhost:3000/api/auth/steam/callback?${p.toString()}`;
}

/** Extrai o valor do cookie de sessão de um header Set-Cookie. */
function sessionCookieFrom(res) {
  const setCookie = res.headers.get('set-cookie');
  const match = setCookie.match(/gpt_session=([^;]+)/);
  return `gpt_session=${match[1]}`;
}

describe('Rotas /api/auth (integração)', () => {
  const env = { STEAM_API_KEY: process.env.STEAM_API_KEY, DATABASE_URL: process.env.DATABASE_URL };
  let realFetch;

  beforeEach(() => {
    delete process.env.STEAM_API_KEY; // sem enriquecimento de perfil
    delete process.env.DATABASE_URL; // usa repo em memória (singleton)
    realFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = realFetch;
    if (env.STEAM_API_KEY !== undefined) process.env.STEAM_API_KEY = env.STEAM_API_KEY;
    if (env.DATABASE_URL !== undefined) process.env.DATABASE_URL = env.DATABASE_URL;
  });

  it('login: redireciona 302 para o OpenID da Steam', async () => {
    const res = await login(new Request('http://localhost:3000/api/auth/steam/login'));
    expect(res.status).toBe(302);
    const loc = res.headers.get('location');
    expect(loc).toContain('https://steamcommunity.com/openid/login');
    expect(loc).toContain('openid.mode=checkid_setup');
  });

  it('callback inválido: redireciona para /?auth=error', async () => {
    // mode != id_res → falha sem chamar a Steam
    const res = await callback(new Request('http://localhost:3000/api/auth/steam/callback?openid.mode=cancel'));
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toContain('/?auth=error');
  });

  it('fluxo completo: callback cria sessão, /me retorna o usuário, logout limpa', async () => {
    // Mocka a verificação check_authentication da Steam.
    global.fetch = jest.fn(async () => ({ text: async () => 'ns:http://specs.openid.net/auth/2.0\nis_valid:true\n' }));

    const cbRes = await callback(new Request(callbackUrl()));
    expect(cbRes.status).toBe(302);
    expect(cbRes.headers.get('location')).toBe('http://localhost:3000/');
    const cookie = sessionCookieFrom(cbRes);
    expect(cbRes.headers.get('set-cookie')).toMatch(/HttpOnly/);

    // /me com o cookie da sessão
    const meRes = await me(new Request('http://localhost:3000/api/auth/me', { headers: { cookie } }));
    expect(meRes.status).toBe(200);
    const body = await meRes.json();
    expect(body.authenticated).toBe(true);
    expect(body.user.steamId).toBe(STEAM_ID);

    // /me sem cookie → 401
    const anon = await me(new Request('http://localhost:3000/api/auth/me'));
    expect(anon.status).toBe(401);

    // logout limpa o cookie
    const out = await logout(new Request('http://localhost:3000/api/auth/logout', { method: 'POST' }));
    expect(out.status).toBe(200);
    expect(out.headers.get('set-cookie')).toMatch(/Max-Age=0/);
  });
});
