import { SearchGames } from './SearchGames';
import { Game } from '../../domain/entities/Game';
import { Money } from '../../domain/value-objects/Money';

function game(id, name) {
  return new Game({
    id,
    name,
    coverImage: 'c',
    originalPrice: Money.fromReais(10),
    currentPrice: Money.fromReais(8),
  });
}

function fakeProvider(result) {
  return {
    calls: [],
    async search(query, limit) {
      this.calls.push({ query, limit });
      return typeof result === 'function' ? result(query, limit) : result;
    },
  };
}

describe('SearchGames (use-case)', () => {
  it('rejeita query com menos de 2 caracteres', async () => {
    const useCase = new SearchGames({ provider: fakeProvider({ results: [], source: 'mock' }) });
    await expect(useCase.execute('a')).rejects.toThrow(/2 caracteres|mínimo/i);
    await expect(useCase.execute('')).rejects.toThrow(/2 caracteres|mínimo/i);
    await expect(useCase.execute('  x ')).rejects.toThrow(/2 caracteres|mínimo/i);
  });

  it('faz trim e repassa a query + limit ao provider', async () => {
    const provider = fakeProvider({ results: [], source: 'itad' });
    const useCase = new SearchGames({ provider });
    await useCase.execute('  cyberpunk  ');
    expect(provider.calls[0]).toEqual({ query: 'cyberpunk', limit: 20 });
  });

  it('respeita um limit customizado', async () => {
    const provider = fakeProvider({ results: [], source: 'itad' });
    const useCase = new SearchGames({ provider, limit: 5 });
    await useCase.execute('elden');
    expect(provider.calls[0].limit).toBe(5);
  });

  it('retorna { results, source }', async () => {
    const provider = fakeProvider({ results: [game('1', 'Cyberpunk 2077')], source: 'itad' });
    const useCase = new SearchGames({ provider });
    const result = await useCase.execute('cyber');

    expect(result.source).toBe('itad');
    expect(result.results[0]).toBeInstanceOf(Game);
    expect(JSON.parse(JSON.stringify(result)).results[0]).toMatchObject({ id: '1', name: 'Cyberpunk 2077' });
  });
});
