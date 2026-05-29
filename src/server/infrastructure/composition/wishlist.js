import { GetWishlist } from '../../application/use-cases/GetWishlist';
import { MockWishlistProvider } from '../providers/MockWishlistProvider';
import { SteamWishlistProvider } from '../providers/SteamWishlistProvider';
import {
  resolveVanityUrl,
  getUserSummary,
  getWishlist,
  getAppDetails,
} from '@/lib/steam';
import { mockData } from '@/data/mockData';

/**
 * Composition root da wishlist: monta providers → use-case conforme o ambiente.
 *
 * - Sem `STEAM_API_KEY`: modo demonstração (MockWishlistProvider).
 * - Com `STEAM_API_KEY`: SteamWishlistProvider sobre o client de `src/lib/steam`.
 *
 * Dependências externas injetáveis para testes sem rede.
 *
 * @param {object} [deps]
 * @param {Record<string, string|undefined>} [deps.env]
 * @param {Array} [deps.data] — dataset mock
 * @param {object} [deps.steamClient] — client Steam (default: lib/steam)
 * @returns {GetWishlist}
 */
export function buildGetWishlist({ env = process.env, data = mockData, steamClient } = {}) {
  if (!env.STEAM_API_KEY) {
    return new GetWishlist({ provider: new MockWishlistProvider({ data }) });
  }

  const client = steamClient ?? { resolveVanityUrl, getUserSummary, getWishlist, getAppDetails };
  return new GetWishlist({ provider: new SteamWishlistProvider({ client }) });
}
