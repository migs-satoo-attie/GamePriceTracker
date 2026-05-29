/**
 * Implementação em memória de
 * {@link import('../../application/ports/GameRepository').GameRepository}.
 */
export class InMemoryGameRepository {
  /** @param {import('../../domain/entities/Game').Game[]} [seed] */
  constructor(seed = []) {
    /** @type {Map<string, import('../../domain/entities/Game').Game>} */
    this.games = new Map(seed.map((g) => [g.id, g]));
  }

  async upsert(game) {
    this.games.set(game.id, game);
  }

  async findById(id) {
    return this.games.get(String(id)) ?? null;
  }

  async findAll() {
    return [...this.games.values()];
  }
}
