import { useState, useEffect } from 'react';
import GameCard from './GameCard';
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileSection({ onMonitor, isMonitored, onCardClick, profile }) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [profileResult, setProfileResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadAutomatedWishlist = async () => {
      try {
        // Simular pequeno atraso de rede para mostrar skeleton e dar "Premium feel"
        await new Promise(resolve => setTimeout(resolve, 600));

        // Usa o SteamID da sessão autenticada; fallback para demo quando ausente.
        const profileParam = encodeURIComponent(profile || 'authenticated_user_mock');
        const res = await fetch(`/api/wishlist?profile=${profileParam}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error ?? `Erro ${res.status}`);

        const date = new Date();
        const formattedDate = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        if (isMounted) {
          setProfileResult({
            username: data.user?.username || 'Usuário Premium',
            avatar: data.user?.avatar || 'https://avatars.githubusercontent.com/u/9919?s=200&v=4',
            steamId: data.user?.steamId || '123456789',
            wishlistCount: data.totalCount || 0,
            lastAnalysis: formattedDate,
            games: data.games || [],
            source: data.source || 'mock',
          });
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsAnalyzing(false);
      }
    };

    loadAutomatedWishlist();

    return () => { isMounted = false; };
  }, [profile]);

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Sua Wishlist</h2>
          <p className="text-muted-foreground">Sincronizada automaticamente da sua conta Steam conectada.</p>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-sm text-red-400 font-medium bg-red-500/10 p-4 rounded-xl border border-red-500/20"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>Não foi possível carregar a wishlist automaticamente: {error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skeletons ou Loading State visual premium */}
      {isAnalyzing && !profileResult && (
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
      )}

      {profileResult && !isAnalyzing && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="space-y-8"
        >
          <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-6 text-center sm:text-left">
              <div className="relative">
                <img
                  src={profileResult.avatar}
                  alt="Avatar"
                  className="w-20 h-20 rounded-xl border-2 border-primary/20 shadow-xl shadow-primary/10 object-cover"
                />
                <div className="absolute -bottom-2 -right-2 bg-background border border-border rounded-lg px-2 py-0.5 text-xs font-bold text-primary shadow-sm">
                  {profileResult.wishlistCount}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">{profileResult.username}</h3>
                <p className="text-muted-foreground mt-1 text-sm">Jogos sincronizados com sucesso</p>
                {profileResult.source === 'mock' && (
                  <span className="inline-block mt-2 text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-md font-medium">
                    Modo Demonstração Ativo
                  </span>
                )}
              </div>
            </div>
            <div className="text-xs text-muted-foreground/70 text-center sm:text-right hidden sm:block">
              <p>Última sincronização</p>
              <p className="font-medium text-muted-foreground text-lg">{profileResult.lastAnalysis}</p>
            </div>
          </div>

          <div>
            {profileResult.games.length > 0 ? (
              <motion.div 
                className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                  }
                }}
              >
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
              </motion.div>
            ) : (
              <div className="text-center py-16 glass rounded-2xl">
                <p className="text-muted-foreground text-lg">Nenhum jogo encontrado ou sua wishlist Steam é privada.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </section>
  );
}
