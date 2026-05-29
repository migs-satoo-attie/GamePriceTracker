import { SyncPrices } from './SyncPrices';
import { InMemoryGameRepository } from '../../infrastructure/repositories/InMemoryGameRepository';
import { InMemoryPriceSnapshotRepository } from '../../infrastructure/repositories/InMemoryPriceSnapshotRepository';
import { Game } from '../../domain/entities/Game';
import { Money } from '../../domain/value-objects/Money';

const NOW = new Date('2026-05-29T12:00:00Z');
const clock = () => NOW;

function game(id, currentReais = 100) {
  return new Game({
    id,
    name: `Game ${id}`,
    coverImage: 'c',
    originalPrice: Money.fromReais(200),
    currentPrice: Money.fromReais(currentReais),
    historicalLow: Money.fromReais(currentReais),
  });
}

function build({ games = [], prices = {}, targets = new Map() } = {}) {
  const gameRepository = new InMemoryGameRepository(games);
  const snapshotRepository = new InMemoryPriceSnapshotRepository();
  const notifier = { notify: jest.fn(async () => {}) };
  const priceProvider = {
    getCurrentPrice: jest.fn(async (id) => {
      const p = prices[id];
      if (p === undefined) return null;
      if (p instanceof Error) throw p;
      return { price: Money.fromReais(p.price), discountPercent: p.discount ?? 0 };
    }),
  };
  const useCase = new SyncPrices({ gameRepository, snapshotRepository, priceProvider, notifier, clock, targets });
  return { useCase, gameRepository, snapshotRepository, notifier, priceProvider };
}

describe('SyncPrices (use-case)', () => {
  it('sincroniza todos os jogos e grava um snapshot por jogo', async () => {
    const t = build({
      games: [game('1', 100), game('2', 50)],
      prices: { 1: { price: 100 }, 2: { price: 50 } }, // sem queda
    });

    const summary = await t.useCase.execute();

    expect(summary.synced).toBe(2);
    expect(summary.alerts).toBe(0);
    expect(summary.failures).toBe(0);
    expect(await t.snapshotRepository.findByGame('1')).toHaveLength(1);
    expect(await t.snapshotRepository.findByGame('2')).toHaveLength(1);
  });

  it('atualiza o preço atual no catálogo e o historical low', async () => {
    const t = build({ games: [game('1', 100)], prices: { 1: { price: 40, discount: 80 } } });
    await t.useCase.execute();
    const updated = await t.gameRepository.findById('1');
    expect(updated.currentPrice.toReais()).toBe(40);
    expect(updated.discountPercent).toBe(80);
    expect(updated.historicalLow.toReais()).toBe(40); // 40 < 100
  });

  it('dispara price_drop quando o preço cai vs o catálogo', async () => {
    const t = build({ games: [game('1', 100)], prices: { 1: { price: 50 } } });
    const summary = await t.useCase.execute();
    expect(summary.alerts).toBe(1);
    expect(summary.triggered[0].kind).toBe('price_drop');
    expect(t.notifier.notify).toHaveBeenCalledTimes(1);
  });

  it('dispara target_reached quando há preço-alvo atingido', async () => {
    const t = build({
      games: [game('1', 100)],
      prices: { 1: { price: 50 } },
      targets: new Map([['1', Money.fromReais(60)]]),
    });
    const summary = await t.useCase.execute();
    expect(summary.triggered[0].kind).toBe('target_reached');
  });

  it('tolera falha por jogo (uma falha não derruba as outras)', async () => {
    const t = build({
      games: [game('1', 100), game('2', 100)],
      prices: { 1: new Error('store 500'), 2: { price: 90 } },
    });
    const summary = await t.useCase.execute();
    expect(summary.failures).toBe(1);
    expect(summary.synced).toBe(1);
  });

  it('pula jogo sem preço disponível (null) sem gravar snapshot', async () => {
    const t = build({ games: [game('1', 100)], prices: {} }); // provider retorna null
    const summary = await t.useCase.execute();
    expect(summary.synced).toBe(0);
    expect(summary.skipped).toBe(1);
    expect(await t.snapshotRepository.findByGame('1')).toHaveLength(0);
  });
});
