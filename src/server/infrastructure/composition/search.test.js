import { buildSearchGames } from './search';

const DATA = [
  { id: '1', name: 'Cyberpunk 2077', coverImage: 'c', originalPrice: 199.9, currentPrice: 99.95, historicalLow: 59.97, discountPercent: 50, store: 'Steam', priceHistory: [] },
  { id: '2', name: 'Elden Ring', coverImage: 'c', originalPrice: 249.9, currentPrice: 174.93, historicalLow: 149.9, discountPercent: 30, store: 'Steam', priceHistory: [] },
];

describe('buildSearchGames (composition root)', () => {
  it('modo demo (sem ITAD key): filtra o mock', async () => {
    const useCase = buildSearchGames({ env: {}, data: DATA });
    const result = await useCase.execute('cyber');
    expect(result.source).toBe('mock');
    expect(result.results).toHaveLength(1);
  });

  it('com ITAD key: usa o provider ITAD', async () => {
    const itadClient = {
      searchGames: async () => [{ id: 'itad1', title: 'Cyberpunk 2077' }],
      getGamePrices: async () => [{ id: 'itad1', deals: [{ shop: { id: 'steam', name: 'Steam' }, id: '1091500', price: { amount: 99.95 }, regular: { amount: 199.9 }, cut: 50 }] }],
    };
    const useCase = buildSearchGames({ env: { ITAD_API_KEY: 'x' }, data: DATA, itadClient });
    const result = await useCase.execute('cyber');
    expect(result.source).toBe('itad');
    expect(result.results[0].toJSON().currentPrice).toBe(99.95);
  });

  it('com ITAD key: cai para o mock quando o ITAD falha', async () => {
    const itadClient = { searchGames: async () => { throw new Error('ITAD down'); } };
    const useCase = buildSearchGames({ env: { ITAD_API_KEY: 'x' }, data: DATA, itadClient });
    const result = await useCase.execute('cyber');
    expect(result.source).toBe('mock');
    expect(result.results).toHaveLength(1);
  });
});
