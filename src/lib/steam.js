/**
 * Cliente para a Steam Web API e Store API.
 *
 * Variáveis de ambiente necessárias (server-side only):
 *   STEAM_API_KEY — chave obtida em https://steamcommunity.com/dev/apikey
 *
 * Referência: https://developer.valvesoftware.com/wiki/Steam_Web_API
 */

const STEAM_API_BASE = 'https://api.steampowered.com';
const STORE_API_BASE = 'https://store.steampowered.com';

/**
 * Converte uma vanity URL do Steam em SteamID64.
 * Ex.: "gaben" → "76561197960287930"
 *
 * @param {string} vanityUrl — slug da URL (não a URL completa)
 * @returns {Promise<string>} SteamID64
 */
export async function resolveVanityUrl(vanityUrl) {
  const key = process.env.STEAM_API_KEY;
  if (!key) throw new Error('STEAM_API_KEY não configurada');

  const url = `${STEAM_API_BASE}/ISteamUser/ResolveVanityURL/v0001/?key=${key}&vanityurl=${encodeURIComponent(vanityUrl)}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Steam API erro ${res.status}`);

  const data = await res.json();
  if (data.response?.success !== 1) {
    throw new Error('Perfil não encontrado: ' + (data.response?.message || 'vanity URL inválida'));
  }
  return data.response.steamid;
}

/**
 * Retorna dados públicos do perfil de um ou mais jogadores.
 *
 * @param {string} steamId64 — SteamID64
 * @returns {Promise<object|null>} Player summary object ou null
 */
export async function getUserSummary(steamId64) {
  const key = process.env.STEAM_API_KEY;
  if (!key) throw new Error('STEAM_API_KEY não configurada');

  const url = `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=${steamId64}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Steam API erro ${res.status}`);

  const data = await res.json();
  return data.response?.players?.[0] ?? null;
}

/**
 * Retorna a wishlist pública de um perfil Steam.
 * A wishlist precisa estar pública nas configurações de privacidade do usuário.
 *
 * @param {string} steamId64
 * @returns {Promise<object>} Mapa { appId: { name, capsule, priority, ... } }
 */
export async function getWishlist(steamId64) {
  const url = `${STORE_API_BASE}/wishlist/profiles/${steamId64}/wishlistdata/?p=0`;
  const res = await fetch(url, { next: { revalidate: 300 } });

  if (!res.ok) throw new Error(`Wishlist indisponível (${res.status}). Verifique se o perfil é público.`);

  const data = await res.json();

  // A Steam retorna `[]` (array vazio) quando a wishlist é privada ou não existe
  if (Array.isArray(data)) {
    throw new Error('Wishlist privada ou vazia. Torne a wishlist pública nas configurações do Steam.');
  }

  return data;
}

/**
 * Retorna detalhes de um app da Steam Store (preço, nome, descrição, etc.).
 * Preços são retornados em centavos (BRL quando cc=br).
 *
 * @param {string|number} appId — Steam AppID
 * @returns {Promise<object|null>} App data ou null se não encontrado
 */
export async function getAppDetails(appId) {
  const url = `${STORE_API_BASE}/api/appdetails?appids=${appId}&cc=br&l=portuguese`;
  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) throw new Error(`Store API erro ${res.status} para app ${appId}`);

  const data = await res.json();
  const appData = data[String(appId)];

  if (!appData?.success) return null;
  return appData.data;
}

/**
 * Extrai e normaliza um objeto de jogo a partir de um app detail da Steam.
 * Retorna no mesmo schema do mockData para compatibilidade com os componentes.
 *
 * @param {string} appId
 * @param {object} detail — resultado de getAppDetails
 * @returns {object} Game object
 */
export function normalizeAppDetail(appId, detail) {
  const priceOverview = detail?.price_overview;
  const originalPrice = priceOverview ? priceOverview.initial / 100 : 0;
  const currentPrice = priceOverview ? priceOverview.final / 100 : 0;
  const discountPercent = priceOverview?.discount_percent ?? 0;

  return {
    id: String(appId),
    name: detail.name,
    coverImage: `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`,
    originalPrice,
    currentPrice,
    historicalLow: currentPrice, // fallback; substituído por dados do ITAD quando disponível
    discountPercent,
    store: 'Steam',
    priceHistory: [],            // preenchido pela rota /api/history quando necessário
  };
}
