/**
 * Porta (interface) para persistência de snapshots de preço (série temporal).
 *
 * Implementações concretas: in-memory (testes/use-cases) e Postgres (produção).
 *
 * @typedef {object} SnapshotInput
 * @property {string} gameId
 * @property {import('../../domain/value-objects/Money').Money} price
 * @property {Date} recordedAt
 * @property {string} [source]
 *
 * @interface
 */
export class PriceSnapshotRepository {
  /** @param {SnapshotInput} _snapshot */
  // eslint-disable-next-line no-unused-vars
  async add(_snapshot) {
    throw new Error('PriceSnapshotRepository.add não implementado');
  }

  /** @param {SnapshotInput[]} _snapshots */
  // eslint-disable-next-line no-unused-vars
  async addMany(_snapshots) {
    throw new Error('PriceSnapshotRepository.addMany não implementado');
  }

  /**
   * @param {string} _gameId
   * @returns {Promise<import('../../domain/value-objects/PricePoint').PricePoint[]>}
   *   pontos ordenados do mais antigo ao mais recente
   */
  // eslint-disable-next-line no-unused-vars
  async findByGame(_gameId) {
    throw new Error('PriceSnapshotRepository.findByGame não implementado');
  }
}
