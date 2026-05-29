import { detectAlert } from './detectAlert';
import { PriceAlert } from '../entities/PriceAlert';
import { Money } from '../value-objects/Money';

const now = new Date('2026-05-29T12:00:00Z');
const ctx = { gameId: '1', gameName: 'Game', now };

describe('detectAlert (serviço de domínio)', () => {
  it('dispara target_reached quando o preço atual == alvo', () => {
    const alert = detectAlert({ ...ctx, currentPrice: Money.fromReais(60), targetPrice: Money.fromReais(60) });
    expect(alert).toBeInstanceOf(PriceAlert);
    expect(alert.kind).toBe('target_reached');
  });

  it('dispara target_reached quando o preço atual < alvo', () => {
    const alert = detectAlert({ ...ctx, currentPrice: Money.fromReais(50), targetPrice: Money.fromReais(60) });
    expect(alert.kind).toBe('target_reached');
  });

  it('prioriza target_reached sobre price_drop', () => {
    const alert = detectAlert({
      ...ctx,
      previousPrice: Money.fromReais(80),
      currentPrice: Money.fromReais(50),
      targetPrice: Money.fromReais(60),
    });
    expect(alert.kind).toBe('target_reached');
  });

  it('dispara price_drop quando caiu vs o preço anterior (sem alvo)', () => {
    const alert = detectAlert({ ...ctx, previousPrice: Money.fromReais(80), currentPrice: Money.fromReais(50) });
    expect(alert.kind).toBe('price_drop');
  });

  it('não dispara quando acima do alvo e sem queda', () => {
    const alert = detectAlert({
      ...ctx,
      previousPrice: Money.fromReais(50),
      currentPrice: Money.fromReais(70),
      targetPrice: Money.fromReais(60),
    });
    expect(alert).toBeNull();
  });

  it('não dispara sem alvo e sem preço anterior', () => {
    expect(detectAlert({ ...ctx, currentPrice: Money.fromReais(70) })).toBeNull();
  });

  it('não dispara price_drop quando o preço subiu', () => {
    expect(detectAlert({ ...ctx, previousPrice: Money.fromReais(50), currentPrice: Money.fromReais(70) })).toBeNull();
  });
});
