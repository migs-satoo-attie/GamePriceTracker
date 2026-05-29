import { startPriceSyncScheduler } from './startPriceSyncScheduler';

describe('startPriceSyncScheduler', () => {
  it('não agenda nada quando ENABLE_PRICE_SYNC != true', () => {
    const scheduler = { schedule: jest.fn() };
    const result = startPriceSyncScheduler({ env: {}, scheduler, syncPrices: { execute: jest.fn() } });
    expect(result).toBeNull();
    expect(scheduler.schedule).not.toHaveBeenCalled();
  });

  it('agenda com o SYNC_CRON quando habilitado', () => {
    const scheduler = { schedule: jest.fn(() => ({ stop: () => {} })) };
    startPriceSyncScheduler({
      env: { ENABLE_PRICE_SYNC: 'true', SYNC_CRON: '*/30 * * * *' },
      scheduler,
      syncPrices: { execute: jest.fn() },
    });
    expect(scheduler.schedule).toHaveBeenCalledWith('*/30 * * * *', expect.any(Function));
  });

  it('usa cron horário por padrão', () => {
    const scheduler = { schedule: jest.fn(() => ({ stop: () => {} })) };
    startPriceSyncScheduler({ env: { ENABLE_PRICE_SYNC: 'true' }, scheduler, syncPrices: { execute: jest.fn() } });
    expect(scheduler.schedule).toHaveBeenCalledWith('0 * * * *', expect.any(Function));
  });
});
