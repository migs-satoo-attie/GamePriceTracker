/**
 * Mock data simulando respostas da Steam API + IsThereAnyDeal.
 * Usado como fallback quando as chaves de API não estão configuradas.
 *
 * Schema de cada jogo:
 *   id             — Steam AppID (string, igual ao da Steam)
 *   name           — Nome do jogo
 *   coverImage     — URL da capa (header.jpg do CDN Steam)
 *   originalPrice  — Preço sem desconto (BRL)
 *   currentPrice   — Preço atual (BRL)
 *   historicalLow  — Menor preço já registrado (BRL) — deve ser ≤ min(priceHistory)
 *   discountPercent— Desconto atual em % (0–100). Consistente: currentPrice ≈ originalPrice * (1 - discount/100)
 *   store          — Loja de origem
 *   priceHistory   — 12 pontos mensais (BRL), do mês mais antigo ao mais recente
 */
export const mockData = [
  {
    id: '1091500',
    name: 'Cyberpunk 2077',
    coverImage: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg',
    originalPrice: 199.90,
    currentPrice: 99.95,
    historicalLow: 59.97,
    discountPercent: 50,
    store: 'Steam',
    // min(priceHistory) = 59.97 ≥ historicalLow ✓
    priceHistory: [199.90, 199.90, 199.90, 149.90, 149.90, 149.90, 99.95, 99.95, 149.90, 99.95, 59.97, 99.95],
  },
  {
    id: '1245620',
    name: 'Elden Ring',
    coverImage: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg',
    originalPrice: 249.90,
    currentPrice: 174.93,
    historicalLow: 149.90,
    discountPercent: 30,
    store: 'Steam',
    // Corrigido: historicalLow agora aparece no histórico ✓
    priceHistory: [249.90, 249.90, 249.90, 229.90, 229.90, 174.93, 249.90, 174.93, 249.90, 149.90, 249.90, 174.93],
  },
  {
    id: '413150',
    name: 'Stardew Valley',
    coverImage: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg',
    originalPrice: 24.99,
    currentPrice: 24.99,
    historicalLow: 12.49,
    discountPercent: 0,
    store: 'Steam',
    priceHistory: [24.99, 24.99, 24.99, 24.99, 19.99, 24.99, 24.99, 24.99, 12.49, 24.99, 24.99, 24.99],
  },
  {
    id: '1174180',
    name: 'Red Dead Redemption 2',
    coverImage: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg',
    originalPrice: 299.90,
    currentPrice: 98.96,
    historicalLow: 89.97,
    discountPercent: 67,
    store: 'Steam',
    // Corrigido: historicalLow (89.97) < currentPrice (98.96) ✓
    priceHistory: [299.90, 149.95, 299.90, 98.96, 299.90, 98.96, 299.90, 89.97, 299.90, 149.95, 98.96, 98.96],
  },
  {
    id: '367520',
    name: 'Hollow Knight',
    coverImage: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg',
    originalPrice: 46.99,
    currentPrice: 23.49,
    historicalLow: 13.99,
    discountPercent: 50,
    store: 'Steam',
    priceHistory: [46.99, 46.99, 23.49, 46.99, 46.99, 23.49, 46.99, 23.49, 13.99, 46.99, 23.49, 23.49],
  },
  {
    id: '1086940',
    name: "Baldur's Gate 3",
    coverImage: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg',
    originalPrice: 199.99,
    currentPrice: 199.99,
    historicalLow: 159.99,
    discountPercent: 0,
    store: 'Steam',
    priceHistory: [199.99, 199.99, 199.99, 199.99, 199.99, 179.99, 199.99, 199.99, 159.99, 199.99, 179.99, 199.99],
  },
  {
    id: '292030',
    name: 'The Witcher 3: Wild Hunt',
    coverImage: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg',
    originalPrice: 79.99,
    currentPrice: 19.99,
    historicalLow: 15.99,
    discountPercent: 75,
    store: 'Steam',
    priceHistory: [79.99, 19.99, 79.99, 79.99, 19.99, 79.99, 19.99, 79.99, 15.99, 79.99, 19.99, 19.99],
  },
  {
    id: '1145360',
    name: 'Hades',
    coverImage: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1145360/header.jpg',
    originalPrice: 46.99,
    currentPrice: 46.99,
    historicalLow: 23.49,
    discountPercent: 0,
    store: 'Steam',
    priceHistory: [46.99, 46.99, 46.99, 36.99, 46.99, 46.99, 23.49, 46.99, 46.99, 46.99, 36.99, 46.99],
  },
  {
    id: '814380',
    name: 'Sekiro™: Shadows Die Twice',
    coverImage: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/814380/header.jpg',
    originalPrice: 199.90,
    currentPrice: 99.95,
    historicalLow: 79.96,
    discountPercent: 50,
    store: 'Steam',
    priceHistory: [199.90, 199.90, 199.90, 199.90, 129.00, 199.90, 99.95, 199.90, 79.96, 99.95, 199.90, 99.95],
  },
  {
    id: '275850',
    name: "No Man's Sky",
    coverImage: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/275850/header.jpg',
    originalPrice: 129.99,
    currentPrice: 64.99,
    historicalLow: 38.99,
    discountPercent: 50,
    store: 'Steam',
    priceHistory: [129.99, 129.99, 64.99, 129.99, 64.99, 129.99, 129.99, 64.99, 38.99, 129.99, 64.99, 64.99],
  },
];
