import { createLogger } from './logger';

describe('createLogger', () => {
  let output;
  const sink = (line) => output.push(line);

  beforeEach(() => {
    output = [];
  });

  it('emite JSON estruturado com level, scope, msg e timestamp', () => {
    const log = createLogger('Test', { level: 'debug', sink });
    log.info('olá', { foo: 'bar' });

    expect(output).toHaveLength(1);
    const entry = JSON.parse(output[0]);
    expect(entry).toMatchObject({ level: 'info', scope: 'Test', msg: 'olá', foo: 'bar' });
    expect(typeof entry.timestamp).toBe('string');
  });

  it('respeita o nível mínimo configurado (filtra abaixo)', () => {
    const log = createLogger('Test', { level: 'warn', sink });
    log.debug('escondido');
    log.info('escondido');
    log.warn('aparece');
    log.error('aparece');

    const levels = output.map((l) => JSON.parse(l).level);
    expect(levels).toEqual(['warn', 'error']);
  });

  it('não quebra quando meta é omitido', () => {
    const log = createLogger('Test', { level: 'info', sink });
    expect(() => log.info('sem meta')).not.toThrow();
    expect(JSON.parse(output[0]).msg).toBe('sem meta');
  });
});
