import { runMigrations } from './migrate';

/** db fake que simula o mínimo do protocolo pg para o runner. */
function fakeDb() {
  return {
    applied: [],
    executed: [],
    txn: [],
    async query(sql, params) {
      if (/CREATE TABLE IF NOT EXISTS schema_migrations/i.test(sql)) {
        this.executed.push('ensure-table');
        return { rows: [] };
      }
      if (/^SELECT name FROM schema_migrations/i.test(sql)) {
        return { rows: this.applied.map((name) => ({ name })) };
      }
      if (/^(BEGIN|COMMIT|ROLLBACK)$/i.test(sql)) {
        this.txn.push(sql.toUpperCase());
        return { rows: [] };
      }
      if (/^INSERT INTO schema_migrations/i.test(sql)) {
        this.applied.push(params[0]);
        return { rows: [] };
      }
      this.executed.push(sql);
      return { rows: [] };
    },
  };
}

describe('runMigrations', () => {
  it('aplica todas as migrations pendentes em ordem de nome', async () => {
    const db = fakeDb();
    const migrations = [
      { name: '002_b', sql: 'CREATE B' },
      { name: '001_a', sql: 'CREATE A' },
    ];

    const applied = await runMigrations({ db, migrations });

    expect(applied).toEqual(['001_a', '002_b']);
    expect(db.executed).toEqual(['ensure-table', 'CREATE A', 'CREATE B']);
    expect(db.applied).toEqual(['001_a', '002_b']);
  });

  it('pula migrations já aplicadas (idempotente)', async () => {
    const db = fakeDb();
    db.applied = ['001_a'];
    const migrations = [
      { name: '001_a', sql: 'CREATE A' },
      { name: '002_b', sql: 'CREATE B' },
    ];

    const applied = await runMigrations({ db, migrations });

    expect(applied).toEqual(['002_b']);
    expect(db.executed).toEqual(['ensure-table', 'CREATE B']);
  });

  it('não executa nada quando tudo já foi aplicado', async () => {
    const db = fakeDb();
    db.applied = ['001_a', '002_b'];
    const migrations = [
      { name: '001_a', sql: 'CREATE A' },
      { name: '002_b', sql: 'CREATE B' },
    ];

    const applied = await runMigrations({ db, migrations });
    expect(applied).toEqual([]);
  });

  it('envolve cada migration em transação (BEGIN/COMMIT)', async () => {
    const db = fakeDb();
    await runMigrations({ db, migrations: [{ name: '001_a', sql: 'CREATE A' }] });
    expect(db.txn).toEqual(['BEGIN', 'COMMIT']);
  });

  it('faz ROLLBACK e propaga erro quando uma migration falha', async () => {
    const db = fakeDb();
    const boom = new Error('sql inválido');
    db.query = jest.fn(async (sql, params) => {
      if (/CREATE TABLE IF NOT EXISTS schema_migrations/i.test(sql)) return { rows: [] };
      if (/^SELECT name FROM schema_migrations/i.test(sql)) return { rows: [] };
      if (/^(BEGIN|COMMIT|ROLLBACK)$/i.test(sql)) { db.txn.push(sql.toUpperCase()); return { rows: [] }; }
      if (/CREATE FAIL/.test(sql)) throw boom;
      return { rows: [] };
    });

    await expect(
      runMigrations({ db, migrations: [{ name: '001_x', sql: 'CREATE FAIL' }] }),
    ).rejects.toThrow('sql inválido');
    expect(db.txn).toContain('ROLLBACK');
  });
});
