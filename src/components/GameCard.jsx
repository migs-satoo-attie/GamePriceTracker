import { useState } from 'react';
import { Bell, Check, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const formatBRL = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const getBadgeColor = (percent) => {
  if (percent >= 60) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (percent >= 30) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  if (percent > 0)  return 'bg-secondary text-muted-foreground border-border';
  return 'hidden';
};

export default function GameCard({ game, isWishlist = false, onMonitor, onClick, isMonitored }) {
  const [targetPrice, setTargetPrice] = useState('');
  const [inputError, setInputError] = useState('');

  const handleMonitorClick = (e) => {
    e.stopPropagation();
    if (isMonitored) return;

    if (!isWishlist) {
      const parsed = parseFloat(targetPrice);
      if (isNaN(parsed) || parsed <= 0) {
        setInputError('Preço inválido');
        setTimeout(() => setInputError(''), 2500);
        return;
      }
      onMonitor(game, parsed);
    } else {
      onMonitor(game, null);
    }
  };

  const hasDiscount = game.discountPercent > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="group cursor-pointer h-full"
      onClick={() => onClick(game)}
    >
      <div className={cn(
        "flex flex-col h-full glass rounded-xl overflow-hidden transition-all duration-300",
        "hover:border-primary/50 hover:shadow-[0_8px_30px_rgba(26,159,255,0.15)]",
        isMonitored && "border-green-500/30"
      )}>
        {/* Cover Image */}
        <div className="relative aspect-[460/215] w-full overflow-hidden bg-secondary">
          <img
            src={game.coverImage || 'https://via.placeholder.com/460x215.png?text=Sem+Capa'}
            alt={game.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-90" />
          
          {hasDiscount && (
            <div className={cn(
              "absolute top-3 right-3 px-2.5 py-1 rounded-md text-xs font-bold border backdrop-blur-md flex items-center gap-1 shadow-lg",
              getBadgeColor(game.discountPercent)
            )}>
              <TrendingDown className="w-3 h-3" />
              {game.discountPercent}%
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow z-10 bg-card/40">
          <h4 className="text-foreground font-semibold leading-tight mb-4 line-clamp-2 group-hover:text-primary transition-colors">
            {game.name}
          </h4>

          <div className="mt-auto space-y-5">
            {/* Price Info */}
            <div className="flex justify-between items-end">
              <div className="text-xs text-muted-foreground">
                <p className="mb-1">Preço atual</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-bold text-primary leading-none tracking-tight">
                    {formatBRL(game.currentPrice)}
                  </p>
                  {hasDiscount && game.originalPrice && (
                    <p className="line-through text-muted-foreground text-xs opacity-70">
                      {formatBRL(game.originalPrice)}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                <p className="mb-1">Histórico</p>
                <p className="font-medium text-foreground">{formatBRL(game.historicalLow)}</p>
              </div>
            </div>

            {/* Target Price Input */}
            {!isWishlist && !isMonitored && (
              <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
                <label className="text-xs font-medium text-muted-foreground">Preço-alvo (R$)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Ex: 49.90"
                    value={targetPrice}
                    onChange={(e) => { setTargetPrice(e.target.value); setInputError(''); }}
                    className={cn(
                      "w-full bg-secondary/50 border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:border-transparent transition-all",
                      inputError ? "border-red-500/50 focus:ring-red-500/20" : "border-border focus:ring-primary/30"
                    )}
                  />
                  {inputError && (
                    <motion.span 
                      initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-400 font-medium"
                    >
                      {inputError}
                    </motion.span>
                  )}
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleMonitorClick}
              disabled={isMonitored}
              className={cn(
                "w-full h-10 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                isMonitored
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              )}
            >
              {isMonitored ? (
                <><Check className="w-4 h-4" /> Monitorando</>
              ) : (
                <><Bell className="w-4 h-4" /> Monitorar Alerta</>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
