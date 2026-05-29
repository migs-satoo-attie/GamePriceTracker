import { Game } from '../../domain/entities/Game';
import { detectAlert } from '../../domain/services/detectAlert';
import { withRetry } from '../../shared/withRetry';
import { createLogger } from '../../shared/logger';

const logger = createLogger('SyncPrices');

/**
 * Use-case: sincronizar os preços do catálogo.
 *
 * Para cada jogo: busca o preço atual (com retentativas), grava um snapshot
 * histórico, atualiza o catálogo e dispara alertas (preço-alvo / queda) via
 * notificador. Falhas por jogo são isoladas (Promise.allSettled) — uma fonte
 * instável não derruba a sincronização inteira.
 */
export class SyncPrices {
  /**
   * @param {object} deps
   * @param {import('../ports/GameRepository').GameRepository} deps.gameRepository
   * @param {import('../ports/PriceSnapshotRepository').PriceSnapshotRepository} deps.snapshotRepository
   * @param {import('../ports/CurrentPriceProvider').CurrentPriceProvider} deps.priceProvider
   * @param {{ notify: Function }} deps.notifier
   * @param {() => Date} [deps.clock]
   * @param {Map<string, import('../../domain/value-objects/Money').Money>} [deps.targets]
   * @param {number} [deps.retries]
   */
  constructor({ gameRepository, snapshotRepository, priceProvider, notifier, clock = () => new Date(), targets = new Map(), retries = 2 }) {
    if (!gameRepository || !snapshotRepository || !priceProvider || !notifier) {
      throw new Error('SyncPrices: dependências obrigatórias ausentes');
    }
    this.gameRepository = gameRepository;
    this.snapshotRepository = snapshotRepository;
    this.priceProvider = priceProvider;
    this.notifier = notifier;
    this.clock = clock;
    this.targets = targets;
    this.retries = retries;
  }

  async execute() {
    const games = await this.gameRepository.findAll();
    const results = await Promise.allSettled(games.map((g) => this.#syncOne(g)));

    const summary = { synced: 0, alerts: 0, failures: 0, skipped: 0, triggered: [] };
    for (const r of results) {
      if (r.status === 'rejected') {
        summary.failures += 1;
        continue;
      }
      if (r.value.skipped) {
        summary.skipped += 1;
        continue;
      }
      summary.synced += 1;
      if (r.value.alert) {
        summary.alerts += 1;
        summary.triggered.push(r.value.alert);
      }
    }
    logger.info('sincronização concluída', {
      synced: summary.synced,
      alerts: summary.alerts,
      failures: summary.failures,
      skipped: summary.skipped,
    });
    return summary;
  }

  /**
   * @param {Game} game
   * @returns {Promise<{ skipped?: boolean, alert?: import('../../domain/entities/PriceAlert').PriceAlert|null }>}
   */
  async #syncOne(game) {
    const current = await withRetry(() => this.priceProvider.getCurrentPrice(game.id), {
      retries: this.retries,
      onRetry: (attempt, err) =>
        logger.warn('retry preço atual', { gameId: game.id, attempt, error: err.message }),
    });

    if (!current) return { skipped: true };

    const now = this.clock();
    await this.snapshotRepository.add({
      gameId: game.id,
      price: current.price,
      recordedAt: now,
      source: 'sync',
    });

    const previousPrice = game.currentPrice;
    const historicalLow = current.price.isLessThan(game.historicalLow) ? current.price : game.historicalLow;

    await this.gameRepository.upsert(
      new Game({
        id: game.id,
        name: game.name,
        coverImage: game.coverImage,
        store: game.store,
        originalPrice: game.originalPrice,
        currentPrice: current.price,
        historicalLow,
        discountPercent: current.discountPercent,
        priceHistory: [],
      }),
    );

    const alert = detectAlert({
      gameId: game.id,
      gameName: game.name,
      previousPrice,
      currentPrice: current.price,
      targetPrice: this.targets.get(game.id) ?? null,
      now,
    });

    if (alert) await this.notifier.notify(alert);
    return { alert };
  }
}
