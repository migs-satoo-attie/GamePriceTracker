import { PriceAlert } from './PriceAlert';
import { Money } from '../value-objects/Money';

describe('PriceAlert (entidade)', () => {
  const base = {
    gameId: '1091500',
    gameName: 'Cyberpunk 2077',
    currentPrice: Money.fromReais(59.97),
    previousPrice: Money.fromReais(99.95),
    targetPrice: Money.fromReais(60),
    kind: 'target_reached',
    triggeredAt: new Date('2026-05-29T12:00:00Z'),
  };

  it('serializa preços em reais e data em ISO', () => {
    expect(new PriceAlert(base).toJSON()).toEqual({
      gameId: '1091500',
      gameName: 'Cyberpunk 2077',
      currentPrice: 59.97,
      previousPrice: 99.95,
      targetPrice: 60,
      kind: 'target_reached',
      triggeredAt: '2026-05-29T12:00:00.000Z',
    });
  });

  it('aceita previousPrice/targetPrice nulos', () => {
    const json = new PriceAlert({ ...base, previousPrice: null, targetPrice: null, kind: 'price_drop' }).toJSON();
    expect(json.previousPrice).toBeNull();
    expect(json.targetPrice).toBeNull();
  });

  it('rejeita kind inválido', () => {
    expect(() => new PriceAlert({ ...base, kind: 'qualquer' })).toThrow(/kind/i);
  });

  it('exige currentPrice do tipo Money', () => {
    expect(() => new PriceAlert({ ...base, currentPrice: 10 })).toThrow(/Money/);
  });
});
