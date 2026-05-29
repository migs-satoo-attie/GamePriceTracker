import { Game } from './Game';
import { Money } from '../value-objects/Money';

function baseProps(overrides = {}) {
  return {
    id: '1091500',
    name: 'Cyberpunk 2077',
    coverImage: 'https://cdn/header.jpg',
    originalPrice: Money.fromReais(199.9),
    currentPrice: Money.fromReais(99.95),
    historicalLow: Money.fromReais(59.97),
    discountPercent: 50,
    store: 'Steam',
    priceHistory: [],
    ...overrides,
  };
}

describe('Game (entidade)', () => {
  it('serializa no schema exato consumido pelo front (preços em reais)', () => {
    const game = new Game(baseProps());
    expect(game.toJSON()).toEqual({
      id: '1091500',
      name: 'Cyberpunk 2077',
      coverImage: 'https://cdn/header.jpg',
      originalPrice: 199.9,
      currentPrice: 99.95,
      historicalLow: 59.97,
      discountPercent: 50,
      store: 'Steam',
      priceHistory: [],
    });
  });

  it('normaliza o id para string', () => {
    expect(new Game(baseProps({ id: 1091500 })).id).toBe('1091500');
  });

  it('usa currentPrice como historicalLow quando não informado', () => {
    const game = new Game(baseProps({ historicalLow: undefined }));
    expect(game.toJSON().historicalLow).toBe(99.95);
  });

  it('default: store "Steam", discount 0, priceHistory []', () => {
    const game = new Game({
      id: '1',
      name: 'X',
      coverImage: 'c',
      originalPrice: Money.fromReais(10),
      currentPrice: Money.fromReais(10),
    });
    const json = game.toJSON();
    expect(json.store).toBe('Steam');
    expect(json.discountPercent).toBe(0);
    expect(json.priceHistory).toEqual([]);
  });

  it('exige name não vazio', () => {
    expect(() => new Game(baseProps({ name: '' }))).toThrow(/name/i);
  });

  it('exige preços do tipo Money', () => {
    expect(() => new Game(baseProps({ currentPrice: 99.95 }))).toThrow(/Money/);
  });

  it('rejeita desconto fora de 0–100', () => {
    expect(() => new Game(baseProps({ discountPercent: 150 }))).toThrow(/desconto|discount/i);
    expect(() => new Game(baseProps({ discountPercent: -5 }))).toThrow(/desconto|discount/i);
  });
});
