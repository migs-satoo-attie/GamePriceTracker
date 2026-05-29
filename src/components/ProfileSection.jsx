import { useState } from 'react';
import GameCard from './GameCard';
import { Loader2, AlertCircle } from 'lucide-react';

/** Valida minimamente o input antes de enviar para a API */
function validateProfileInput(input) {
  const trimmed = input.trim();
  if (!trimmed) return 'Cole a URL do perfil ou SteamID64.';
  if (trimmed.startsWith('http') && !trimmed.includes('steamcommunity.com')) {
    return 'URL inválida. Use um link steamcommunity.com ou um SteamID64.';
  }
  if (/^\d+$/.test(trimmed) && trimmed.length !== 17) {
    return 'SteamID64 deve ter exatamente 17 dígitos.';
  }
  return null;
}

export default function ProfileSection({ onMonitor, isMonitored, onCardClick }) {
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [profileResult, setProfileResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    const validationError = validateProfileInput(inputValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsAnalyzing(true);
    setProfileResult(null);
    setError(null);

    try {
      const res = await fetch(
        `/api/wishlist?profile=${encodeURIComponent(inputValue.trim())}`
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? `Erro ${res.status}`);

      const date = new Date();
      const formattedDate =
        date.toLocaleDateString('pt-BR') +
        ' ' +
        date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      setProfileResult({
        username: data.user.username,
        avatar: data.user.avatar,
        steamId: data.user.steamId,
        wishlistCount: data.totalCount,
        lastAnalysis: formattedDate,
        games: data.games,
        source: data.source,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="bg-steam-card rounded-lg p-6 border border-steam-border shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-steam-muted fill-current" viewBox="0 0 24 24">
            <path d="M11.979 0C5.366 0 0 5.363 0 11.975c0 4.79 2.802 8.914 6.945 10.871l3.197-9.308c-.287-.582-.44-1.229-.44-1.91 0-2.39 1.939-4.326 4.328-4.326 2.39 0 4.328 1.936 4.328 4.326 0 2.39-1.938 4.326-4.328 4.326-.788 0-1.528-.215-2.155-.589l-2.738 7.971C10.057 23.82 10.999 24 11.979 24 18.604 24 24 18.627 24 12S18.604 0 11.979 0zM14.03 12.012c0-1.127-.916-2.043-2.043-2.043-1.127 0-2.043.916-2.043 2.043 0 1.127.916 2.043 2.043 2.043 1.127 0 2.043-.916 2.043-2.043zm1.611 0c0 2.019-1.638 3.654-3.654 3.654-2.019 0-3.654-1.635-3.654-3.654 0-2.019 1.635-3.654 3.654-3.654 2.016 0 3.654 1.635 3.654 3.654z" />
          </svg>
          Analisar Perfil Steam
        </h2>

        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Cole a URL do perfil ou SteamID64..."
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); setError(null); }}
            onKeyDown={(e) => e.key === 'Enter' && !isAnalyzing && handleAnalyze()}
            className={`flex-grow bg-steam-dark border rounded-md px-4 py-2 text-white focus:outline-none focus:border-steam-accent focus:ring-1 focus:ring-steam-accent transition-colors ${
              error ? 'border-red-500' : 'border-steam-border'
            }`}
          />
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="bg-steam-accent hover:bg-steam-hover text-white font-medium py-2 px-6 rounded-md transition-colors flex items-center justify-center min-w-[160px] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>Analisar Wishlist</span>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-400 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <p className="mt-3 text-xs text-steam-muted">
          Exemplos:{' '}
          <code className="text-steam-hover">76561198000000000</code>
          {' '}|{' '}
          <code className="text-steam-hover">https://steamcommunity.com/id/username/</code>
          {' '}— A wishlist precisa ser pública.
        </p>
      </div>

      {profileResult && (
        <div className="animate-fade-in">
          <div className="bg-steam-dark rounded-lg p-6 border border-steam-border flex flex-col sm:flex-row items-center gap-6">
            <img
              src={profileResult.avatar}
              alt="Avatar"
              className="w-24 h-24 rounded-md border-2 border-steam-card"
            />
            <div className="text-center sm:text-left flex-grow">
              <h3 className="text-2xl font-bold text-white">{profileResult.username}</h3>
              <p className="text-steam-muted mt-1">{profileResult.wishlistCount} jogos na wishlist</p>
              {profileResult.source === 'mock' && (
                <span className="inline-block mt-2 text-xs bg-yellow-900/40 text-yellow-400 border border-yellow-800/50 px-2 py-0.5 rounded">
                  Modo demo — configure STEAM_API_KEY para dados reais
                </span>
              )}
            </div>
            <div className="text-sm text-steam-muted text-center sm:text-right">
              <p>Última análise:</p>
              <p className="font-medium text-white">{profileResult.lastAnalysis}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium text-white mb-4 border-b border-steam-border pb-2">
              Jogos da Wishlist
            </h3>
            {profileResult.games.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {profileResult.games.map(game => (
                  <GameCard
                    key={`wishlist-${game.id}`}
                    game={game}
                    isWishlist={true}
                    onMonitor={onMonitor}
                    onClick={onCardClick}
                    isMonitored={isMonitored(game.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-steam-muted text-center py-8">Nenhum jogo encontrado na wishlist.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
