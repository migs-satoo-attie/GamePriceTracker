import cron from 'node-cron';

/**
 * Adapter de agendamento sobre node-cron.
 *
 * É a porta de agendamento da aplicação: trocar por BullMQ/Redis no futuro é
 * substituir esta implementação, sem alterar os use-cases. `cronLib` é
 * injetável para testes.
 */
export class CronScheduler {
  /** @param {{ cronLib?: object, timezone?: string }} [deps] */
  constructor({ cronLib = cron, timezone } = {}) {
    this.cronLib = cronLib;
    this.timezone = timezone;
  }

  /**
   * @param {string} cronExpr — expressão cron (ex.: '0 * * * *')
   * @param {() => void | Promise<void>} handler
   * @returns {{ stop: Function }}
   */
  schedule(cronExpr, handler) {
    if (!this.cronLib.validate(cronExpr)) {
      throw new Error(`CronScheduler: expressão cron inválida (${cronExpr})`);
    }
    return this.cronLib.schedule(cronExpr, handler, { timezone: this.timezone });
  }
}
