import { Eye, Trash2, Flame, RadioReceiver } from 'lucide-react';

const formatBRL = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function MonitoredGamesSection({ monitoredGames, onRemove }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-steam-border pb-2">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Eye className="w-5 h-5 text-steam-accent mr-2" />
          Jogos Monitorados
        </h2>
        <span className="bg-steam-card text-white text-xs font-bold px-2 py-1 rounded">
          {monitoredGames.length}
        </span>
      </div>
      
      <div className="bg-steam-dark rounded-lg border border-steam-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-steam-card text-steam-muted text-sm uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Jogo</th>
                <th className="px-4 py-3 font-medium">Preço Atual</th>
                <th className="px-4 py-3 font-medium">Preço-Alvo</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steam-border">
              {monitoredGames.length === 0 ? (
                <tr className="bg-steam-dark">
                  <td colSpan="5" className="px-4 py-12 text-center text-steam-muted">
                    <div className="flex flex-col items-center">
                      <svg className="w-8 h-8 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                      <p>Você ainda não está monitorando nenhum jogo.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                monitoredGames.map(game => {
                  const isAlert = game.currentPrice <= game.targetPrice;
                  
                  return (
                    <tr 
                      key={`monitored-${game.id}`} 
                      className={`border-b border-steam-border hover:bg-steam-cardhover transition-colors ${isAlert ? 'highlight-alert' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <img src={game.coverImage} alt={game.name} className="w-16 h-8 object-cover rounded mr-3 shadow-sm" />
                          <span className="font-medium text-white line-clamp-1">{game.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-steam-text">{formatBRL(game.currentPrice)}</td>
                      <td className="px-4 py-3 text-steam-muted">{formatBRL(game.targetPrice)}</td>
                      <td className="px-4 py-3">
                        {isAlert ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-400 border border-red-800">
                            <Flame className="w-3 h-3 mr-1" /> Preço Atingido!
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-steam-hover border border-blue-800/50">
                            <RadioReceiver className="w-3 h-3 mr-1" /> Monitorando
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => onRemove(game.id)}
                          className="text-steam-border hover:text-red-500 transition-colors p-2" 
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
