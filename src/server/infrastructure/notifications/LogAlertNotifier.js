import { createLogger } from '../../shared/logger';

/**
 * Notificador de alertas que registra no log estruturado.
 *
 * É a implementação padrão da porta de notificação; pode ser trocada por
 * e-mail/push/webhook futuramente sem alterar o use-case de sync.
 */
export class LogAlertNotifier {
  /** @param {{ logger?: object }} [deps] */
  constructor({ logger = createLogger('alerts') } = {}) {
    this.logger = logger;
  }

  /** @param {import('../../domain/entities/PriceAlert').PriceAlert} alert */
  async notify(alert) {
    this.logger.info('alerta de preço disparado', alert.toJSON());
  }
}
