#!/usr/bin/env node
/**
 * CLI de migrations (Postgres, SQL puro, sem ORM).
 *
 * Aplica os arquivos `.sql` de `src/server/infrastructure/db/migrations` em ordem
 * de nome, de forma idempotente e transacional, registrando-os em
 * `schema_migrations`.
 *
 * Uso:  DATABASE_URL=postgres://... node scripts/migrate.mjs
 *       npm run db:migrate
 *
 * Nota: a lógica de idempotência/ordenação é a mesma de
 * `src/server/infrastructure/db/migrate.js` (coberta por testes). Este wrapper é
 * standalone (ESM nativo) por o projeto não usar `"type":"module"`.
 */
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const MIGRATIONS_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'server',
  'infrastructure',
  'db',
  'migrations',
);

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL não configurada.');
    process.exit(1);
  }

  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort();
  const client = new pg.Client({ connectionString });
  await client.connect();

  try {
    await client.query(
      'CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())',
    );
    const { rows } = await client.query('SELECT name FROM schema_migrations');
    const already = new Set(rows.map((r) => r.name));

    let count = 0;
    for (const name of files) {
      if (already.has(name)) continue;
      const sql = await readFile(join(MIGRATIONS_DIR, name), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
        await client.query('COMMIT');
        console.log(`✓ aplicada: ${name}`);
        count += 1;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`✗ falha em ${name}: ${err.message}`);
        throw err;
      }
    }
    console.log(count === 0 ? 'Nada a aplicar (schema atualizado).' : `${count} migration(s) aplicada(s).`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
