import { CronScheduler } from './CronScheduler';
import { schedulePriceSync } from './schedulePriceSync';
import { buildSyncPrices } from '../composition/sync';

/**
 * Bootstrap do agendador de sincronização de preços.
 *
 * Opt-in: só agenda quando `ENABLE_PRICE_SYNC === 'true'`. Chamado a partir do
 * `instrumentation.js` (runtime Node do Next). Dependências injetáveis p/ testes.
 *
 * @param {object} [params]
 * @param {Record<string,string|undefined>} [params.env]
 * @param {{ schedule: Function }} [params.scheduler]
 * @param {{ execute: Function }} [params.syncPrices]
 * @returns {{ stop: Function } | null}
 */
export function startPriceSyncScheduler({ env = process.env, scheduler, syncPrices } = {}) {
  if (env.ENABLE_PRICE_SYNC !== 'true') return null;

  const sched = scheduler ?? new CronScheduler({ timezone: env.TZ });
  const sync = syncPrices ?? buildSyncPrices({ env });
  const cronExpr = env.SYNC_CRON || '0 * * * *';

  return schedulePriceSync({ scheduler: sched, syncPrices: sync, cronExpr });
}
