import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { X, Loader2, LineChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function getLast12MonthLabels() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now);
    d.setMonth(now.getMonth() - (11 - i));
    return MONTH_LABELS[d.getMonth()];
  });
}

const formatBRL = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function PriceChartModal({ game, onClose }) {
  const [history, setHistory] = useState(
    Array.isArray(game?.priceHistory) && game.priceHistory.length > 0
      ? game.priceHistory
      : []
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!game) return;
    setIsLoading(true);

    fetch(`/api/history/${game.id}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.history) && data.history.length > 0) {
          setHistory(data.history);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [game]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!game) return null;

  const minPrice = history.length > 0 ? Math.min(...history) : 0;
  const maxPrice = history.length > 0 ? Math.max(...history) : 0;
  const midPrice = (minPrice + maxPrice) / 2;

  const chartData = {
    labels: getLast12MonthLabels(),
    datasets: [
      {
        label: 'Preço (R$)',
        data: history,
        segment: {
          borderColor: ctx => {
            if (!ctx.p1) return 'hsl(var(--primary))';
            return ctx.p1.parsed.y > midPrice ? '#ef4444' : '#10b981'; // Vermelho se caro, Verde se barato
          }
        },
        backgroundColor: 'rgba(26, 159, 255, 0.05)',
        borderWidth: 3,
        pointBackgroundColor: history.map(val => val > midPrice ? '#ef4444' : '#10b981'),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const CHART_OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#38bdf8',
        bodyFont: { size: 14, weight: 'bold' },
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => formatBRL(ctx.raw),
        },
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.1)', borderDash: [5, 5] },
        ticks: { color: '#f8fafc', font: { size: 13, weight: 'bold' }, callback: (v) => 'R$ ' + v },
        border: { display: false }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#cbd5e1', font: { size: 13, weight: 'bold' } },
        border: { display: false }
      },
    },
    interaction: { intersect: false, mode: 'index' },
  };

  return (
    <>
      {/* Dark Overlay sutil apenas para foco */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Bottom Panel */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.3)] max-h-[85vh] flex flex-col rounded-t-3xl"
      >
        <div className="max-w-6xl mx-auto w-full p-6 lg:p-8 flex-grow flex flex-col relative">
          
          {/* Header do Panel com Jogo em Super Destaque */}
          <div className="flex flex-col sm:flex-row justify-between items-start mb-8 bg-secondary/30 p-6 rounded-2xl border border-primary/20 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 w-full">
              <img 
                src={game.coverImage} 
                alt={game.name} 
                className="w-full sm:w-48 aspect-[460/215] object-cover rounded-xl shadow-[0_0_20px_rgba(26,159,255,0.2)] border border-primary/30" 
              />
              <div className="text-center sm:text-left mt-2 sm:mt-0">
                <h3 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-primary drop-shadow-md">
                  {game.name}
                </h3>
                <p className="text-sm sm:text-base text-primary/80 mt-2 font-semibold bg-primary/10 inline-block px-4 py-1.5 rounded-lg border border-primary/20">
                  Análise de Preço — Últimos 12 meses
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-white bg-background/80 hover:bg-red-500/20 hover:text-red-400 rounded-full p-2.5 transition-all border border-border hover:border-red-500/30 shadow-sm z-20"
              title="Fechar Gráfico"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Área do Gráfico */}
          <div className="flex-grow min-h-[350px] relative glass-panel rounded-2xl p-6 border border-border">
            {isLoading && history.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-10 w-10 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-10 w-10 bg-primary"></span>
                </span>
              </div>
            ) : history.length > 0 ? (
              <Line data={chartData} options={CHART_OPTIONS} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                <LineChart className="w-12 h-12 opacity-20 mb-4" />
                <p>Nenhum dado histórico registrado para este título.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
