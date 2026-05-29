import { PricePoint } from '../../domain/value-objects/PricePoint';
import { Money } from '../../domain/value-objects/Money';

/**
 * Implementação Postgres (SQL puro, sem ORM) de
 * {@link import('../../application/ports/PriceSnapshotRepository').PriceSnapshotRepository}.
 *
 * O `db` é injetado e deve expor `query(sql, params)` (compatível com `pg.Pool`).
 * Preços trafegam em centavos inteiros.
 */
export class PostgresPriceSnapshotRepository {
  /** @param {{ db: { query: Function } }} deps */
  constructor({ db }) {
    if (!db) throw new Error('PostgresPriceSnapshotRepository: db é obrigatório');
    this.db = db;
  }

  async add({ gameId, price, recordedAt, source }) {
    await this.db.query(
      `INSERT INTO price_snapshots (game_id, price_cents, recorded_at, source)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (game_id, recorded_at) DO NOTHING`,
      [gameId, price.cents, recordedAt, source ?? null],
    );
  }

  async addMany(snapshots) {
    for (const s of snapshots) await this.add(s);
  }

  async findByGame(gameId) {
    const { rows } = await this.db.query(
      `SELECT price_cents, recorded_at
       FROM price_snapshots
       WHERE game_id = $1
       ORDER BY recorded_at ASC`,
      [gameId],
    );

    return rows.map(
      (r) =>
        new PricePoint({
          price: Money.fromCents(r.price_cents),
          recordedAt: new Date(r.recorded_at),
        }),
    );
  }
}
