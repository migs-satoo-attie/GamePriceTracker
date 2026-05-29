import { ItadGameSearchProvider } from './ItadGameSearchProvider';
import { Game } from '../../domain/entities/Game';

function makeClient(overrides = {}) {
  return {
    searchGames: jest.fn(async () => [{ id: 'itad1', slug: 'cp', title: 'Cyberpunk 2077' }]),
    getGamePrices: jest.fn(async () => [
      {
        id: 'itad1',
        deals: [
          { shop: { id: 'steam', name: 'Steam' }, id: '1091500', price: { amount: 99.95 }, regular: { amount: 199.9 }, cut: 50 },
        ],
        historicalLow: { amount: 59.97 },
      },
    ]),
    ...overrides,
  };
}

describe('ItadGameSearchProvider', () => {
  it('cruza busca + preços e mapeia para Game (source "itad")', async () => {
    const client = makeClient();
    const provider = new ItadGameSearchProvider({ client });
    const result = await provider.search('cyber', 20);

    expect(client.searchGames).toHaveBeenCalledWith('cyber', 20);
    expect(result.source).toBe('itad');
    expect(result.results[0]).toBeInstanceOf(Game);
    expect(result.results[0].toJSON()).toMatchObject({
      id: 'itad1',
      name: 'Cyberpunk 2077',
      currentPrice: 99.95,
      originalPrice: 199.9,
      historicalLow: 59.97,
      discountPercent: 50,
      store: 'Steam',
    });
    expect(result.results[0].coverImage).toContain('1091500');
  });

  it('retorna vazio sem chamar preços quando a busca não acha nada', async () => {
    const client = makeClient({ searchGames: jest.fn(async () => []) });
    const provider = new ItadGameSearchProvider({ client });
    const result = await provider.search('zzz', 20);

    expect(result).toEqual({ results: [], source: 'itad' });
    expect(client.getGamePrices).not.toHaveBeenCalled();
  });

  it('mapeia jogo sem deals como preço zero', async () => {
    const client = makeClient({
      getGamePrices: jest.fn(async () => [{ id: 'itad1', deals: [] }]),
    });
    const provider = new ItadGameSearchProvider({ client });
    const result = await provider.search('cyber', 20);
    expect(result.results[0].toJSON()).toMatchObject({ currentPrice: 0, originalPrice: 0, discountPercent: 0 });
  });

  it('propaga erro do client', async () => {
    const client = makeClient({ searchGames: jest.fn(async () => { throw new Error('ITAD 500'); }) });
    const provider = new ItadGameSearchProvider({ client });
    await expect(provider.search('cyber', 20)).rejects.toThrow('ITAD 500');
  });
});
