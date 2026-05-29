import { GetCurrentUser } from './GetCurrentUser';
import { InMemoryUserRepository } from '../../infrastructure/repositories/InMemoryUserRepository';

const STEAM_ID = '76561197960287930';

describe('GetCurrentUser (use-case)', () => {
  let userRepository;
  beforeEach(async () => {
    userRepository = new InMemoryUserRepository();
    await userRepository.upsert({ steamId: STEAM_ID, username: 'gaben', avatar: 'av' });
  });

  it('retorna o usuário para um token válido', async () => {
    const sessionService = { verify: jest.fn(() => ({ steamId: STEAM_ID })) };
    const useCase = new GetCurrentUser({ sessionService, userRepository });

    const user = await useCase.execute('token-ok');
    expect(user.username).toBe('gaben');
  });

  it('retorna null quando não há token', async () => {
    const sessionService = { verify: jest.fn() };
    const useCase = new GetCurrentUser({ sessionService, userRepository });
    expect(await useCase.execute(null)).toBeNull();
    expect(sessionService.verify).not.toHaveBeenCalled();
  });

  it('retorna null para token inválido/expirado (sem lançar)', async () => {
    const sessionService = { verify: jest.fn(() => { throw new Error('expirado'); }) };
    const useCase = new GetCurrentUser({ sessionService, userRepository });
    expect(await useCase.execute('token-ruim')).toBeNull();
  });

  it('retorna null quando o usuário do token não existe mais', async () => {
    const sessionService = { verify: jest.fn(() => ({ steamId: '00000000000000000' })) };
    const useCase = new GetCurrentUser({ sessionService, userRepository });
    expect(await useCase.execute('token-ok')).toBeNull();
  });
});
