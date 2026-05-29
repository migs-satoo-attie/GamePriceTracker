import { DbPriceHistoryProvider } from './DbPriceHistoryProvider';
import { InMemoryPriceSnapshotRepository } from '../repositories/InMemoryPriceSnapshotRepository';
import { Money } from '../../domain/value-objects/Money';
import { PriceHistory } from '../../domain/entities/PriceHistory';

describe('DbPriceHistoryProvider', () => {
  it('monta PriceHistory a partir dos snapshots persistidos (source "db")', async () => {
    const repo = new InMemoryPriceSnapshotRepository();
    await repo.add({ gameId: '1', price: Money.fromReais(99.95), recordedAt: new Date('2026-03-01T00:00:00Z') });
    const provider = new DbPriceHistoryProvider({ repository: repo });

    const result = await provider.getPriceHistory('1');

    expect(result.source).toBe('db');
    expect(result.history).toBeInstanceOf(PriceHistory);
    expect(result.history.points).toHaveLength(1);
  });

  it('retorna null quando não há snapshots (permite fallback)', async () => {
    const provider = new DbPriceHistoryProvider({ repository: new InMemoryPriceSnapshotRepository() });
    expect(await provider.getPriceHistory('999')).toBeNull();
  });
});
