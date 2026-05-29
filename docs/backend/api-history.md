# Histórico de preços — `GET /api/history/[appId]`

Retorna a série mensal (12 pontos) de preços de um jogo, no formato consumido
diretamente pelo gráfico do front-end (`PriceChartModal`).

## Contrato

### Request

```
GET /api/history/:appId
```

| Parâmetro | Tipo   | Descrição               |
| --------- | ------ | ----------------------- |
| `appId`   | string | Steam AppID do jogo     |

### Response `200 OK`

```jsonc
{
  "history": [199.9, 199.9, 199.9, 149.9, 149.9, 149.9, 99.95, 99.95, 149.9, 99.95, 59.97, 99.95],
  "source": "itad" // "itad" | "mock" | "empty"
}
```

- `history`: array de **12 números** em BRL, do mês **mais antigo** ao **mais recente**.
  Quando não há dados, retorna `[]` (o gráfico exibe "sem dados").
- `source`: origem dos dados.
  - `itad` — IsThereAnyDeal (modo real, requer `ITAD_API_KEY`).
  - `mock` — dataset local (modo demonstração ou fallback).
  - `empty` — jogo não encontrado em nenhuma fonte.

> Em caso de erro inesperado, a resposta inclui também `warning` (string) e
> `history: []`, mantendo a página resiliente.

## Comportamento

```
route handler (controller)
  └─ buildGetGameHistory(env)            ← composition root
       └─ GetGameHistory (use-case)
            └─ PriceHistoryProvider (port)
                 ├─ sem ITAD_API_KEY → MockPriceHistoryProvider
                 └─ com ITAD_API_KEY → Fallback([ItadProvider, MockProvider])
```

- Com `ITAD_API_KEY`: ITAD é a fonte primária; em falha/indisponibilidade, cai
  automaticamente para o mock (tolerância a falhas externas).
- A montagem da série mensal (agregação por mês, *carry-forward* de meses sem
  dado, janela de 12 meses) é regra de **domínio** (`PriceHistory.toMonthlySeries`).

## Regras de domínio relevantes

- Preços trafegam internamente em **centavos inteiros** (`Money`) para evitar
  erros de ponto flutuante; são serializados em reais.
- Múltiplos pontos no mesmo mês → **média** (arredondada ao centavo).
- Meses sem dado herdam o último preço conhecido; meses anteriores ao primeiro
  dado usam o `fallback` (preço atual do jogo) ou `0`.
- A janela mensal é ancorada no dia 1 para evitar *overflow* de dia em meses
  curtos (ex.: 31/mai → fevereiro).

## Exemplos

```bash
# Modo demonstração (sem chaves):
curl http://localhost:3000/api/history/1091500
# → { "history": [...12...], "source": "mock" }

curl http://localhost:3000/api/history/000000
# → { "history": [], "source": "empty" }
```
