import { InMemoryGameRepository } from './InMemoryGameRepository';
import { Game } from '../../domain/entities/Game';
import { Money } from '../../domain/value-objects/Money';

function game(id, currentReais = 50) {
  return new Game({
    id,
    name: `Game ${id}`,
    coverImage: 'c',
    originalPrice: Money.fromReais(100),
    currentPrice: Money.fromReais(currentReais),
  });
}

describe('InMemoryGameRepository', () => {
  it('upsert + findById devolve o Game', async () => {
    const repo = new InMemoryGameRepository();
    await repo.upsert(game('1'));
    const found = await repo.findById('1');
    expect(found).toBeInstanceOf(Game);
    expect(found.id).toBe('1');
  });

  it('upsert atualiza o jogo existente', async () => {
    const repo = new InMemoryGameRepository();
    await repo.upsert(game('1', 50));
    await repo.upsert(game('1', 30));
    expect((await repo.findById('1')).currentPrice.toReais()).toBe(30);
  });

  it('findAll devolve todos', async () => {
    const repo = new InMemoryGameRepository();
    await repo.upsert(game('1'));
    await repo.upsert(game('2'));
    expect(await repo.findAll()).toHaveLength(2);
  });

  it('findById devolve null quando não existe', async () => {
    expect(await new InMemoryGameRepository().findById('x')).toBeNull();
  });

  it('aceita seed inicial no construtor', async () => {
    const repo = new InMemoryGameRepository([game('1'), game('2')]);
    expect(await repo.findAll()).toHaveLength(2);
  });
});
