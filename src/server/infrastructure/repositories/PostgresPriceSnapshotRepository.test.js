import { PostgresPriceSnapshotRepository } from './PostgresPriceSnapshotRepository';
import { PricePoint } from '../../domain/value-objects/PricePoint';
import { Money } from '../../domain/value-objects/Money';

/** db fake que registra as queries e devolve linhas canned. */
function fakeDb(rows = []) {
  return {
    calls: [],
    rows,
    async query(sql, params) {
      this.calls.push({ sql, params });
      return { rows: this.rows };
    },
  };
}

describe('PostgresPriceSnapshotRepository', () => {
  it('add: faz INSERT com price em centavos e ignora duplicados (ON CONFLICT)', async () => {
    const db = fakeDb();
    const repo = new PostgresPriceSnapshotRepository({ db });
    const recordedAt = new Date('2026-03-01T00:00:00Z');

    await repo.add({ gameId: '1091500', price: Money.fromReais(99.95), recordedAt, source: 'itad' });

    expect(db.calls).toHaveLength(1);
    expect(db.calls[0].sql).toMatch(/INSERT INTO price_snapshots/i);
    expect(db.calls[0].sql).toMatch(/ON CONFLICT/i);
    expect(db.calls[0].params).toEqual(['1091500', 9995, recordedAt, 'itad']);
  });

  it('findByGame: faz SELECT ordenado e mapeia linhas para PricePoint', async () => {
    const db = fakeDb([
      { price_cents: 19990, recorded_at: '2026-01-01T00:00:00Z' },
      { price_cents: 9995, recorded_at: '2026-03-01T00:00:00Z' },
    ]);
    const repo = new PostgresPriceSnapshotRepository({ db });

    const points = await repo.findByGame('1091500');

    expect(db.calls[0].sql).toMatch(/SELECT .*price_cents.*FROM price_snapshots/is);
    expect(db.calls[0].sql).toMatch(/ORDER BY recorded_at ASC/i);
    expect(db.calls[0].params).toEqual(['1091500']);
    expect(points[0]).toBeInstanceOf(PricePoint);
    expect(points[0].price.toReais()).toBe(199.9);
    expect(points[1].price.toReais()).toBe(99.95);
  });

  it('addMany: insere cada snapshot', async () => {
    const db = fakeDb();
    const repo = new PostgresPriceSnapshotRepository({ db });
    await repo.addMany([
      { gameId: '1', price: Money.fromReais(10), recordedAt: new Date('2026-01-01T00:00:00Z') },
      { gameId: '1', price: Money.fromReais(20), recordedAt: new Date('2026-02-01T00:00:00Z') },
    ]);
    expect(db.calls.filter((c) => /INSERT/i.test(c.sql))).toHaveLength(2);
  });
});
