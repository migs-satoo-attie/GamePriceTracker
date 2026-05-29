import { LogAlertNotifier } from './LogAlertNotifier';
import { PriceAlert } from '../../domain/entities/PriceAlert';
import { Money } from '../../domain/value-objects/Money';

describe('LogAlertNotifier', () => {
  it('registra o alerta serializado no logger', async () => {
    const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
    const notifier = new LogAlertNotifier({ logger });
    const alert = new PriceAlert({
      gameId: '1',
      gameName: 'Game',
      currentPrice: Money.fromReais(50),
      kind: 'price_drop',
      triggeredAt: new Date('2026-05-29T12:00:00Z'),
    });

    await notifier.notify(alert);

    expect(logger.info).toHaveBeenCalledTimes(1);
    const [, payload] = logger.info.mock.calls[0];
    expect(payload).toMatchObject({ gameId: '1', kind: 'price_drop', currentPrice: 50 });
  });
});
