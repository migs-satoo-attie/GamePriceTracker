/**
 * Logger estruturado mínimo (sem dependências externas).
 *
 * Emite uma linha JSON por evento — formato amigável para agregadores de logs
 * (Datadog, Loki, CloudWatch). O nível mínimo vem de `LOG_LEVEL` (default 'info').
 * O `sink` é injetável para testes.
 */

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

/**
 * @param {string} scope — nome do módulo/contexto (ex.: 'GetGameHistory')
 * @param {object} [options]
 * @param {keyof typeof LEVELS} [options.level] — nível mínimo (default: LOG_LEVEL ou 'info')
 * @param {(line: string) => void} [options.sink] — destino da saída (default: console)
 * @returns {{ debug: Function, info: Function, warn: Function, error: Function }}
 */
export function createLogger(scope, options = {}) {
  const configured = options.level ?? process.env.LOG_LEVEL ?? 'info';
  const minLevel = configured === 'silent' ? Infinity : (LEVELS[configured] ?? LEVELS.info);
  const sink = options.sink ?? ((line) => process.stdout.write(line + '\n'));

  const emit = (level, msg, meta) => {
    if (LEVELS[level] < minLevel) return;
    const entry = {
      level,
      scope,
      msg,
      timestamp: new Date().toISOString(),
      ...(meta && typeof meta === 'object' ? meta : {}),
    };
    sink(JSON.stringify(entry));
  };

  return {
    debug: (msg, meta) => emit('debug', msg, meta),
    info: (msg, meta) => emit('info', msg, meta),
    warn: (msg, meta) => emit('warn', msg, meta),
    error: (msg, meta) => emit('error', msg, meta),
  };
}
