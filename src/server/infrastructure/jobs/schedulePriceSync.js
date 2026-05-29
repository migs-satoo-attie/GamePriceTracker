import { createLogger } from '../../shared/logger';

const logger = createLogger('schedulePriceSync');

/**
 * Agenda a sincronização periódica de preços.
 *
 * O handler é blindado: erros são logados e nunca propagados, para que uma
 * execução com falha não derrube o agendador.
 *
 * @param {object} params
 * @param {{ schedule: Function }} params.scheduler
 * @param {{ execute: () => Promise<object> }} params.syncPrices
 * @param {string} params.cronExpr
 * @returns {{ stop: Function }}
 */
export function schedulePriceSync({ scheduler, syncPrices, cronExpr }) {
  logger.info('agendando sincronização de preços', { cronExpr });
  return scheduler.schedule(cronExpr, async () => {
    try {
      const summary = await syncPrices.execute();
      logger.info('sincronização agendada concluída', summary && {
        synced: summary.synced,
        alerts: summary.alerts,
        failures: summary.failures,
      });
    } catch (err) {
      logger.error('sincronização agendada falhou', { error: err.message });
    }
  });
}
