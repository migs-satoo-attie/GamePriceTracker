/**
 * Next.js instrumentation — executa uma vez no startup do servidor.
 *
 * Usado para iniciar o agendador de sincronização de preços (node-cron) no
 * runtime Node. É opt-in: só agenda quando `ENABLE_PRICE_SYNC=true` (ver
 * docs/backend/jobs.md). Não afeta o front-end.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startPriceSyncScheduler } = await import(
      '@/server/infrastructure/jobs/startPriceSyncScheduler'
    );
    startPriceSyncScheduler();
  }
}
