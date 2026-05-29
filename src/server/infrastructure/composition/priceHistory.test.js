import { buildGetGameHistory } from './priceHistory';
import { InMemoryPriceSnapshotRepository } from '../repositories/InMemoryPriceSnapshotRepository';
import { Money } from '../../domain/value-objects/Money';

const NOW = new Date('2026-12-15T12:00:00Z');
const clock = () => NOW;

const DATA = [
  { id: '1091500', currentPrice: 99.95, priceHistory: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120] },
];

describe('buildGetGameHistory (composition root)', () => {
  it('modo demo (sem ITAD key): usa o provider mock', async () => {
    const useCase = buildGetGameHistory({ env: {}, data: DATA, clock });
    const result = await useCase.execute('1091500');
    expect(result.source).toBe('mock');
    expect(result.history).toEqual(DATA[0].priceHistory);
  });

  it('com ITAD key: usa o provider ITAD quando há dados', async () => {
    const itadClient = {
      getPriceHistory: async () => [
        { timestamp: Math.floor(new Date('2026-12-10T12:00:00Z').getTime() / 1000), price: { amount: 42 } },
      ],
    };
    const useCase = buildGetGameHistory({ env: { ITAD_API_KEY: 'x' }, data: DATA, clock, itadClient });
    const result = await useCase.execute('1091500');
    expect(result.source).toBe('itad');
    expect(result.history[11]).toBe(42);
  });

  it('com ITAD key: cai para o mock quando o ITAD falha', async () => {
    const itadClient = { getPriceHistory: async () => { throw new Error('ITAD down'); } };
    const useCase = buildGetGameHistory({ env: { ITAD_API_KEY: 'x' }, data: DATA, clock, itadClient });
    const result = await useCase.execute('1091500');
    expect(result.source).toBe('mock');
    expect(result.history).toEqual(DATA[0].priceHistory);
  });

  it('com repositório (Postgres): prioriza os snapshots persistidos (source "db")', async () => {
    const repo = new InMemoryPriceSnapshotRepository();
    await repo.add({ gameId: '1091500', price: Money.fromReais(42), recordedAt: NOW });
    const useCase = buildGetGameHistory({ env: { ITAD_API_KEY: 'x' }, data: DATA, clock, snapshotRepository: repo });

    const result = await useCase.execute('1091500');
    expect(result.source).toBe('db');
    expect(result.history[11]).toBe(42);
  });

  it('com repositório vazio: cai para a próxima fonte da cadeia', async () => {
    const repo = new InMemoryPriceSnapshotRepository(); // sem snapshots
    const useCase = buildGetGameHistory({ env: {}, data: DATA, clock, snapshotRepository: repo });
    const result = await useCase.execute('1091500');
    expect(result.source).toBe('mock'); // db vazio → mock
  });

  it('jogo inexistente: retorna vazio com source "empty"', async () => {
    const useCase = buildGetGameHistory({ env: {}, data: DATA, clock });
    expect(await useCase.execute('000')).toEqual({ history: [], source: 'empty' });
  });
});
