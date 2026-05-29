/**
 * Teste de integração contra um Postgres REAL.
 *
 * Roda apenas quando `DATABASE_URL` está definido (ex.: `npm run db:up && npm run db:migrate`).
 * Sem a variável, é pulado — para não quebrar a suíte em ambientes sem banco.
 */
import { getPool, closePool } from '@/server/infrastructure/db/pool';
import { PostgresPriceSnapshotRepository } from '@/server/infrastructure/repositories/PostgresPriceSnapshotRepository';
import { Money } from '@/server/domain/value-objects/Money';

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

describeIfDb('PostgresPriceSnapshotRepository (DB real)', () => {
  const gameId = `test-${Date.now()}`;
  let repo;

  beforeAll(() => {
    repo = new PostgresPriceSnapshotRepository({ db: getPool() });
  });

  afterAll(async () => {
    await getPool().query('DELETE FROM price_snapshots WHERE game_id = $1', [gameId]);
    await closePool();
  });

  it('persiste e recupera snapshots em ordem cronológica', async () => {
    await repo.add({ gameId, price: Money.fromReais(99.95), recordedAt: new Date('2026-03-01T00:00:00Z'), source: 'itad' });
    await repo.add({ gameId, price: Money.fromReais(199.9), recordedAt: new Date('2026-01-01T00:00:00Z'), source: 'itad' });

    const points = await repo.findByGame(gameId);
    expect(points).toHaveLength(2);
    expect(points[0].price.toReais()).toBe(199.9);
    expect(points[1].price.toReais()).toBe(99.95);
  });

  it('add é idempotente por (game_id, recorded_at)', async () => {
    const recordedAt = new Date('2026-05-01T00:00:00Z');
    await repo.add({ gameId, price: Money.fromReais(50), recordedAt });
    await repo.add({ gameId, price: Money.fromReais(50), recordedAt }); // duplicado → ignorado

    const points = await repo.findByGame(gameId);
    const may = points.filter((p) => p.recordedAt.getTime() === recordedAt.getTime());
    expect(may).toHaveLength(1);
  });
});
