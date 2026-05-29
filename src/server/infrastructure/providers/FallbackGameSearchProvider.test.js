import { FallbackGameSearchProvider } from './FallbackGameSearchProvider';

describe('FallbackGameSearchProvider', () => {
  it('usa o primeiro provider que não lança (mesmo com resultados vazios)', async () => {
    const first = { search: jest.fn().mockResolvedValue({ results: [], source: 'itad' }) };
    const second = { search: jest.fn() };
    const provider = new FallbackGameSearchProvider([first, second]);

    const result = await provider.search('x', 20);
    expect(result).toEqual({ results: [], source: 'itad' });
    expect(second.search).not.toHaveBeenCalled();
  });

  it('cai para o próximo quando o primeiro lança', async () => {
    const first = { search: jest.fn().mockRejectedValue(new Error('down')) };
    const second = { search: jest.fn().mockResolvedValue({ results: [{}], source: 'mock' }) };
    const provider = new FallbackGameSearchProvider([first, second]);

    const result = await provider.search('x', 20);
    expect(result.source).toBe('mock');
  });

  it('retorna vazio com source "empty" quando todos lançam', async () => {
    const first = { search: jest.fn().mockRejectedValue(new Error('a')) };
    const second = { search: jest.fn().mockRejectedValue(new Error('b')) };
    const provider = new FallbackGameSearchProvider([first, second]);

    expect(await provider.search('x', 20)).toEqual({ results: [], source: 'empty' });
  });
});
