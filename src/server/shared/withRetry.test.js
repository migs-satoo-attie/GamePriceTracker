import { withRetry } from './withRetry';

const noSleep = () => Promise.resolve();

describe('withRetry', () => {
  it('retorna o valor na primeira tentativa bem-sucedida', async () => {
    const fn = jest.fn(async () => 'ok');
    expect(await withRetry(fn, { retries: 2, sleep: noSleep })).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('tenta novamente após falha e retorna ao ter sucesso', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('falha 1'))
      .mockResolvedValueOnce('ok');
    expect(await withRetry(fn, { retries: 2, sleep: noSleep })).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('lança o último erro após esgotar as tentativas', async () => {
    const fn = jest.fn(async () => { throw new Error('sempre falha'); });
    await expect(withRetry(fn, { retries: 2, sleep: noSleep })).rejects.toThrow('sempre falha');
    expect(fn).toHaveBeenCalledTimes(3); // 1 + 2 retries
  });

  it('chama onRetry a cada nova tentativa', async () => {
    const onRetry = jest.fn();
    const fn = jest.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValueOnce('ok');
    await withRetry(fn, { retries: 2, sleep: noSleep, onRetry });
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
