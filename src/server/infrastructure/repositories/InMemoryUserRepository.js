import { UserProfile } from '../../domain/value-objects/UserProfile';

/**
 * Implementação em memória de
 * {@link import('../../application/ports/UserRepository').UserRepository}.
 */
export class InMemoryUserRepository {
  constructor() {
    /** @type {Map<string, {steamId:string, username:string, avatar?:string}>} */
    this.users = new Map();
  }

  async upsert({ steamId, username, avatar }) {
    this.users.set(steamId, { steamId, username, avatar });
    return new UserProfile({ username, avatar, steamId });
  }

  async findBySteamId(steamId) {
    const row = this.users.get(steamId);
    if (!row) return null;
    return new UserProfile({ username: row.username, avatar: row.avatar, steamId: row.steamId });
  }
}
