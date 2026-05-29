import pg from 'pg';

/**
 * Pool de conexões Postgres (singleton por processo).
 *
 * Mantido fino de propósito: a lógica de repositório vive nos repositórios, que
 * recebem este pool injetado como `db` (interface `query(sql, params)`).
 */
let pool;

/**
 * @param {string} [connectionString] — default: process.env.DATABASE_URL
 * @returns {import('pg').Pool}
 */
export function getPool(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) {
    throw new Error('DATABASE_URL não configurada');
  }
  if (!pool) {
    pool = new pg.Pool({ connectionString });
  }
  return pool;
}

/** Encerra o pool (uso em testes/shutdown). */
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
