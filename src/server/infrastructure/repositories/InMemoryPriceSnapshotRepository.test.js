import { InMemoryPriceSnapshotRepository } from './InMemoryPriceSnapshotRepository';
import { PricePoint } from '../../domain/value-objects/PricePoint';
import { Money } from '../../domain/value-objects/Money';

describe('InMemoryPriceSnapshotRepository', () => {
  it('persiste e devolve PricePoints ordenados por data', async () => {
    const repo = new InMemoryPriceSnapshotRepository();
    await repo.add({ gameId: '1', price: Money.fromReais(99.95), recordedAt: new Date('2026-03-01T00:00:00Z'), source: 'itad' });
    await repo.add({ gameId: '1', price: Money.fromReais(199.9), recordedAt: new Date('2026-01-01T00:00:00Z'), source: 'itad' });

    const points = await repo.findByGame('1');
    expect(points).toHaveLength(2);
    expect(points[0]).toBeInstanceOf(PricePoint);
    expect(points[0].price.toReais()).toBe(199.9); // janeiro vem primeiro
    expect(points[1].price.toReais()).toBe(99.95);
  });

  it('addMany insere vários', async () => {
    const repo = new InMemoryPriceSnapshotRepository();
    await repo.addMany([
      { gameId: '1', price: Money.fromReais(10), recordedAt: new Date('2026-01-01T00:00:00Z') },
      { gameId: '1', price: Money.fromReais(20), recordedAt: new Date('2026-02-01T00:00:00Z') },
    ]);
    expect(await repo.findByGame('1')).toHaveLength(2);
  });

  it('retorna [] para jogo sem snapshots', async () => {
    const repo = new InMemoryPriceSnapshotRepository();
    expect(await repo.findByGame('999')).toEqual([]);
  });
});
