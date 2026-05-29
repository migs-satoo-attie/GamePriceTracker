# Autenticação — Steam OpenID

Login via **Steam OpenID 2.0** com sessão **stateless** (cookie httpOnly assinado
por HMAC-SHA256). Sem dependências externas de auth.

## Endpoints

| Método | Rota                         | Descrição                                                   |
| ------ | ---------------------------- | ----------------------------------------------------------- |
| GET    | `/api/auth/steam/login`      | Redireciona (302) para o login da Steam                     |
| GET    | `/api/auth/steam/callback`   | Valida a asserção, cria a sessão e redireciona para `/`     |
| GET    | `/api/auth/me`               | Retorna o usuário autenticado (ou 401)                      |
| POST   | `/api/auth/logout`           | Limpa o cookie de sessão                                    |

### `GET /api/auth/me`

```jsonc
// 200 — autenticado
{ "authenticated": true, "user": { "username": "gaben", "avatar": "...", "steamId": "765..." } }
// 401 — não autenticado
{ "authenticated": false }
```

## Fluxo

```
front → /api/auth/steam/login
          → 302 steamcommunity.com/openid/login (checkid_setup)
              → usuário autentica na Steam
                  → 302 /api/auth/steam/callback?openid.*
                        → verify (check_authentication na Steam)
                        → upsert do usuário + emite token de sessão
                        → Set-Cookie gpt_session (httpOnly) + 302 para /
```

## Componentes (Clean Architecture)

```
domain/value-objects/SteamId            valida SteamID64 / extrai do claimed_id
infrastructure/auth/
  SteamOpenIdClient                     buildAuthUrl + verify (fetch injetável)
  SessionService                        issue/verify de token HMAC (node:crypto)
infrastructure/http/cookies             parse/serialize de cookies
application/use-cases/
  BeginSteamLogin, CompleteSteamLogin, GetCurrentUser
application/ports/UserRepository        (InMemory + Postgres)
infrastructure/composition/auth         buildAuth(env, origin)
```

## Segurança

- Cookie `gpt_session`: **HttpOnly**, **SameSite=Lax**, `Path=/`, **Secure** em
  produção (`NODE_ENV=production`), `Max-Age` de 7 dias.
- Token assinado por HMAC (comparação *timing-safe*); expira por `exp`.
- O `claimed_id` é validado contra o host `steamcommunity.com` antes de confiar no SteamID.
- `SESSION_SECRET` **obrigatório em produção** (ver `.env.example`).
- Persistência de usuários em Postgres quando `DATABASE_URL` está definido; caso
  contrário, em memória (apenas demonstração).

## Integração com o front (sem alterá-lo)

O back-end é completo e independente. Para ativar o login real, basta o botão
"Sign in with Steam" navegar para a rota de login — uma mudança de **1 linha** no
front (fora do escopo deste back-end):

```js
// LoginScreen: trocar o setTimeout simulado por:
window.location.href = '/api/auth/steam/login';
```

Após o callback, o cookie de sessão é definido e o front pode consultar
`GET /api/auth/me` para obter o usuário e usar `user.steamId` ao chamar
`/api/wishlist?profile=<steamId>`.

## Testes

- Unitários: `SteamId`, `SessionService`, `SteamOpenIdClient` (fetch fake),
  `cookies`, use-cases, repositórios.
- Integração: `tests/integration/auth.route.test.js` exercita o fluxo completo
  (login → callback com `fetch` mockado → me → logout).
