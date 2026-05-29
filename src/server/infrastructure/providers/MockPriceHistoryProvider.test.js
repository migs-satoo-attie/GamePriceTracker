import { MockPriceHistoryProvider } from './MockPriceHistoryProvider';

const NOW = new Date('2026-12-15T12:00:00Z');
const clock = () => NOW;

const DATA = [
  {
    id: '1091500',
    currentPrice: 99.95,
    priceHistory: [199.9, 199.9, 199.9, 149.9, 149.9, 149.9, 99.95, 99.95, 149.9, 99.95, 59.97, 99.95],
  },
];

describe('MockPriceHistoryProvider', () => {
  it('retorna source "mock" e reproduz a série original de 12 meses', async () => {
    const provider = new MockPriceHistoryProvider({ data: DATA, clock });
    const result = await provider.getPriceHistory('1091500');

    expect(result.source).toBe('mock');
    expect(result.history.toMonthlySeries({ now: NOW })).toEqual(DATA[0].priceHistory);
  });

  it('retorna null quando o jogo não está no mock', async () => {
    const provider = new MockPriceHistoryProvider({ data: DATA, clock });
    expect(await provider.getPriceHistory('000000')).toBeNull();
  });

  it('retorna null para jogos do mock sem priceHistory', async () => {
    const provider = new MockPriceHistoryProvider({ data: [{ id: '5', priceHistory: [] }], clock });
    expect(await provider.getPriceHistory('5')).toBeNull();
  });
});
