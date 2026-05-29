import { Money } from '../value-objects/Money';

/**
 * Entidade que agrega o histórico temporal de preços de um jogo.
 *
 * Concentra a regra de negócio de transformar pontos de preço brutos em uma
 * série mensal consistente — exatamente o formato (`number[]` em reais, do mês
 * mais antigo ao mais recente) consumido pelo gráfico do front-end
 * (`PriceChartModal`).
 */
export class PriceHistory {
  /**
   * @param {string} gameId — identificador do jogo (Steam AppID)
   * @param {import('../value-objects/PricePoint').PricePoint[]} points
   */
  constructor(gameId, points = []) {
    this.gameId = String(gameId);
    /** @type {import('../value-objects/PricePoint').PricePoint[]} */
    this.points = [...points];
  }

  /**
   * Constrói uma janela de `months` meses (calendário) terminando no mês de `now`.
   * @param {number} months
   * @param {Date} now
   * @returns {{ year: number, month: number }[]} do mais antigo ao mais recente
   */
  static buildWindow(months, now) {
    return Array.from({ length: months }, (_, i) => {
      const offset = months - 1 - i;
      // Ancorar no dia 1 evita overflow de dia (ex.: 29 de maio → setMonth p/ fev
      // estouraria para março). Só interessa ano+mês aqui.
      const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  /**
   * Converte o histórico em uma série mensal de preços (reais).
   *
   * - Pontos do mesmo mês são agregados pela média (arredondada ao centavo).
   * - Meses sem dados herdam o último preço conhecido (carry-forward).
   * - Meses anteriores a qualquer dado usam `fallback` (ou 0 se ausente).
   * - Pontos fora da janela são ignorados.
   *
   * @param {object} [options]
   * @param {number} [options.months=12]
   * @param {Date} [options.now=new Date()]
   * @param {Money} [options.fallback] — preço usado antes do primeiro dado conhecido
   * @returns {number[]} série de tamanho `months`, do mês mais antigo ao mais recente
   */
  toMonthlySeries({ months = 12, now = new Date(), fallback } = {}) {
    const window = PriceHistory.buildWindow(months, now);

    // Agrupa centavos por chave ano-mês.
    const byMonth = new Map();
    for (const point of this.points) {
      const d = point.recordedAt;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!byMonth.has(key)) byMonth.set(key, []);
      byMonth.get(key).push(point.price.cents);
    }

    let lastKnownCents = fallback instanceof Money ? fallback.cents : 0;

    return window.map(({ year, month }) => {
      const key = `${year}-${month}`;
      const bucket = byMonth.get(key);
      if (bucket && bucket.length > 0) {
        const avg = bucket.reduce((sum, c) => sum + c, 0) / bucket.length;
        lastKnownCents = Math.round(avg);
      }
      return lastKnownCents / 100;
    });
  }

  /**
   * @returns {Money|null} menor preço já registrado, ou null se não há pontos
   */
  lowest() {
    if (this.points.length === 0) return null;
    return this.points.reduce(
      (min, p) => (min === null || p.price.isLessThan(min) ? p.price : min),
      null,
    );
  }
}
