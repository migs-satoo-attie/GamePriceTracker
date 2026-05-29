import { useState, useEffect, useRef } from 'react';
import GameCard from './GameCard';
import { Search, Ghost, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export default function ManualSearchSection({ onMonitor, isMonitored, onCardClick }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  const searchTimeout = useRef(null);
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
        if (err.name === 'AbortError') return;
        setError(err.message);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(searchTimeout.current);
  }, [query]);

  return (
    <section className="space-y-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-3">Busca Universal</h2>
        <p className="text-muted-foreground text-lg">Encontre qualquer jogo na Steam e crie alertas de preço customizados</p>
      </div>

      <div className="relative max-w-3xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          <Search className="w-6 h-6 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder="Ex: Cyberpunk 2077, Elden Ring..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={cn(
            "w-full glass border-border rounded-full pl-16 pr-16 py-5 text-lg text-foreground shadow-2xl focus:outline-none transition-all",
            "focus:border-primary/50 focus:shadow-[0_0_40px_rgba(26,159,255,0.15)] bg-card/60"
          )}
        />
        <AnimatePresence>
          {isSearching && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-y-0 right-0 pr-6 flex items-center"
            >
              <span className="flex h-5 w-5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-primary"></span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {hasSearched && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
          <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            Resultados para <span className="text-primary">"{query}"</span>
          </h3>

          {isSearching ? (
             <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
               {[...Array(4)].map((_, i) => (
                 <div key={i} className="glass rounded-xl overflow-hidden aspect-[3/4] animate-pulse">
                   <div className="w-full aspect-[460/215] bg-secondary" />
                   <div className="p-5 space-y-4">
                     <div className="h-6 bg-secondary rounded w-3/4" />
                     <div className="h-10 bg-secondary rounded w-full mt-auto" />
                     <div className="h-10 bg-secondary rounded w-full" />
                   </div>
                 </div>
               ))}
             </div>
          ) : error ? (
            <div className="text-center py-16 glass rounded-2xl border-red-500/20">
              <WifiOff className="w-12 h-12 text-red-400 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">Houve um problema na busca.</p>
              <p className="text-sm text-red-400 mt-2 bg-red-500/10 inline-block px-3 py-1 rounded-full">{error}</p>
            </div>
          ) : results.length > 0 ? (
            <motion.div 
              className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6"
              initial="hidden" animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
            >
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
            </motion.div>
          ) : (
            <div className="text-center py-16 glass rounded-2xl">
              <Ghost className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Nenhum título bate com sua pesquisa.</p>
            </div>
          )}
        </motion.div>
      )}
    </section>
  );
}
