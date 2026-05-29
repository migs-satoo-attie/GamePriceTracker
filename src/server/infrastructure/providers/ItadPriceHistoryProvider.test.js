import { ItadPriceHistoryProvider } from './ItadPriceHistoryProvider';
import { Money } from '../../domain/value-objects/Money';

const DEC_2026 = Math.floor(new Date('2026-12-10T12:00:00Z').getTime() / 1000);
const NOV_2026 = Math.floor(new Date('2026-11-10T12:00:00Z').getTime() / 1000);

describe('ItadPriceHistoryProvider', () => {
  it('mapeia os pontos brutos do ITAD para o domínio com source "itad"', async () => {
    const client = {
      async getPriceHistory() {
        return [
          { timestamp: NOV_2026, price: { amount: 199.9 } },
          { timestamp: DEC_2026, price: { amount: 99.95 } },
        ];
      },
    };
    const provider = new ItadPriceHistoryProvider({ client });
    const result = await provider.getPriceHistory('itad-id');

    expect(result.source).toBe('itad');
    expect(result.history.points).toHaveLength(2);
    expect(result.history.points[1].price.toReais()).toBe(99.95);
  });

  it('repassa o fallback resolvido (Money) adiante', async () => {
    const client = { async getPriceHistory() { return []; } };
    const provider = new ItadPriceHistoryProvider({
      client,
      resolveFallback: () => Money.fromReais(199.9),
    });
    const result = await provider.getPriceHistory('itad-id');

    expect(result.source).toBe('itad');
    expect(result.history.points).toHaveLength(0);
    expect(result.fallback.toReais()).toBe(199.9);
  });

  it('propaga erro do client (não mascara falha upstream)', async () => {
    const client = { async getPriceHistory() { throw new Error('ITAD 502'); } };
    const provider = new ItadPriceHistoryProvider({ client });
    await expect(provider.getPriceHistory('itad-id')).rejects.toThrow('ITAD 502');
  });
});
