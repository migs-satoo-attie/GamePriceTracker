import { PricePoint } from '../../domain/value-objects/PricePoint';

/**
 * Implementação em memória de {@link import('../../application/ports/PriceSnapshotRepository').PriceSnapshotRepository}.
 * Usada em testes e use-cases (sem dependência de banco).
 */
export class InMemoryPriceSnapshotRepository {
  constructor() {
    /** @type {Array<{gameId:string, price:import('../../domain/value-objects/Money').Money, recordedAt:Date, source?:string}>} */
    this.snapshots = [];
  }

  async add(snapshot) {
    this.snapshots.push({ ...snapshot });
  }

  async addMany(snapshots) {
    for (const s of snapshots) await this.add(s);
  }

  async findByGame(gameId) {
    return this.snapshots
      .filter((s) => s.gameId === gameId)
      .sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime())
      .map((s) => new PricePoint({ price: s.price, recordedAt: s.recordedAt }));
  }
}
