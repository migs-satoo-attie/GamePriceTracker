import { CronScheduler } from './CronScheduler';

function fakeCron() {
  return {
    validate: jest.fn(() => true),
    schedule: jest.fn(() => ({ stop: jest.fn() })),
  };
}

describe('CronScheduler', () => {
  it('agenda um handler com a expressão cron', () => {
    const cronLib = fakeCron();
    const scheduler = new CronScheduler({ cronLib });
    const handler = () => {};

    const job = scheduler.schedule('0 * * * *', handler);

    expect(cronLib.schedule).toHaveBeenCalledWith('0 * * * *', handler, expect.any(Object));
    expect(typeof job.stop).toBe('function');
  });

  it('rejeita expressão cron inválida', () => {
    const cronLib = fakeCron();
    cronLib.validate.mockReturnValue(false);
    const scheduler = new CronScheduler({ cronLib });

    expect(() => scheduler.schedule('xyz', () => {})).toThrow(/cron/i);
    expect(cronLib.schedule).not.toHaveBeenCalled();
  });
});
