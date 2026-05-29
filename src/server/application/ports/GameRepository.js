/**
 * Porta (interface) para o catálogo de jogos monitorados/persistidos.
 *
 * @interface
 */
export class GameRepository {
  /**
   * Insere ou atualiza o jogo.
   * @param {import('../../domain/entities/Game').Game} _game
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async upsert(_game) {
    throw new Error('GameRepository.upsert não implementado');
  }

  /**
   * @param {string} _id
   * @returns {Promise<import('../../domain/entities/Game').Game|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findById(_id) {
    throw new Error('GameRepository.findById não implementado');
  }

  /** @returns {Promise<import('../../domain/entities/Game').Game[]>} */
  async findAll() {
    throw new Error('GameRepository.findAll não implementado');
  }
}
