import { MockGameSearchProvider } from './MockGameSearchProvider';
import { Game } from '../../domain/entities/Game';

const DATA = [
  { id: '1', name: 'Cyberpunk 2077', coverImage: 'c', originalPrice: 199.9, currentPrice: 99.95, historicalLow: 59.97, discountPercent: 50, store: 'Steam', priceHistory: [] },
  { id: '2', name: 'Elden Ring', coverImage: 'c', originalPrice: 249.9, currentPrice: 174.93, historicalLow: 149.9, discountPercent: 30, store: 'Steam', priceHistory: [] },
];

describe('MockGameSearchProvider', () => {
  it('filtra por nome (case-insensitive) e mapeia para Game', async () => {
    const provider = new MockGameSearchProvider({ data: DATA });
    const result = await provider.search('cyber', 20);

    expect(result.source).toBe('mock');
    expect(result.results).toHaveLength(1);
    expect(result.results[0]).toBeInstanceOf(Game);
    expect(result.results[0].name).toBe('Cyberpunk 2077');
  });

  it('retorna vazio quando nada bate', async () => {
    const provider = new MockGameSearchProvider({ data: DATA });
    expect((await provider.search('zzz', 20)).results).toEqual([]);
  });

  it('respeita o limit', async () => {
    const provider = new MockGameSearchProvider({ data: DATA });
    const result = await provider.search('r', 1); // "Cyberpunk" e "Elden Ring" contêm "r"
    expect(result.results).toHaveLength(1);
  });
});
