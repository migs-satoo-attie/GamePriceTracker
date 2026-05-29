import { useState } from 'react';
import { Bell, Check } from 'lucide-react';

const formatBRL = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const getBadgeColor = (percent) => {
  if (percent >= 60) return 'bg-[#4c6b22] text-[#a4d007]';
  if (percent >= 30) return 'bg-[#826b1c] text-[#f1c40f]';
  if (percent > 0)  return 'bg-steam-border text-white';
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
        setInputError('Informe um preço-alvo válido (ex.: 49.90)');
        setTimeout(() => setInputError(''), 2500);
        return;
      }
      onMonitor(game, parsed);
    } else {
      onMonitor(game, null); // wishlist usa 80% do preço atual (definido no hook)
    }
  };

  const hasDiscount = game.discountPercent > 0;

  return (
    <div
      className="game-card bg-steam-card rounded shadow-md overflow-hidden border border-steam-border hover:border-steam-hover transition-colors flex flex-col h-full animate-fade-in group cursor-pointer"
      onClick={() => onClick(game)}
    >
      {/* Capa */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={game.coverImage || 'https://via.placeholder.com/460x215.png?text=Sem+Capa'}
          alt={game.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {hasDiscount && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold shadow ${getBadgeColor(game.discountPercent)}`}>
            -{game.discountPercent}%
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col flex-grow">
        <h4 className="text-white font-semibold leading-tight mb-3 line-clamp-2 group-hover:text-steam-accent transition-colors">
          {game.name}
        </h4>

        <div className="mt-auto space-y-3">
          {/* Preços */}
          <div className="flex justify-between items-end">
            <div className="text-xs text-steam-muted">
              <p>Preço atual</p>
              <p className="text-lg font-bold text-steam-accent leading-none">
                {formatBRL(game.currentPrice)}
              </p>
              {hasDiscount && game.originalPrice && (
                <p className="line-through text-steam-muted text-xs">
                  {formatBRL(game.originalPrice)}
                </p>
              )}
            </div>
            <div className="text-xs text-steam-muted text-right">
              <p>Mínimo histórico</p>
              <p className="font-medium text-white">{formatBRL(game.historicalLow)}</p>
            </div>
          </div>

          {/* Campo de preço-alvo (só na busca manual) */}
          {!isWishlist && (
            <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
              <label className="text-xs text-steam-muted">Alertar quando atingir (R$):</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Ex.: 49.90"
                value={targetPrice}
                onChange={(e) => { setTargetPrice(e.target.value); setInputError(''); }}
                className={`bg-steam-dark border rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-steam-accent w-full transition-colors ${
                  inputError ? 'border-red-500' : 'border-steam-border'
                }`}
              />
              {inputError && (
                <p className="text-xs text-red-400 animate-fade-in">{inputError}</p>
              )}
            </div>
          )}

          {/* Botão monitorar */}
          <button
            onClick={handleMonitorClick}
            disabled={isMonitored}
            className={`w-full py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              isMonitored
                ? 'bg-green-700 cursor-not-allowed text-white'
                : 'bg-[#2c3e50] hover:bg-steam-accent text-white'
            }`}
          >
            {isMonitored ? (
              <><Check className="w-4 h-4" /> Monitorando</>
            ) : (
              <><Bell className="w-4 h-4" /> Monitorar</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
