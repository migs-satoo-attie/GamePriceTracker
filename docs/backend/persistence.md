# Persistência — Postgres (sem ORM)

Persistência com **Postgres** usando o driver `pg` e **SQL puro** (sem ORM),
escondida atrás do **Repository Pattern**. As migrations são arquivos `.sql`
versionados, aplicados de forma idempotente e transacional.

## Setup local

```bash
npm run db:up        # sobe o Postgres via docker-compose
npm run db:migrate   # aplica as migrations pendentes
npm run db:down      # derruba o container
```

Configure `DATABASE_URL` (ver [`.env.example`](../../.env.example)):

```
DATABASE_URL=postgres://gpt:gpt@localhost:5432/gamepricetracker
```

## Schema

`src/server/infrastructure/db/migrations/001_init.sql`:

- **games** — catálogo (preços em centavos): `id`, `name`, `cover_image`, `store`,
  `*_price_cents`, `discount_percent`, `updated_at`.
- **price_snapshots** — série temporal: `id`, `game_id`, `price_cents`,
  `recorded_at`, `source`. Único por `(game_id, recorded_at)`; índice em
  `(game_id, recorded_at)` para a consulta de histórico.

> Preços são sempre **centavos inteiros** no banco, casando com o VO `Money`.

## Camadas

```
application/ports/PriceSnapshotRepository      (interface)
  ├─ infrastructure/repositories/InMemoryPriceSnapshotRepository   (testes/use-cases)
  └─ infrastructure/repositories/PostgresPriceSnapshotRepository   (pg, SQL puro)

infrastructure/db/
  pool.js        — pg.Pool singleton (injetado como `db` nos repositórios)
  migrate.js     — runMigrations/loadMigrations (idempotente, transacional)
  migrations/    — *.sql
```

## Integração com o histórico

`buildGetGameHistory` agora monta a cadeia de fontes com fallback automático:

```
1. DbPriceHistoryProvider (snapshots do Postgres)   — se DATABASE_URL/repo
2. ItadPriceHistoryProvider                          — se ITAD_API_KEY
3. MockPriceHistoryProvider                          — sempre (último recurso)
```

Quando há snapshots persistidos, `GET /api/history/[appId]` responde com
`source: "db"`; sem dados no banco, cai para ITAD e depois mock — sem quebrar o
contrato (`{ history, source }`).

## Testes

- **Unitários** (sem banco): `migrate.test.js`, `*Repository.test.js` (com `db`
  fake que valida o SQL e o mapeamento de linhas), `DbPriceHistoryProvider.test.js`.
- **Integração real** (`tests/integration/postgres.repository.test.js`): roda
  **apenas** com `DATABASE_URL` definido; caso contrário é pulado. Para rodar:

```bash
npm run db:up && npm run db:migrate
DATABASE_URL=postgres://gpt:gpt@localhost:5432/gamepricetracker npm test
```
