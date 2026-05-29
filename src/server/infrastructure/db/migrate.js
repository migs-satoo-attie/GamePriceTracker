import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createLogger } from '../../shared/logger';

const logger = createLogger('migrate');

/**
 * Carrega migrations `.sql` de um diretório, ordenadas por nome de arquivo.
 *
 * @param {string} dir — caminho do diretório de migrations
 * @returns {Promise<Array<{ name: string, sql: string }>>}
 */
export async function loadMigrations(dir) {
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
  return Promise.all(
    files.map(async (name) => ({ name, sql: await readFile(join(dir, name), 'utf8') })),
  );
}

/**
 * Executa as migrations pendentes, em ordem, registrando-as em
 * `schema_migrations`. Cada migration roda em sua própria transação.
 *
 * @param {object} params
 * @param {{ query: (sql: string, params?: any[]) => Promise<{rows: any[]}> }} params.db
 * @param {Array<{ name: string, sql: string }>} params.migrations
 * @returns {Promise<string[]>} nomes das migrations aplicadas nesta execução
 */
export async function runMigrations({ db, migrations }) {
  await db.query(
    'CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())',
  );

  const { rows } = await db.query('SELECT name FROM schema_migrations');
  const already = new Set(rows.map((r) => r.name));

  const pending = [...migrations]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((m) => !already.has(m.name));

  const appliedNow = [];
  for (const migration of pending) {
    await db.query('BEGIN');
    try {
      await db.query(migration.sql);
      await db.query('INSERT INTO schema_migrations (name) VALUES ($1)', [migration.name]);
      await db.query('COMMIT');
      appliedNow.push(migration.name);
      logger.info('migration aplicada', { name: migration.name });
    } catch (err) {
      await db.query('ROLLBACK');
      logger.error('falha ao aplicar migration', { name: migration.name, error: err.message });
      throw err;
    }
  }

  return appliedNow;
}
