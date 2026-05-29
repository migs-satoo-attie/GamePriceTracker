import { schedulePriceSync } from './schedulePriceSync';

describe('schedulePriceSync', () => {
  it('agenda o job com a expressão cron informada', () => {
    const scheduler = { schedule: jest.fn() };
    const syncPrices = { execute: jest.fn(async () => ({ synced: 1 })) };

    schedulePriceSync({ scheduler, syncPrices, cronExpr: '0 * * * *' });

    expect(scheduler.schedule).toHaveBeenCalledWith('0 * * * *', expect.any(Function));
  });

  it('o handler agendado dispara a sincronização', async () => {
    const scheduler = { schedule: jest.fn() };
    const syncPrices = { execute: jest.fn(async () => ({ synced: 2 })) };
    schedulePriceSync({ scheduler, syncPrices, cronExpr: '* * * * *' });

    const handler = scheduler.schedule.mock.calls[0][1];
    await handler();
    expect(syncPrices.execute).toHaveBeenCalledTimes(1);
  });

  it('o handler não propaga erros (cron não pode quebrar)', async () => {
    const scheduler = { schedule: jest.fn() };
    const syncPrices = { execute: jest.fn(async () => { throw new Error('boom'); }) };
    schedulePriceSync({ scheduler, syncPrices, cronExpr: '* * * * *' });

    const handler = scheduler.schedule.mock.calls[0][1];
    await expect(handler()).resolves.toBeUndefined();
  });
});
