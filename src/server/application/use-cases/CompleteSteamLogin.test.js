import { CompleteSteamLogin } from './CompleteSteamLogin';
import { InMemoryUserRepository } from '../../infrastructure/repositories/InMemoryUserRepository';
import { UserProfile } from '../../domain/value-objects/UserProfile';

const STEAM_ID = '76561197960287930';

function deps(overrides = {}) {
  return {
    openIdClient: { verify: jest.fn(async () => STEAM_ID) },
    sessionService: { issue: jest.fn(() => 'token-123') },
    userRepository: new InMemoryUserRepository(),
    fetchProfile: jest.fn(async () => ({ username: 'gaben', avatar: 'av' })),
    ...overrides,
  };
}

describe('CompleteSteamLogin (use-case)', () => {
  it('verifica a asserção, persiste o usuário e emite o token', async () => {
    const d = deps();
    const useCase = new CompleteSteamLogin(d);
    const params = { 'openid.mode': 'id_res' };

    const result = await useCase.execute(params);

    expect(d.openIdClient.verify).toHaveBeenCalledWith(params);
    expect(result.token).toBe('token-123');
    expect(result.steamId).toBe(STEAM_ID);
    expect(result.user).toBeInstanceOf(UserProfile);
    expect(result.user.username).toBe('gaben');
    expect(await d.userRepository.findBySteamId(STEAM_ID)).not.toBeNull();
  });

  it('tolera falha ao buscar o perfil (usa o steamId como username)', async () => {
    const d = deps({ fetchProfile: jest.fn(async () => { throw new Error('steam down'); }) });
    const useCase = new CompleteSteamLogin(d);

    const result = await useCase.execute({ 'openid.mode': 'id_res' });
    expect(result.user.username).toBe(STEAM_ID);
    expect(result.token).toBe('token-123');
  });

  it('funciona sem fetchProfile (modo sem chave Steam)', async () => {
    const d = deps({ fetchProfile: undefined });
    const useCase = new CompleteSteamLogin(d);
    const result = await useCase.execute({ 'openid.mode': 'id_res' });
    expect(result.user.username).toBe(STEAM_ID);
  });

  it('propaga falha de verificação da asserção (não emite token)', async () => {
    const d = deps({ openIdClient: { verify: jest.fn(async () => { throw new Error('asserção inválida'); }) } });
    const useCase = new CompleteSteamLogin(d);
    await expect(useCase.execute({})).rejects.toThrow('asserção inválida');
    expect(d.sessionService.issue).not.toHaveBeenCalled();
  });
});
