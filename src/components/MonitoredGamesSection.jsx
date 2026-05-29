import { Eye, Trash2, Flame, RadioReceiver } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const formatBRL = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function MonitoredGamesSection({ monitoredGames, onRemove }) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center">
            <Eye className="w-6 h-6 text-primary mr-3" />
            Jogos Monitorados
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">Controle de alertas ativos e preços configurados.</p>
        </div>
        <div className="mt-4 sm:mt-0 glass-panel border border-border text-foreground text-sm font-semibold px-4 py-2 rounded-lg inline-flex items-center gap-2 self-start">
          Total de Alertas
          <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-md">{monitoredGames.length}</span>
        </div>
      </div>
      
      <div className="glass rounded-2xl overflow-hidden border border-border shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-card text-muted-foreground text-xs uppercase tracking-wider font-semibold border-b border-border/50">
                <th className="px-6 py-4">Jogo</th>
                <th className="px-6 py-4">Preço Atual</th>
                <th className="px-6 py-4">Preço-Alvo</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              <AnimatePresence mode="popLayout">
                {monitoredGames.length === 0 ? (
                  <motion.tr 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="bg-transparent"
                  >
                    <td colSpan="5" className="px-6 py-16 text-center text-muted-foreground">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                          <Eye className="w-8 h-8 opacity-40 text-foreground" />
                        </div>
                        <p className="text-lg">Sua lista de monitoramento está vazia.</p>
                        <p className="text-sm mt-1 opacity-70">Use a Busca ou importe a Wishlist para adicionar alertas.</p>
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  monitoredGames.map((game, idx) => {
                    const isAlert = game.currentPrice <= game.targetPrice;
                    
                    return (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.05 } }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        key={`monitored-${game.id}`} 
                        className={cn(
                          "transition-colors group hover:bg-secondary/30",
                          isAlert && "bg-red-500/5 hover:bg-red-500/10"
                        )}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img src={game.coverImage} alt={game.name} className="w-20 h-10 object-cover rounded-md shadow-sm border border-white/5" />
                            <span className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{game.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-primary">{formatBRL(game.currentPrice)}</span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground font-medium">
                          {formatBRL(game.targetPrice)}
                        </td>
                        <td className="px-6 py-4">
                          {isAlert ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20 shadow-sm shadow-red-500/10">
                              <Flame className="w-3 h-3 mr-1.5" /> Atingido!
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              <RadioReceiver className="w-3 h-3 mr-1.5" /> Ativo
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => onRemove(game.id)}
                            className="text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-lg p-2 transition-all" 
                            title="Remover alerta"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
