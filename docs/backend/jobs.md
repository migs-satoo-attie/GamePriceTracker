# Jobs — Sincronização de preços e alertas

Sincronização periódica que mantém o histórico de preços fresco, atualiza o
catálogo e dispara **alertas** (preço-alvo atingido / queda de preço).

## Componentes (Clean Architecture)

```
domain/
  entities/PriceAlert            alerta disparado (kind: target_reached | price_drop)
  services/detectAlert           regra de decisão do alerta (pura)
application/
  ports/CurrentPriceProvider     preço atual de um jogo
  ports/GameRepository           catálogo de jogos
  use-cases/SyncPrices           orquestra a sincronização
infrastructure/
  providers/{Mock,Steam}CurrentPriceProvider
  repositories/{InMemory,Postgres}GameRepository
  notifications/LogAlertNotifier
  jobs/CronScheduler             adapter node-cron (porta de agendamento)
  jobs/schedulePriceSync         agenda o job (handler blindado)
  jobs/startPriceSyncScheduler   bootstrap opt-in
  composition/sync               buildSyncPrices(env)
shared/withRetry                 retentativa p/ falhas transitórias
```

## Fluxo do `SyncPrices`

Para cada jogo do catálogo (`GameRepository.findAll`):

1. Busca o **preço atual** (`CurrentPriceProvider`) com **retentativas** (`withRetry`).
2. Grava um **snapshot** (`PriceSnapshotRepository`) — alimenta `GET /api/history`.
3. Atualiza o catálogo (preço atual, desconto, *historical low*).
4. Avalia alerta (`detectAlert`) e **notifica** se disparar.

Falhas por jogo são isoladas (`Promise.allSettled`): uma fonte instável não
derruba a sincronização. Retorno:

```jsonc
{ "synced": 8, "alerts": 2, "failures": 1, "skipped": 0, "triggered": [ /* PriceAlert[] */ ] }
```

## Acionamento

### Manual — `POST /api/jobs/sync`

```bash
curl -X POST http://localhost:3000/api/jobs/sync
# Com proteção (CRON_SECRET definido):
curl -X POST http://localhost:3000/api/jobs/sync -H "x-cron-secret: $CRON_SECRET"
```

Resposta: o resumo acima (com `triggered` serializado). `401` se `CRON_SECRET`
estiver definido e o header não bater.

### Agendado — node-cron (interno)

Opt-in via env (ver `.env.example`):

```
ENABLE_PRICE_SYNC=true
SYNC_CRON=0 * * * *     # de hora em hora (default)
```

O agendador é iniciado no startup pelo `instrumentation.js` do Next
(`startPriceSyncScheduler`), apenas no runtime Node.

### Agendado — cron externo (alternativa)

Sem o agendador interno, basta um cron do SO/plataforma chamando
`POST /api/jobs/sync` com o header `x-cron-secret`.

## Alertas e preço-alvo

`detectAlert` prioriza `target_reached` (preço ≤ alvo) sobre `price_drop`
(queda vs. último preço). Os **preços-alvo** são mantidos pelo front
(localStorage); para alertas de alvo no back-end, injete um `targets`
(`Map<gameId, Money>`) em `SyncPrices` — uma futura tabela de "watches" pode
alimentá-lo sem alterar o use-case.

> **Escalabilidade:** `CronScheduler` é a porta de agendamento; trocar por
> BullMQ + Redis (filas, retries distribuídos, rate-limit) é substituir essa
> implementação, sem tocar nos use-cases.

## Testes

- Unitários: `detectAlert`, `PriceAlert`, `SyncPrices`, `CronScheduler`,
  `schedulePriceSync`, `startPriceSyncScheduler`, `withRetry`, providers e repos.
- Integração: `tests/integration/jobs.sync.route.test.js` (trigger + proteção).
