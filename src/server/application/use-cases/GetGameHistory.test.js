import { GetGameHistory } from './GetGameHistory';
import { PriceHistory } from '../../domain/entities/PriceHistory';
import { PricePoint } from '../../domain/value-objects/PricePoint';
import { Money } from '../../domain/value-objects/Money';

const NOW = new Date('2026-12-15T12:00:00Z');
const clock = () => NOW;

/** Provider fake configurável para os testes. */
function fakeProvider(result) {
  return {
    calls: [],
    async getPriceHistory(gameId) {
      this.calls.push(gameId);
      return typeof result === 'function' ? result(gameId) : result;
    },
  };
}

function point(reais, iso) {
  return new PricePoint({ price: Money.fromReais(reais), recordedAt: new Date(iso) });
}

describe('GetGameHistory (use-case)', () => {
  it('valida o gameId', async () => {
    const useCase = new GetGameHistory({ provider: fakeProvider(null), clock });
    await expect(useCase.execute('')).rejects.toThrow(/gameId/i);
    await expect(useCase.execute(undefined)).rejects.toThrow(/gameId/i);
  });

  it('retorna 12 pontos mensais e a fonte quando há histórico', async () => {
    const history = new PriceHistory('1091500', [
      point(199.9, '2026-11-15T12:00:00Z'),
      point(99.95, '2026-12-15T12:00:00Z'),
    ]);
    const provider = fakeProvider({ history, source: 'itad' });
    const useCase = new GetGameHistory({ provider, clock });

    const result = await useCase.execute('1091500');

    expect(provider.calls).toEqual(['1091500']);
    expect(result.source).toBe('itad');
    expect(result.history).toHaveLength(12);
    expect(result.history[10]).toBe(199.9);
    expect(result.history[11]).toBe(99.95);
  });

  it('aplica o fallback informado pelo provider antes do primeiro dado', async () => {
    const history = new PriceHistory('1091500', [point(99.95, '2026-12-15T12:00:00Z')]);
    const provider = fakeProvider({ history, source: 'itad', fallback: Money.fromReais(199.9) });
    const useCase = new GetGameHistory({ provider, clock });

    const result = await useCase.execute('1091500');
    expect(result.history.slice(0, 11)).toEqual(Array(11).fill(199.9));
    expect(result.history[11]).toBe(99.95);
  });

  it('retorna history vazio e source "empty" quando o provider não acha o jogo', async () => {
    const useCase = new GetGameHistory({ provider: fakeProvider(null), clock });
    const result = await useCase.execute('000');
    expect(result).toEqual({ history: [], source: 'empty' });
  });

  it('retorna history vazio (mantendo a fonte) quando não há pontos', async () => {
    const provider = fakeProvider({ history: new PriceHistory('1091500', []), source: 'itad' });
    const useCase = new GetGameHistory({ provider, clock });
    const result = await useCase.execute('1091500');
    expect(result).toEqual({ history: [], source: 'itad' });
  });

  it('propaga falha do provider como erro (sem mascarar)', async () => {
    const provider = {
      async getPriceHistory() {
        throw new Error('upstream caiu');
      },
    };
    const useCase = new GetGameHistory({ provider, clock });
    await expect(useCase.execute('1091500')).rejects.toThrow('upstream caiu');
  });
});
