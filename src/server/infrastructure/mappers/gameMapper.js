import { Game } from '../../domain/entities/Game';
import { Money } from '../../domain/value-objects/Money';

const STEAM_HEADER_CDN = 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps';

/**
 * Constrói uma entidade {@link Game} a partir de uma entrada do mockData
 * (preços já em reais).
 *
 * @param {object} raw
 * @returns {Game}
 */
export function gameFromMockEntry(raw) {
  return new Game({
    id: raw.id,
    name: raw.name,
    coverImage: raw.coverImage,
    originalPrice: Money.fromReais(raw.originalPrice ?? 0),
    currentPrice: Money.fromReais(raw.currentPrice ?? 0),
    historicalLow: Money.fromReais(raw.historicalLow ?? raw.currentPrice ?? 0),
    discountPercent: raw.discountPercent ?? 0,
    store: raw.store ?? 'Steam',
    priceHistory: raw.priceHistory ?? [],
  });
}

/**
 * Constrói uma entidade {@link Game} a partir de um app detail da Steam Store.
 * Os preços da Steam vêm em centavos (`price_overview.initial/final`).
 *
 * @param {string|number} appId
 * @param {object} detail — resultado de getAppDetails
 * @returns {Game}
 */
/**
 * Constrói uma entidade {@link Game} a partir de um resultado de busca do ITAD
 * cruzado com seus preços. O `id` é o ID interno do ITAD; a capa usa o AppID
 * Steam quando disponível no deal.
 *
 * @param {{ id: string, title: string }} itadGame — item de searchGames
 * @param {object} [priceData] — item correspondente de getGamePrices
 * @returns {Game}
 */
export function gameFromItadSearch(itadGame, priceData) {
  const steamDeal =
    priceData?.deals?.find((d) => d.shop?.id === 'steam') ?? priceData?.deals?.[0];

  const currentPrice = Money.fromReais(steamDeal?.price?.amount ?? 0);
  const originalPrice = Money.fromReais(steamDeal?.regular?.amount ?? steamDeal?.price?.amount ?? 0);
  const historicalLow = Money.fromReais(priceData?.historicalLow?.amount ?? steamDeal?.price?.amount ?? 0);
  const discountPercent = Math.round(steamDeal?.cut ?? 0);

  const coverImage = steamDeal?.id
    ? `${STEAM_HEADER_CDN}/${steamDeal.id}/header.jpg`
    : `https://via.placeholder.com/460x215.png?text=${encodeURIComponent(itadGame.title)}`;

  return new Game({
    id: itadGame.id,
    name: itadGame.title,
    coverImage,
    originalPrice,
    currentPrice,
    historicalLow,
    discountPercent,
    store: steamDeal?.shop?.name ?? 'Steam',
    priceHistory: [],
  });
}

export function gameFromSteamAppDetail(appId, detail) {
  const po = detail?.price_overview;
  const originalPrice = Money.fromCents(po?.initial ?? 0);
  const currentPrice = Money.fromCents(po?.final ?? 0);
  const discountPercent = po?.discount_percent ?? 0;

  return new Game({
    id: appId,
    name: detail.name,
    coverImage: `${STEAM_HEADER_CDN}/${appId}/header.jpg`,
    originalPrice,
    currentPrice,
    historicalLow: currentPrice, // substituído por dado do ITAD na rota /api/history
    discountPercent,
    store: 'Steam',
    priceHistory: [],
  });
}
