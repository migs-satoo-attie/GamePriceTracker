import { SyncPrices } from '../../application/use-cases/SyncPrices';
import { InMemoryGameRepository } from '../repositories/InMemoryGameRepository';
import { PostgresGameRepository } from '../repositories/PostgresGameRepository';
import { InMemoryPriceSnapshotRepository } from '../repositories/InMemoryPriceSnapshotRepository';
import { PostgresPriceSnapshotRepository } from '../repositories/PostgresPriceSnapshotRepository';
import { MockCurrentPriceProvider } from '../providers/MockCurrentPriceProvider';
import { SteamCurrentPriceProvider } from '../providers/SteamCurrentPriceProvider';
import { LogAlertNotifier } from '../notifications/LogAlertNotifier';
import { gameFromMockEntry } from '../mappers/gameMapper';
import { getPool } from '../db/pool';
import { getAppDetails } from '@/lib/steam';
import { mockData } from '@/data/mockData';

// Singletons p/ o modo sem banco: mantêm catálogo e snapshots entre a rota de
// trigger e o agendador no mesmo processo (em produção, use DATABASE_URL).
let memGames;
let memSnapshots;

/**
 * Composition root da sincronização de preços.
 *
 * - Sem DATABASE_URL: catálogo em memória semeado a partir do mockData.
 * - Com DATABASE_URL: repositórios Postgres.
 * - Preço atual: Steam (se STEAM_API_KEY) ou mock.
 *
 * @param {object} [params]
 * @param {Record<string,string|undefined>} [params.env]
 * @param {object} [params.deps] — { gameRepository, snapshotRepository, priceProvider, notifier, targets }
 * @returns {SyncPrices}
 */
export function buildSyncPrices({ env = process.env, deps = {} } = {}) {
  let gameRepository = deps.gameRepository;
  let snapshotRepository = deps.snapshotRepository;

  if (!gameRepository || !snapshotRepository) {
    if (env.DATABASE_URL) {
      const db = getPool(env.DATABASE_URL);
      gameRepository = gameRepository ?? new PostgresGameRepository({ db });
      snapshotRepository = snapshotRepository ?? new PostgresPriceSnapshotRepository({ db });
    } else {
      if (!memGames) memGames = new InMemoryGameRepository(mockData.map(gameFromMockEntry));
      if (!memSnapshots) memSnapshots = new InMemoryPriceSnapshotRepository();
      gameRepository = gameRepository ?? memGames;
      snapshotRepository = snapshotRepository ?? memSnapshots;
    }
  }

  const priceProvider =
    deps.priceProvider ??
    (env.STEAM_API_KEY
      ? new SteamCurrentPriceProvider({ client: { getAppDetails: (id) => getAppDetails(id) } })
      : new MockCurrentPriceProvider({ data: mockData }));

  const notifier = deps.notifier ?? new LogAlertNotifier();
  const targets = deps.targets ?? new Map();

  return new SyncPrices({ gameRepository, snapshotRepository, priceProvider, notifier, targets });
}
