import { PostgresGameRepository } from './PostgresGameRepository';
import { Game } from '../../domain/entities/Game';
import { Money } from '../../domain/value-objects/Money';

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

const sampleRow = {
  id: '1091500',
  name: 'Cyberpunk 2077',
  cover_image: 'c',
  store: 'Steam',
  original_price_cents: 19990,
  current_price_cents: 9995,
  historical_low_cents: 5997,
  discount_percent: 50,
};

describe('PostgresGameRepository', () => {
  it('upsert: INSERT ... ON CONFLICT (id) DO UPDATE com preços em centavos', async () => {
    const db = fakeDb();
    const repo = new PostgresGameRepository({ db });
    const game = new Game({
      id: '1091500',
      name: 'Cyberpunk 2077',
      coverImage: 'c',
      originalPrice: Money.fromReais(199.9),
      currentPrice: Money.fromReais(99.95),
      historicalLow: Money.fromReais(59.97),
      discountPercent: 50,
      store: 'Steam',
    });

    await repo.upsert(game);

    expect(db.calls[0].sql).toMatch(/INSERT INTO games/i);
    expect(db.calls[0].sql).toMatch(/ON CONFLICT \(id\) DO UPDATE/i);
    expect(db.calls[0].params).toEqual(['1091500', 'Cyberpunk 2077', 'c', 'Steam', 19990, 9995, 5997, 50]);
  });

  it('findById: mapeia a linha para Game (centavos → Money)', async () => {
    const repo = new PostgresGameRepository({ db: fakeDb([sampleRow]) });
    const game = await repo.findById('1091500');
    expect(game).toBeInstanceOf(Game);
    expect(game.currentPrice.toReais()).toBe(99.95);
    expect(game.originalPrice.toReais()).toBe(199.9);
    expect(game.discountPercent).toBe(50);
  });

  it('findById: null quando não há linhas', async () => {
    expect(await new PostgresGameRepository({ db: fakeDb([]) }).findById('x')).toBeNull();
  });

  it('findAll: mapeia todas as linhas', async () => {
    const repo = new PostgresGameRepository({ db: fakeDb([sampleRow, { ...sampleRow, id: '2' }]) });
    const all = await repo.findAll();
    expect(all).toHaveLength(2);
    expect(all[1].id).toBe('2');
  });
});
