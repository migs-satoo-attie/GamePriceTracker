# Wishlist — `GET /api/wishlist`

Retorna a wishlist e o perfil de um usuário Steam, sincronizada da conta.

## Contrato

### Request

```
GET /api/wishlist?profile=<input>
```

| Parâmetro | Tipo   | Descrição                                                              |
| --------- | ------ | --------------------------------------------------------------------- |
| `profile` | string | SteamID64, URL `/profiles/<id>`, URL `/id/<vanity>` ou vanity/username |

### Response `200 OK`

```jsonc
{
  "user": { "username": "gaben", "avatar": "https://.../full.jpg", "steamId": "76561197960287930" },
  "games": [
    {
      "id": "1091500",
      "name": "Cyberpunk 2077",
      "coverImage": "https://shared.cloudflare.steamstatic.com/.../1091500/header.jpg",
      "originalPrice": 199.9,
      "currentPrice": 99.95,
      "historicalLow": 99.95,
      "discountPercent": 50,
      "store": "Steam",
      "priceHistory": []
    }
  ],
  "totalCount": 42,
  "source": "steam" // "steam" | "mock"
}
```

- `totalCount` é o tamanho **total** da wishlist (pode exceder `games.length`, pois
  os detalhes são buscados em lote para evitar rate limit — até 8 por requisição).
- `priceHistory` vem vazio aqui; é preenchido sob demanda por `GET /api/history/[appId]`.

### Erros

| Status | Quando                              | Corpo                          |
| ------ | ----------------------------------- | ------------------------------ |
| `400`  | `profile` ausente                   | `{ error }`                    |
| `502`  | Falha na Steam (perfil/wishlist privados, upstream) | `{ error }`    |

## Comportamento

```
route handler (controller)
  └─ buildGetWishlist(env)                ← composition root
       └─ GetWishlist (use-case)          ← parseia ProfileReference (valida)
            └─ WishlistProvider (port)
                 ├─ sem STEAM_API_KEY → MockWishlistProvider (demo)
                 └─ com STEAM_API_KEY → SteamWishlistProvider (lib/steam)
```

- **Parsing do perfil** é regra de domínio (`ProfileReference.parse`).
- Apps sem detalhes válidos (privados, falha pontual) são descartados sem
  derrubar a resposta (tolerância a falhas).
- Preços da Steam chegam em centavos e são modelados como `Money` internamente.

## Exemplos

```bash
# Modo demonstração:
curl "http://localhost:3000/api/wishlist?profile=qualquer"
# → { user: {...}, games: [...], totalCount: 12, source: "mock" }

# Real (com STEAM_API_KEY):
curl "http://localhost:3000/api/wishlist?profile=https://steamcommunity.com/id/gaben/"
```
