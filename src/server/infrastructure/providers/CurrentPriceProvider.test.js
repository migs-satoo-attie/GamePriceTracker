import { MockCurrentPriceProvider } from './MockCurrentPriceProvider';
import { SteamCurrentPriceProvider } from './SteamCurrentPriceProvider';
import { Money } from '../../domain/value-objects/Money';

describe('MockCurrentPriceProvider', () => {
  const data = [{ id: '1', currentPrice: 59.97, discountPercent: 50 }];

  it('retorna preço (Money) e desconto do mock', async () => {
    const provider = new MockCurrentPriceProvider({ data });
    const result = await provider.getCurrentPrice('1');
    expect(result.price).toBeInstanceOf(Money);
    expect(result.price.toReais()).toBe(59.97);
    expect(result.discountPercent).toBe(50);
  });

  it('retorna null para jogo desconhecido', async () => {
    expect(await new MockCurrentPriceProvider({ data }).getCurrentPrice('999')).toBeNull();
  });
});

describe('SteamCurrentPriceProvider', () => {
  it('mapeia price_overview (centavos) para Money + desconto', async () => {
    const client = { getAppDetails: jest.fn(async () => ({ price_overview: { final: 9995, discount_percent: 50 } })) };
    const provider = new SteamCurrentPriceProvider({ client });
    const result = await provider.getCurrentPrice('1091500');

    expect(client.getAppDetails).toHaveBeenCalledWith('1091500');
    expect(result.price.toReais()).toBe(99.95);
    expect(result.discountPercent).toBe(50);
  });

  it('retorna null quando não há detalhes', async () => {
    const client = { getAppDetails: jest.fn(async () => null) };
    expect(await new SteamCurrentPriceProvider({ client }).getCurrentPrice('x')).toBeNull();
  });

  it('trata app sem price_overview como preço zero', async () => {
    const client = { getAppDetails: jest.fn(async () => ({ name: 'Free' })) };
    const result = await new SteamCurrentPriceProvider({ client }).getCurrentPrice('x');
    expect(result.price.toReais()).toBe(0);
    expect(result.discountPercent).toBe(0);
  });
});
