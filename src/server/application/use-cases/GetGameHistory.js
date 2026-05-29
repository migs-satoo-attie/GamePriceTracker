/**
 * Use-case: obter o histórico mensal de preços de um jogo.
 *
 * Orquestra a busca de dados (via {@link PriceHistoryProvider}) e a regra de
 * domínio que monta a série mensal de 12 pontos consumida pelo gráfico do
 * front-end. Mantém o contrato atual da rota `/api/history/[appId]`:
 *   { history: number[], source: string }
 */
export class GetGameHistory {
  /**
   * @param {object} deps
   * @param {import('../ports/PriceHistoryProvider').PriceHistoryProvider} deps.provider
   * @param {() => Date} [deps.clock] — fonte de "agora" (injetável para testes)
   * @param {number} [deps.months] — tamanho da janela mensal (default 12)
   */
  constructor({ provider, clock = () => new Date(), months = 12 }) {
    if (!provider) throw new Error('GetGameHistory: provider é obrigatório');
    this.provider = provider;
    this.clock = clock;
    this.months = months;
  }

  /**
   * @param {string} gameId — Steam AppID
   * @returns {Promise<{ history: number[], source: string }>}
   */
  async execute(gameId) {
    if (!gameId || typeof gameId !== 'string') {
      throw new Error('GetGameHistory: gameId é obrigatório');
    }

    const result = await this.provider.getPriceHistory(gameId);

    // Jogo não encontrado em nenhuma fonte.
    if (!result || !result.history) {
      return { history: [], source: 'empty' };
    }

    // Fonte conhecida porém sem pontos: mantém a origem mas sinaliza histórico vazio,
    // permitindo ao front exibir "sem dados" sem renderizar um gráfico de zeros.
    if (result.history.points.length === 0) {
      return { history: [], source: result.source };
    }

    const history = result.history.toMonthlySeries({
      months: this.months,
      now: this.clock(),
      fallback: result.fallback,
    });

    return { history, source: result.source };
  }
}
