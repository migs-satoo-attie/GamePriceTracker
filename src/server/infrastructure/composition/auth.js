import { BeginSteamLogin } from '../../application/use-cases/BeginSteamLogin';
import { CompleteSteamLogin } from '../../application/use-cases/CompleteSteamLogin';
import { GetCurrentUser } from '../../application/use-cases/GetCurrentUser';
import { SessionService } from '../auth/SessionService';
import { SteamOpenIdClient } from '../auth/SteamOpenIdClient';
import { InMemoryUserRepository } from '../repositories/InMemoryUserRepository';
import { PostgresUserRepository } from '../repositories/PostgresUserRepository';
import { getPool } from '../db/pool';
import { getUserSummary } from '@/lib/steam';

/** Nome do cookie de sessão. */
export const SESSION_COOKIE = 'gpt_session';
const SESSION_TTL_SECONDS = 7 * 24 * 3600;

// Singleton para o modo sem banco: mantém os usuários entre requisições do
// mesmo processo (em produção use DATABASE_URL para persistência real).
let inMemoryUserRepo;

function resolveUserRepository(env) {
  if (env.DATABASE_URL) return new PostgresUserRepository({ db: getPool(env.DATABASE_URL) });
  if (!inMemoryUserRepo) inMemoryUserRepo = new InMemoryUserRepository();
  return inMemoryUserRepo;
}

function defaultFetchProfile(env) {
  if (!env.STEAM_API_KEY) return undefined;
  return async (steamId) => {
    const summary = await getUserSummary(steamId);
    return summary ? { username: summary.personaname, avatar: summary.avatarfull } : null;
  };
}

/**
 * Composition root da autenticação. Monta os use-cases de auth a partir do
 * ambiente e do `origin` da requisição. Dependências injetáveis via `deps` para testes.
 *
 * @param {object} [params]
 * @param {Record<string, string|undefined>} [params.env]
 * @param {string} [params.origin] — origin da requisição (ex.: http://localhost:3000)
 * @param {object} [params.deps] — { sessionService, userRepository, openIdClient, fetchProfile }
 */
export function buildAuth({ env = process.env, origin, deps = {} } = {}) {
  const appOrigin = env.APP_URL || origin;
  const secret = env.SESSION_SECRET || 'dev-insecure-secret-change-me';

  const sessionService =
    deps.sessionService ?? new SessionService({ secret, ttlSeconds: SESSION_TTL_SECONDS });
  const userRepository = deps.userRepository ?? resolveUserRepository(env);
  const openIdClient =
    deps.openIdClient ??
    new SteamOpenIdClient({ realm: appOrigin, returnTo: `${appOrigin}/api/auth/steam/callback` });
  const fetchProfile = deps.fetchProfile ?? defaultFetchProfile(env);

  return {
    begin: new BeginSteamLogin({ openIdClient }),
    complete: new CompleteSteamLogin({ openIdClient, sessionService, userRepository, fetchProfile }),
    getCurrentUser: new GetCurrentUser({ sessionService, userRepository }),
    sessionService,
    cookieOptions: {
      httpOnly: true,
      sameSite: 'Lax',
      path: '/',
      secure: env.NODE_ENV === 'production',
      maxAge: SESSION_TTL_SECONDS,
    },
  };
}
