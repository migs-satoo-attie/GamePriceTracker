import { UserProfile } from '../../domain/value-objects/UserProfile';

/**
 * Implementação Postgres (SQL puro) de
 * {@link import('../../application/ports/UserRepository').UserRepository}.
 */
export class PostgresUserRepository {
  /** @param {{ db: { query: Function } }} deps */
  constructor({ db }) {
    if (!db) throw new Error('PostgresUserRepository: db é obrigatório');
    this.db = db;
  }

  async upsert({ steamId, username, avatar }) {
    await this.db.query(
      `INSERT INTO users (steam_id, username, avatar)
       VALUES ($1, $2, $3)
       ON CONFLICT (steam_id) DO UPDATE
         SET username = EXCLUDED.username,
             avatar = EXCLUDED.avatar,
             last_login_at = now()`,
      [steamId, username, avatar ?? null],
    );
    return new UserProfile({ username, avatar, steamId });
  }

  async findBySteamId(steamId) {
    const { rows } = await this.db.query(
      'SELECT steam_id, username, avatar FROM users WHERE steam_id = $1',
      [steamId],
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return new UserProfile({ username: row.username, avatar: row.avatar, steamId: row.steam_id });
  }
}
