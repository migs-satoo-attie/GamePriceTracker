import { SteamOpenIdClient } from './SteamOpenIdClient';

const realm = 'http://localhost:3000';
const returnTo = 'http://localhost:3000/api/auth/steam/callback';

function validParams(overrides = {}) {
  return {
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'id_res',
    'openid.claimed_id': 'https://steamcommunity.com/openid/id/76561197960287930',
    'openid.identity': 'https://steamcommunity.com/openid/id/76561197960287930',
    'openid.sig': 'abc',
    'openid.signed': 'signed,fields',
    ...overrides,
  };
}

describe('SteamOpenIdClient', () => {
  describe('buildAuthUrl', () => {
    it('monta a URL de checkid_setup com os parâmetros do OpenID 2.0', () => {
      const client = new SteamOpenIdClient({ realm, returnTo });
      const url = new URL(client.buildAuthUrl());

      expect(`${url.origin}${url.pathname}`).toBe('https://steamcommunity.com/openid/login');
      expect(url.searchParams.get('openid.mode')).toBe('checkid_setup');
      expect(url.searchParams.get('openid.return_to')).toBe(returnTo);
      expect(url.searchParams.get('openid.realm')).toBe(realm);
      expect(url.searchParams.get('openid.identity')).toBe('http://specs.openid.net/auth/2.0/identifier_select');
      expect(url.searchParams.get('openid.claimed_id')).toBe('http://specs.openid.net/auth/2.0/identifier_select');
    });
  });

  describe('verify', () => {
    it('valida a asserção via check_authentication e retorna o steamId', async () => {
      const fetchFn = jest.fn(async () => ({ text: async () => 'ns:http://specs.openid.net/auth/2.0\nis_valid:true\n' }));
      const client = new SteamOpenIdClient({ realm, returnTo, fetchFn });

      const steamId = await client.verify(validParams());

      expect(steamId).toBe('76561197960287930');
      const [calledUrl, opts] = fetchFn.mock.calls[0];
      expect(calledUrl).toBe('https://steamcommunity.com/openid/login');
      expect(opts.method).toBe('POST');
      expect(opts.body).toMatch(/openid\.mode=check_authentication/);
    });

    it('rejeita quando openid.mode não é id_res (sem chamar a Steam)', async () => {
      const fetchFn = jest.fn();
      const client = new SteamOpenIdClient({ realm, returnTo, fetchFn });
      await expect(client.verify(validParams({ 'openid.mode': 'cancel' }))).rejects.toThrow(/modo|mode/i);
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('rejeita quando a Steam responde is_valid:false', async () => {
      const fetchFn = jest.fn(async () => ({ text: async () => 'is_valid:false\n' }));
      const client = new SteamOpenIdClient({ realm, returnTo, fetchFn });
      await expect(client.verify(validParams())).rejects.toThrow(/inválid|asser/i);
    });

    it('rejeita claimed_id de host inesperado mesmo com is_valid:true', async () => {
      const fetchFn = jest.fn(async () => ({ text: async () => 'is_valid:true' }));
      const client = new SteamOpenIdClient({ realm, returnTo, fetchFn });
      await expect(
        client.verify(validParams({ 'openid.claimed_id': 'https://evil.com/openid/id/76561197960287930' })),
      ).rejects.toThrow();
    });
  });
});
