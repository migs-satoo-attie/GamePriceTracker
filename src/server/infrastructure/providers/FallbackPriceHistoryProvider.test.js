import { FallbackPriceHistoryProvider } from './FallbackPriceHistoryProvider';
import { PriceHistory } from '../../domain/entities/PriceHistory';
import { PricePoint } from '../../domain/value-objects/PricePoint';
import { Money } from '../../domain/value-objects/Money';

function withPoints(source) {
  return {
    history: new PriceHistory('1', [
      new PricePoint({ price: Money.fromReais(10), recordedAt: new Date('2026-12-15T12:00:00Z') }),
    ]),
    source,
  };
}

describe('FallbackPriceHistoryProvider', () => {
  it('usa o primeiro provider que retorna resultado com pontos', async () => {
    const second = { getPriceHistory: jest.fn() };
    const first = { getPriceHistory: jest.fn().mockResolvedValue(withPoints('itad')) };
    const provider = new FallbackPriceHistoryProvider([first, second]);

    const result = await provider.getPriceHistory('1');
    expect(result.source).toBe('itad');
    expect(second.getPriceHistory).not.toHaveBeenCalled();
  });

  it('cai para o próximo provider quando o primeiro retorna null', async () => {
    const first = { getPriceHistory: jest.fn().mockResolvedValue(null) };
    const second = { getPriceHistory: jest.fn().mockResolvedValue(withPoints('mock')) };
    const provider = new FallbackPriceHistoryProvider([first, second]);

    const result = await provider.getPriceHistory('1');
    expect(result.source).toBe('mock');
  });

  it('cai para o próximo provider quando o primeiro lança erro', async () => {
    const first = { getPriceHistory: jest.fn().mockRejectedValue(new Error('boom')) };
    const second = { getPriceHistory: jest.fn().mockResolvedValue(withPoints('mock')) };
    const provider = new FallbackPriceHistoryProvider([first, second]);

    const result = await provider.getPriceHistory('1');
    expect(result.source).toBe('mock');
  });

  it('retorna null quando todos falham ou não acham', async () => {
    const first = { getPriceHistory: jest.fn().mockRejectedValue(new Error('boom')) };
    const second = { getPriceHistory: jest.fn().mockResolvedValue(null) };
    const provider = new FallbackPriceHistoryProvider([first, second]);

    expect(await provider.getPriceHistory('1')).toBeNull();
  });
});
