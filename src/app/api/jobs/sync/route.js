/**
 * POST /api/jobs/sync
 *
 * Dispara manualmente a sincronização de preços (atualiza catálogo, grava
 * snapshots e dispara alertas). Útil para acionamento sob demanda ou via
 * cron externo, complementando o agendador interno (node-cron).
 *
 * Proteção: se `CRON_SECRET` estiver definido, exige o header `x-cron-secret`.
 *
 * Resposta:
 *   { synced, alerts, failures, skipped, triggered: PriceAlert[] }
 */
import { buildSyncPrices } from '@/server/infrastructure/composition/sync';
import { createLogger } from '@/server/shared/logger';

const logger = createLogger('api/jobs/sync');

export async function POST(request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('x-cron-secret') !== secret) {
    return Response.json({ error: 'não autorizado' }, { status: 401 });
  }

  try {
    const sync = buildSyncPrices();
    const summary = await sync.execute();
    return Response.json({
      ...summary,
      triggered: summary.triggered.map((alert) => alert.toJSON()),
    });
  } catch (err) {
    logger.error('falha na sincronização manual', { error: err.message });
    return Response.json({ error: err.message }, { status: 500 });
  }
}
