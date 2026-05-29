import { parseCookies, serializeCookie } from './cookies';

describe('parseCookies', () => {
  it('parseia o header Cookie em objeto', () => {
    expect(parseCookies('a=1; b=two; gpt_session=abc.def')).toEqual({ a: '1', b: 'two', gpt_session: 'abc.def' });
  });

  it('retorna {} para header ausente', () => {
    expect(parseCookies(undefined)).toEqual({});
    expect(parseCookies('')).toEqual({});
  });

  it('decodifica valores url-encoded', () => {
    expect(parseCookies('x=a%20b')).toEqual({ x: 'a b' });
  });
});

describe('serializeCookie', () => {
  it('serializa com flags de segurança', () => {
    const c = serializeCookie('gpt_session', 'tok', { httpOnly: true, sameSite: 'Lax', path: '/', maxAge: 3600, secure: true });
    expect(c).toMatch(/^gpt_session=tok/);
    expect(c).toMatch(/HttpOnly/);
    expect(c).toMatch(/SameSite=Lax/);
    expect(c).toMatch(/Path=\//);
    expect(c).toMatch(/Max-Age=3600/);
    expect(c).toMatch(/Secure/);
  });

  it('omite Secure quando false', () => {
    const c = serializeCookie('x', 'y', { secure: false });
    expect(c).not.toMatch(/Secure/);
  });

  it('codifica o valor', () => {
    expect(serializeCookie('x', 'a b')).toMatch(/^x=a%20b/);
  });
});
