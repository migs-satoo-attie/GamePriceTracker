import { Game } from '../../domain/entities/Game';
import { Money } from '../../domain/value-objects/Money';

/**
 * Implementação Postgres (SQL puro) de
 * {@link import('../../application/ports/GameRepository').GameRepository}.
 */
export class PostgresGameRepository {
  /** @param {{ db: { query: Function } }} deps */
  constructor({ db }) {
    if (!db) throw new Error('PostgresGameRepository: db é obrigatório');
    this.db = db;
  }

  #rowToGame(row) {
    return new Game({
      id: row.id,
      name: row.name,
      coverImage: row.cover_image,
      store: row.store,
      originalPrice: Money.fromCents(row.original_price_cents),
      currentPrice: Money.fromCents(row.current_price_cents),
      historicalLow: Money.fromCents(row.historical_low_cents),
      discountPercent: row.discount_percent,
      priceHistory: [],
    });
  }

  async upsert(game) {
    await this.db.query(
      `INSERT INTO games
         (id, name, cover_image, store, original_price_cents, current_price_cents, historical_low_cents, discount_percent, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         cover_image = EXCLUDED.cover_image,
         store = EXCLUDED.store,
         original_price_cents = EXCLUDED.original_price_cents,
         current_price_cents = EXCLUDED.current_price_cents,
         historical_low_cents = EXCLUDED.historical_low_cents,
         discount_percent = EXCLUDED.discount_percent,
         updated_at = now()`,
      [
        game.id,
        game.name,
        game.coverImage,
        game.store,
        game.originalPrice.cents,
        game.currentPrice.cents,
        game.historicalLow.cents,
        game.discountPercent,
      ],
    );
  }

  async findById(id) {
    const { rows } = await this.db.query(
      'SELECT id, name, cover_image, store, original_price_cents, current_price_cents, historical_low_cents, discount_percent FROM games WHERE id = $1',
      [id],
    );
    return rows.length ? this.#rowToGame(rows[0]) : null;
  }

  async findAll() {
    const { rows } = await this.db.query(
      'SELECT id, name, cover_image, store, original_price_cents, current_price_cents, historical_low_cents, discount_percent FROM games',
    );
    return rows.map((r) => this.#rowToGame(r));
  }
}
