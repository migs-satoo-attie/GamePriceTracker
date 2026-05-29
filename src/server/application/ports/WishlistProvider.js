/**
 * Porta (interface) para fontes de wishlist de um perfil Steam.
 *
 * A camada de aplicação depende desta abstração; adapters concretos (Steam real,
 * mock/demo) a implementam na infraestrutura.
 *
 * @typedef {object} WishlistResult
 * @property {import('../../domain/value-objects/UserProfile').UserProfile} user
 * @property {import('../../domain/entities/Game').Game[]} games
 * @property {number} totalCount — total de itens na wishlist (pode exceder games.length)
 * @property {string} source — origem ('steam' | 'mock')
 *
 * @interface
 */
export class WishlistProvider {
  /**
   * @param {import('../../domain/value-objects/ProfileReference').ProfileReference} profileRef
   * @returns {Promise<WishlistResult>}
   */
  // eslint-disable-next-line no-unused-vars
  async getWishlist(profileRef) {
    throw new Error('WishlistProvider.getWishlist não implementado');
  }
}
