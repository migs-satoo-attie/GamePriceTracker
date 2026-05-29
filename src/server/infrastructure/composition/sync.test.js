import { buildSyncPrices } from './sync';
import { mockData } from '@/data/mockData';

describe('buildSyncPrices (composition root)', () => {
  it('modo demo: sincroniza o catálogo do mock sem falhas', async () => {
    const useCase = buildSyncPrices({ env: {} });
    const summary = await useCase.execute();
    expect(summary.synced).toBe(mockData.length);
    expect(summary.failures).toBe(0);
  });

  it('aceita dependências injetadas', async () => {
    const gameRepository = { findAll: jest.fn(async () => []), upsert: jest.fn() };
    const deps = {
      gameRepository,
      snapshotRepository: { add: jest.fn() },
      priceProvider: { getCurrentPrice: jest.fn(async () => null) },
      notifier: { notify: jest.fn() },
    };
    const useCase = buildSyncPrices({ env: {}, deps });
    const summary = await useCase.execute();
    expect(gameRepository.findAll).toHaveBeenCalled();
    expect(summary.synced).toBe(0);
  });
});
