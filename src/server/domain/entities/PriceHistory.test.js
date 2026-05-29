import { PriceHistory } from './PriceHistory';
import { PricePoint } from '../value-objects/PricePoint';
import { Money } from '../value-objects/Money';

/** Helper: cria um PricePoint a partir de reais + data ISO. */
function point(reais, iso) {
  return new PricePoint({ price: Money.fromReais(reais), recordedAt: new Date(iso) });
}

describe('PriceHistory.toMonthlySeries', () => {
  // "now" fixo para tornar os testes determinísticos (mês de referência = Dez/2026).
  const now = new Date('2026-12-15T00:00:00Z');

  it('retorna exatamente N pontos (default 12)', () => {
    const history = new PriceHistory('1091500', []);
    expect(history.toMonthlySeries({ now })).toHaveLength(12);
    expect(history.toMonthlySeries({ months: 6, now })).toHaveLength(6);
  });

  it('sem dados e sem fallback, retorna zeros', () => {
    const history = new PriceHistory('1091500', []);
    expect(history.toMonthlySeries({ now })).toEqual(Array(12).fill(0));
  });

  it('sem dados, usa o fallback informado em todos os meses', () => {
    const history = new PriceHistory('1091500', []);
    const series = history.toMonthlySeries({ now, fallback: Money.fromReais(50) });
    expect(series).toEqual(Array(12).fill(50));
  });

  it('preenche o mês correspondente e mantém a ordem do mais antigo ao mais recente', () => {
    // Preço só em Dez/2026 (último mês da janela)
    const history = new PriceHistory('1091500', [point(99.95, '2026-12-10T00:00:00Z')]);
    const series = history.toMonthlySeries({ now, fallback: Money.fromReais(199.9) });
    // 11 meses anteriores herdam o fallback; o último é o preço de dezembro
    expect(series.slice(0, 11)).toEqual(Array(11).fill(199.9));
    expect(series[11]).toBe(99.95);
  });

  it('carrega para frente o último preço conhecido em meses sem dados', () => {
    const history = new PriceHistory('1091500', [
      point(199.9, '2026-11-05T00:00:00Z'), // penúltimo mês
    ]);
    const series = history.toMonthlySeries({ now });
    // meses anteriores a nov: 0 (sem fallback); nov e dez: 199.9 (carry-forward)
    expect(series[10]).toBe(199.9); // novembro
    expect(series[11]).toBe(199.9); // dezembro herda novembro
  });

  it('agrega múltiplos pontos do mesmo mês pela média (arredondada ao centavo)', () => {
    const history = new PriceHistory('1091500', [
      point(100, '2026-12-02T00:00:00Z'),
      point(200, '2026-12-20T00:00:00Z'),
    ]);
    const series = history.toMonthlySeries({ now });
    expect(series[11]).toBe(150); // média de 100 e 200
  });

  it('alinha meses corretamente quando "now" cai em dia inexistente em meses curtos (regressão fev)', () => {
    // 31 de maio: a janela inclui fev/2026 no índice 8. Um setMonth ingênuo
    // preservando o dia 31 estouraria fevereiro para março, desalinhando a série.
    const endOfMonthNow = new Date('2026-05-31T12:00:00Z');
    const history = new PriceHistory('1091500', [point(149.9, '2026-02-15T12:00:00Z')]);
    const series = history.toMonthlySeries({ now: endOfMonthNow });
    expect(series[8]).toBe(149.9); // fevereiro
    expect(series[9]).toBe(149.9); // março herda (carry-forward), não recebe o ponto
  });

  it('ignora pontos fora da janela de meses', () => {
    const history = new PriceHistory('1091500', [
      point(10, '2020-01-15T12:00:00Z'), // muito antigo, fora da janela
      point(80, '2026-12-15T12:00:00Z'),
    ]);
    const series = history.toMonthlySeries({ now });
    expect(series[11]).toBe(80);
    expect(series.slice(0, 11)).toEqual(Array(11).fill(0));
  });
});

describe('PriceHistory.lowest', () => {
  it('retorna o menor preço (Money) registrado', () => {
    const history = new PriceHistory('1091500', [
      point(99.95, '2026-10-01T00:00:00Z'),
      point(59.97, '2026-11-01T00:00:00Z'),
      point(199.9, '2026-12-01T00:00:00Z'),
    ]);
    expect(history.lowest()).toBeInstanceOf(Money);
    expect(history.lowest().toReais()).toBe(59.97);
  });

  it('retorna null quando não há pontos', () => {
    expect(new PriceHistory('1091500', []).lowest()).toBeNull();
  });
});
