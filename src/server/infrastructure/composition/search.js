import { SearchGames } from '../../application/use-cases/SearchGames';
import { MockGameSearchProvider } from '../providers/MockGameSearchProvider';
import { ItadGameSearchProvider } from '../providers/ItadGameSearchProvider';
import { FallbackGameSearchProvider } from '../providers/FallbackGameSearchProvider';
import { searchGames, getGamePrices } from '@/lib/itad';
import { mockData } from '@/data/mockData';

/**
 * Composition root da busca: monta providers → use-case conforme o ambiente.
 *
 * - Sem `ITAD_API_KEY`: modo demonstração (filtra o mock).
 * - Com `ITAD_API_KEY`: ITAD como fonte primária, com fallback para o mock em
 *   caso de falha (tolerância a falhas externas).
 *
 * @param {object} [deps]
 * @param {Record<string, string|undefined>} [deps.env]
 * @param {Array} [deps.data]
 * @param {object} [deps.itadClient] — client ITAD (default: lib/itad)
 * @returns {SearchGames}
 */
export function buildSearchGames({ env = process.env, data = mockData, itadClient } = {}) {
  const mockProvider = new MockGameSearchProvider({ data });

  if (!env.ITAD_API_KEY) {
    return new SearchGames({ provider: mockProvider });
  }

  const client = itadClient ?? { searchGames, getGamePrices };
  const itadProvider = new ItadGameSearchProvider({ client });
  const provider = new FallbackGameSearchProvider([itadProvider, mockProvider]);
  return new SearchGames({ provider });
}
