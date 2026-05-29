import { useState, useEffect, useRef } from 'react';
import GameCard from './GameCard';
import { Search, Ghost, WifiOff } from 'lucide-react';

export default function ManualSearchSection({ onMonitor, isMonitored, onCardClick }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  const searchTimeout = useRef(null);
  // Cancela fetch anterior quando o usuário digita novamente
  const abortController = useRef(null);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    const trimmedQuery = query.trim();

    if (trimmedQuery.length === 0) {
      setResults([]);
      setHasSearched(false);
      setIsSearching(false);
      setError(null);
      return;
    }

    if (trimmedQuery.length < 2) return;

    setIsSearching(true);
    setHasSearched(true);
    setError(null);

    searchTimeout.current = setTimeout(async () => {
      if (abortController.current) abortController.current.abort();
      abortController.current = new AbortController();

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmedQuery)}`,
          { signal: abortController.current.signal }
        );

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Erro ${res.status}`);
        }

        const data = await res.json();
        setResults(data.results ?? []);
      } catch (err) {
        if (err.name === 'AbortError') return; // busca cancelada, ignora
        setError(err.message);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(searchTimeout.current);
  }, [query]);

  return (
    <section className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Busca Manual</h2>
        <p className="text-steam-muted">Encontre qualquer jogo para monitorar o preço</p>
      </div>

      <div className="relative max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-steam-muted" />
        </div>
        <input
          type="text"
          placeholder="Buscar qualquer jogo da Steam..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-steam-card border border-steam-border rounded-full pl-12 pr-12 py-4 text-lg text-white shadow-lg focus:outline-none focus:border-steam-accent focus:ring-2 focus:ring-steam-accent/50 transition-all"
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <span className="loader w-6 h-6" />
          </div>
        )}
      </div>

      {hasSearched && !isSearching && (
        <div className="animate-fade-in">
          <h3 className="text-lg font-medium text-white mb-4 border-b border-steam-border pb-2">
            Resultados da Busca
          </h3>

          {error ? (
            <div className="text-center py-12 animate-fade-in">
              <WifiOff className="w-12 h-12 text-steam-muted mx-auto mb-4" />
              <p className="text-steam-muted text-lg">Erro ao buscar jogos.</p>
              <p className="text-sm text-red-400 mt-1">{error}</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {results.map(game => (
                <GameCard
                  key={`search-${game.id}`}
                  game={game}
                  isWishlist={false}
                  onMonitor={onMonitor}
                  onClick={onCardClick}
                  isMonitored={isMonitored(game.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 animate-fade-in">
              <Ghost className="w-12 h-12 text-steam-muted mx-auto mb-4" />
              <p className="text-steam-muted text-lg">Nenhum jogo encontrado.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
