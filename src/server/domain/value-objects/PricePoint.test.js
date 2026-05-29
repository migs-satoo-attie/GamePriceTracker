import { PricePoint } from './PricePoint';
import { Money } from './Money';

describe('PricePoint (value object)', () => {
  const price = Money.fromReais(99.95);
  const recordedAt = new Date('2026-01-15T12:00:00Z');

  it('cria com preço (Money) e data', () => {
    const point = new PricePoint({ price, recordedAt });
    expect(point.price.equals(price)).toBe(true);
    expect(point.recordedAt.getTime()).toBe(recordedAt.getTime());
  });

  it('aceita recordedAt como timestamp ISO string', () => {
    const point = new PricePoint({ price, recordedAt: '2026-01-15T12:00:00Z' });
    expect(point.recordedAt.getTime()).toBe(recordedAt.getTime());
  });

  it('exige preço do tipo Money', () => {
    expect(() => new PricePoint({ price: 99.95, recordedAt })).toThrow(/Money/);
  });

  it('rejeita data inválida', () => {
    expect(() => new PricePoint({ price, recordedAt: 'não-é-data' })).toThrow(/data|date/i);
  });

  it('é imutável', () => {
    const point = new PricePoint({ price, recordedAt });
    expect(Object.isFrozen(point)).toBe(true);
  });
});
