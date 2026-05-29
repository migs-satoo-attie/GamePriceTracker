/**
 * Cliente para a IsThereAnyDeal (ITAD) API v2.
 *
 * Variáveis de ambiente necessárias (server-side only):
 *   ITAD_API_KEY — chave obtida em https://isthereanydeal.com/dev/app/
 *
 * Documentação: https://docs.itad.com/
 *
 * Todos os preços são solicitados em BRL (country=BR).
 */

const ITAD_BASE = 'https://api.isthereanydeal.com';

function getKey() {
  const key = process.env.ITAD_API_KEY;
  if (!key) throw new Error('ITAD_API_KEY não configurada');
  return key;
}

/**
 * Busca jogos pelo título.
 * Retorna lista de objetos { id, slug, title }.
 *
 * @param {string} query — termo de busca
 * @param {number} [limit=20] — max resultados
 * @returns {Promise<Array<{id: string, slug: string, title: string}>>}
 */
export async function searchGames(query, limit = 20) {
  const key = getKey();
  const url = `${ITAD_BASE}/games/search/v1?key=${key}&title=${encodeURIComponent(query)}&results=${limit}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`ITAD search falhou (${res.status})`);
  return res.json();
}

/**
 * Busca preços atuais de uma lista de jogos ITAD (por ID).
 * Retorna os melhores preços de todas as lojas.
 *
 * @param {string[]} gameIds — array de ITAD game IDs
 * @returns {Promise<Array>} Lista de resultados com deals por jogo
 */
export async function getGamePrices(gameIds) {
  const key = getKey();
  const url = `${ITAD_BASE}/games/prices/v3?key=${key}&country=BR&shops[]=steam`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameIds),
    next: { revalidate: 900 },
  });
  if (!res.ok) throw new Error(`ITAD prices falhou (${res.status})`);
  return res.json();
}

/**
 * Retorna o histórico de preços de um jogo na Steam (últimos 365 dias).
 * Cada ponto tem { price: { amount }, timestamp }.
 *
 * @param {string} gameId — ITAD game ID
 * @returns {Promise<Array<{timestamp: number, price: {amount: number}}>>}
 */
export async function getPriceHistory(gameId) {
  const key = getKey();
  const url = `${ITAD_BASE}/games/history/v2?key=${key}&id=${gameId}&shops[]=steam&country=BR`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`ITAD history falhou (${res.status})`);
  return res.json();
}

/**
 * Converte o histórico bruto do ITAD em um array de 12 pontos mensais (BRL).
 * Agrega pela média do mês. Meses sem dados herdam o preço do mês anterior.
 *
 * @param {Array} rawHistory — resultado de getPriceHistory
 * @param {number} [fallbackPrice=0] — preço usado quando não há dado para o mês
 * @returns {number[]} Array com 12 valores, do mês mais antigo ao mais recente
 */
export function buildMonthlyHistory(rawHistory, fallbackPrice = 0) {
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now);
    d.setMonth(now.getMonth() - (11 - i));
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // Agrupar pontos por ano+mês
  const byMonth = {};
  for (const point of rawHistory ?? []) {
    const d = new Date(point.timestamp * 1000);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(point.price?.amount ?? 0);
  }

  let lastKnown = fallbackPrice;
  return months.map(({ year, month }) => {
    const key = `${year}-${month}`;
    if (byMonth[key]) {
      const avg = byMonth[key].reduce((a, b) => a + b, 0) / byMonth[key].length;
      lastKnown = Math.round(avg * 100) / 100;
    }
    return lastKnown;
  });
}

/**
 * Normaliza a resposta de preços do ITAD para o schema interno do projeto.
 *
 * @param {object} itadGame   — item de searchGames
 * @param {object} priceData  — item de getGamePrices correspondente ao mesmo id
 * @returns {object} Game object compatível com o schema do mockData
 */
export function normalizeItadGame(itadGame, priceData) {
  const steamDeal = priceData?.deals?.find(d => d.shop?.id === 'steam') ?? priceData?.deals?.[0];

  const currentPrice = steamDeal?.price?.amount ?? 0;
  const originalPrice = steamDeal?.regular?.amount ?? currentPrice;
  const discountPercent = steamDeal?.cut ?? 0;
  const historicalLow = priceData?.historicalLow?.amount ?? currentPrice;

  // Tenta extrair o appId do slug (padrão: "slug-APPID" não existe no ITAD,
  // mas os URLs do ITAD referenciam o ID próprio, não o AppID Steam).
  // A capa usa o AppID da Steam — quando disponível via appid nos deals.
  const steamAppId = steamDeal?.id ?? itadGame.id;
  const coverImage = steamDeal?.id
    ? `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${steamDeal.id}/header.jpg`
    : `https://via.placeholder.com/460x215.png?text=${encodeURIComponent(itadGame.title)}`;

  return {
    id: itadGame.id,
    name: itadGame.title,
    coverImage,
    originalPrice,
    currentPrice,
    historicalLow,
    discountPercent,
    store: steamDeal?.shop?.name ?? 'Steam',
    priceHistory: [], // preenchido pela rota /api/history
  };
}
