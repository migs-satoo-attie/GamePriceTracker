import { SessionService } from './SessionService';

describe('SessionService (token HMAC assinado)', () => {
  const secret = 'um-segredo-de-teste-bem-grande';

  it('emite um token que ele mesmo verifica (round-trip)', () => {
    const svc = new SessionService({ secret });
    const token = svc.issue('76561197960287930');
    expect(typeof token).toBe('string');
    expect(svc.verify(token)).toEqual({ steamId: '76561197960287930' });
  });

  it('rejeita token com assinatura adulterada', () => {
    const svc = new SessionService({ secret });
    const token = svc.issue('76561197960287930');
    const [body] = token.split('.');
    const forged = `${body}.assinaturafalsa`;
    expect(() => svc.verify(forged)).toThrow(/inválid|assinatura/i);
  });

  it('rejeita token assinado com outro segredo', () => {
    const token = new SessionService({ secret: 'outro' }).issue('76561197960287930');
    expect(() => new SessionService({ secret }).verify(token)).toThrow(/inválid|assinatura/i);
  });

  it('rejeita token expirado', () => {
    let now = 1_000_000;
    const svc = new SessionService({ secret, ttlSeconds: 10, now: () => now });
    const token = svc.issue('76561197960287930');
    now += 11_000; // avança 11s (> ttl)
    expect(() => svc.verify(token)).toThrow(/expirad/i);
  });

  it('rejeita token malformado', () => {
    const svc = new SessionService({ secret });
    expect(() => svc.verify('lixo')).toThrow();
    expect(() => svc.verify('')).toThrow();
  });

  it('exige um secret', () => {
    expect(() => new SessionService({})).toThrow(/secret/i);
  });
});
