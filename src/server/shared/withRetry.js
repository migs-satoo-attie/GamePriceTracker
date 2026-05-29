const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Executa uma função assíncrona com novas tentativas em caso de falha
 * (tolerância a falhas transitórias de APIs externas). Backoff linear simples.
 *
 * @template T
 * @param {() => Promise<T>} fn
 * @param {object} [options]
 * @param {number} [options.retries] — nº de retentativas (default 2)
 * @param {number} [options.delayMs] — atraso base entre tentativas (default 0)
 * @param {(attempt: number, error: Error) => void} [options.onRetry]
 * @param {(ms: number) => Promise<void>} [options.sleep] — injetável p/ testes
 * @returns {Promise<T>}
 */
export async function withRetry(fn, { retries = 2, delayMs = 0, onRetry, sleep = defaultSleep } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        onRetry?.(attempt + 1, err);
        if (delayMs > 0) await sleep(delayMs * (attempt + 1));
      }
    }
  }
  throw lastError;
}
