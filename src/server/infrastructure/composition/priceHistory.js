import { GetGameHistory } from '../../application/use-cases/GetGameHistory';
import { ItadPriceHistoryProvider } from '../providers/ItadPriceHistoryProvider';
import { MockPriceHistoryProvider } from '../providers/MockPriceHistoryProvider';
import { DbPriceHistoryProvider } from '../providers/DbPriceHistoryProvider';
import { FallbackPriceHistoryProvider } from '../providers/FallbackPriceHistoryProvider';
import { PostgresPriceSnapshotRepository } from '../repositories/PostgresPriceSnapshotRepository';
import { getPool } from '../db/pool';
import { Money } from '../../domain/value-objects/Money';
import { getPriceHistory as itadGetPriceHistory } from '@/lib/itad';
import { mockData } from '@/data/mockData';

/**
 * Composition root do histórico de preços: monta o grafo (providers → use-case)
 * de acordo com o ambiente.
 *
 * Cadeia de fontes (em ordem de prioridade, com fallback automático):
 *   1. Postgres (snapshots persistidos)  — se DATABASE_URL/repo disponível
 *   2. ITAD                              — se ITAD_API_KEY
 *   3. Mock                              — sempre (demonstração / último recurso)
 *
 * Dependências externas são injetáveis para testes sem rede/DB.
 *
 * @param {object} [deps]
 * @param {Record<string, string|undefined>} [deps.env]
 * @param {() => Date} [deps.clock]
 * @param {Array} [deps.data]
 * @param {{ getPriceHistory: (id: string) => Promise<Array> }} [deps.itadClient]
 * @param {import('../../application/ports/PriceSnapshotRepository').PriceSnapshotRepository} [deps.snapshotRepository]
 * @returns {GetGameHistory}
 */
export function buildGetGameHistory({
  env = process.env,
  clock = () => new Date(),
  data = mockData,
  itadClient = { getPriceHistory: (id) => itadGetPriceHistory(id) },
  snapshotRepository,
} = {}) {
  const chain = [];

  // 1. Persistência (Postgres) — injetada nos testes; em runtime, via DATABASE_URL.
  let repo = snapshotRepository;
  if (!repo && env.DATABASE_URL) {
    repo = new PostgresPriceSnapshotRepository({ db: getPool(env.DATABASE_URL) });
  }
  if (repo) {
    chain.push(new DbPriceHistoryProvider({ repository: repo }));
  }

  // 2. ITAD.
  if (env.ITAD_API_KEY) {
    chain.push(
      new ItadPriceHistoryProvider({
        client: itadClient,
        resolveFallback: (id) => {
          const game = data.find((g) => g.id === id);
          return game?.currentPrice ? Money.fromReais(game.currentPrice) : null;
        },
      }),
    );
  }

  // 3. Mock (sempre presente como último recurso).
  chain.push(new MockPriceHistoryProvider({ data, clock }));

  const provider = chain.length === 1 ? chain[0] : new FallbackPriceHistoryProvider(chain);
  return new GetGameHistory({ provider, clock });
}
