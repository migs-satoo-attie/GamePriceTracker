# Back-end — GamePriceTracker

Back-end do sistema de monitoramento de preços da wishlist da Steam, desenvolvido
sob **TDD** (RED → GREEN → REFACTOR) e **Clean Architecture**, embutido nos
**Route Handlers do Next.js** (sem servidor separado, para preservar 100% dos
contratos `/api/*` consumidos pelo front-end existente).

## Princípios

- **Domínio puro, sem dependências externas** — regras de negócio testáveis isoladamente.
- **Dependency Inversion** — a aplicação depende de *ports* (interfaces); a
  infraestrutura fornece *adapters*. Tudo é injetável → testes sem rede/DB.
- **Route handler = controller fino** — apenas traduz HTTP ↔ use-case.
- **Tolerância a falhas externas** — providers com fallback; o front nunca quebra
  por falha de back-end.

## Estrutura

```
src/server/
  domain/                     Entidades + Value Objects (regras de negócio)
    value-objects/            Money, PricePoint
    entities/                 PriceHistory
  application/                Casos de uso e contratos
    ports/                    Interfaces (PriceHistoryProvider, ...)
    use-cases/                GetGameHistory, ...
  infrastructure/             Implementações concretas
    providers/                ItadPriceHistoryProvider, MockPriceHistoryProvider,
                              FallbackPriceHistoryProvider
    composition/              Composition roots (montagem do grafo de dependências)
  shared/                     logger estruturado, utilidades transversais
```

Os **route handlers** em `src/app/api/**/route.js` importam um *composition root*
de `src/server/infrastructure/composition/**` e delegam ao use-case.

## Camadas e regra de dependência

```
domain  ←  application  ←  infrastructure  ←  app/api (route handlers)
```

Dependências apontam sempre para dentro. O domínio não conhece ITAD, Steam, Next
ou banco de dados.

## Testes

```bash
npm test          # roda toda a suíte (Jest + @swc/jest)
npm run test:watch
npm run test:cov  # cobertura
```

- **Unitários**: colocados ao lado do código (`src/server/**/*.test.js`).
- **Integração**: em `tests/integration/**` (exercitam os route handlers).
- Logs são silenciados nos testes (`tests/jest.setup.js` define `LOG_LEVEL=silent`).

## Variáveis de ambiente

Veja [`.env.example`](../../.env.example). Sem `STEAM_API_KEY`/`ITAD_API_KEY` o
sistema opera em **modo demonstração** (mockData), garantindo que o front funcione
sem credenciais.

## Funcionalidades

- [Histórico de preços (`GET /api/history/[appId]`)](./api-history.md) ✅
- [Wishlist (`GET /api/wishlist`)](./api-wishlist.md) ✅
- [Busca (`GET /api/search`)](./api-search.md) ✅
- [Persistência Postgres (sem ORM)](./persistence.md) ✅
- [Autenticação Steam OpenID](./auth.md) ✅
- [Jobs de sincronização e alertas](./jobs.md) ✅
