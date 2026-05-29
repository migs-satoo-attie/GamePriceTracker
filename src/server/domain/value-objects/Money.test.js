import { Money } from './Money';

describe('Money (value object)', () => {
  describe('construção', () => {
    it('cria a partir de centavos inteiros', () => {
      const money = Money.fromCents(9995);
      expect(money.cents).toBe(9995);
    });

    it('cria a partir de reais arredondando para o centavo mais próximo', () => {
      expect(Money.fromReais(99.95).cents).toBe(9995);
      expect(Money.fromReais(19.999).cents).toBe(2000);
      expect(Money.fromReais(0).cents).toBe(0);
    });

    it('rejeita centavos não inteiros', () => {
      expect(() => Money.fromCents(10.5)).toThrow(/inteiro/i);
    });

    it('rejeita valores negativos', () => {
      expect(() => Money.fromCents(-1)).toThrow(/negativo/i);
      expect(() => Money.fromReais(-5)).toThrow(/negativo/i);
    });

    it('rejeita valores não numéricos', () => {
      expect(() => Money.fromReais('abc')).toThrow(/número|number/i);
      expect(() => Money.fromCents(NaN)).toThrow(/número|number/i);
    });
  });

  describe('conversão', () => {
    it('converte centavos de volta para reais com 2 casas', () => {
      expect(Money.fromCents(9995).toReais()).toBe(99.95);
      expect(Money.fromCents(2000).toReais()).toBe(20);
    });

    it('serializa via toJSON como número em reais (compatível com o front)', () => {
      expect(Money.fromCents(9995).toJSON()).toBe(99.95);
      expect(JSON.stringify({ price: Money.fromCents(9995) })).toBe('{"price":99.95}');
    });
  });

  describe('comparação', () => {
    const a = Money.fromReais(10);
    const b = Money.fromReais(20);

    it('detecta igualdade por valor', () => {
      expect(a.equals(Money.fromReais(10))).toBe(true);
      expect(a.equals(b)).toBe(false);
    });

    it('compara menor e maior', () => {
      expect(a.isLessThan(b)).toBe(true);
      expect(b.isGreaterThan(a)).toBe(true);
      expect(a.isLessThan(a)).toBe(false);
    });
  });

  describe('imutabilidade', () => {
    it('é imutável (congelado)', () => {
      const money = Money.fromCents(100);
      expect(Object.isFrozen(money)).toBe(true);
    });
  });
});
