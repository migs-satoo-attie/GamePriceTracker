import { ProfileReference } from '../../domain/value-objects/ProfileReference';

/**
 * Use-case: obter (sincronizar) a wishlist de um perfil Steam.
 *
 * Valida e normaliza o input do perfil em uma {@link ProfileReference} e delega
 * a um {@link WishlistProvider}. Mantém o contrato da rota `/api/wishlist`:
 *   { user, games, totalCount, source }
 */
export class GetWishlist {
  /**
   * @param {object} deps
   * @param {import('../ports/WishlistProvider').WishlistProvider} deps.provider
   */
  constructor({ provider }) {
    if (!provider) throw new Error('GetWishlist: provider é obrigatório');
    this.provider = provider;
  }

  /**
   * @param {string} profileInput — entrada bruta (SteamID64, URL ou vanity)
   * @returns {Promise<import('../ports/WishlistProvider').WishlistResult>}
   */
  async execute(profileInput) {
    const ref = ProfileReference.parse(profileInput); // lança se vazio/ inválido
    return this.provider.getWishlist(ref);
  }
}
