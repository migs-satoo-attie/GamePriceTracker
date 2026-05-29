# Busca — `GET /api/search`

Busca jogos por título.

## Contrato

### Request

```
GET /api/search?q=<query>
```

| Parâmetro | Tipo   | Descrição                          |
| --------- | ------ | ---------------------------------- |
| `q`       | string | Termo de busca (mínimo 2 caracteres) |

### Response `200 OK`

```jsonc
{
  "results": [
    {
      "id": "itad-or-appid",
      "name": "Cyberpunk 2077",
      "coverImage": "https://.../header.jpg",
      "originalPrice": 199.9,
      "currentPrice": 99.95,
      "historicalLow": 59.97,
      "discountPercent": 50,
      "store": "Steam",
      "priceHistory": []
    }
  ],
  "source": "itad" // "itad" | "mock" | "empty"
}
```

### Erros

| Status | Quando                          | Corpo       |
| ------ | ------------------------------- | ----------- |
| `400`  | `q` ausente ou < 2 caracteres   | `{ error }` |

> Em falha do back-end, retorna `{ results: [], source: 'mock', warning }` (a
> busca degrada graciosamente em vez de quebrar).

## Comportamento

```
route handler (controller)
  └─ buildSearchGames(env)               ← composition root
       └─ SearchGames (use-case)         ← valida query (>= 2 chars)
            └─ GameSearchProvider (port)
                 ├─ sem ITAD_API_KEY → MockGameSearchProvider (filtra o mock)
                 └─ com ITAD_API_KEY → Fallback([ItadProvider, MockProvider])
```

- Com `ITAD_API_KEY`: cruza `searchGames` + `getGamePrices` do ITAD; em falha,
  cai para o mock automaticamente.
- `id` no modo ITAD é o ID interno do ITAD; a capa usa o AppID Steam do deal
  quando disponível.

## Exemplos

```bash
curl "http://localhost:3000/api/search?q=cyberpunk"
# → { results: [...], source: "mock" }   (ou "itad" com chave configurada)

curl "http://localhost:3000/api/search?q=a"
# → 400 { error: "Parâmetro q obrigatório (mínimo 2 caracteres)" }
```
