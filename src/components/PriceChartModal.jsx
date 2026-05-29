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
import { X, Loader2 } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/** Gera os rótulos dos últimos 12 meses em ordem cronológica */
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

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#171a21',
      titleColor: '#c7d5e0',
      bodyColor: '#1a9fff',
      borderColor: '#3c4d5c',
      borderWidth: 1,
      callbacks: {
        label: (ctx) => formatBRL(ctx.raw),
      },
    },
  },
  scales: {
    y: {
      grid: { color: '#3c4d5c', borderDash: [5, 5] },
      ticks: {
        color: '#8f98a0',
        callback: (v) => 'R$ ' + v,
      },
    },
    x: {
      grid: { display: false },
      ticks: { color: '#8f98a0' },
    },
  },
  interaction: { intersect: false, mode: 'index' },
};

export default function PriceChartModal({ game, onClose }) {
  const [history, setHistory] = useState(
    Array.isArray(game?.priceHistory) && game.priceHistory.length > 0
      ? game.priceHistory
      : []
  );
  const [isLoading, setIsLoading] = useState(false);

  // Busca o histórico atualizado via API (o priceHistory do game serve como fallback imediato)
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
      .catch(() => { /* mantém o fallback já setado */ })
      .finally(() => setIsLoading(false));
  }, [game]);

  // ESC fecha e trava scroll do body
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!game) return null;

  const chartData = {
    labels: getLast12MonthLabels(),
    datasets: [
      {
        label: 'Preço (R$)',
        data: history,
        borderColor: '#1a9fff',
        backgroundColor: 'rgba(26, 159, 255, 0.15)',
        borderWidth: 2,
        pointBackgroundColor: '#1b2838',
        pointBorderColor: '#1a9fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-overlay animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-steam-dark w-full max-w-3xl rounded-lg shadow-2xl border border-steam-border mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-steam-border">
          <div>
            <h3 className="text-xl font-bold text-white">{game.name}</h3>
            <p className="text-sm text-steam-muted mt-0.5">Histórico de preços — últimos 12 meses</p>
          </div>
          <button
            onClick={onClose}
            className="text-steam-muted hover:text-white transition-colors focus:outline-none ml-4"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="relative h-[300px] w-full">
            {isLoading && history.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-steam-accent animate-spin" />
              </div>
            ) : history.length > 0 ? (
              <Line data={chartData} options={CHART_OPTIONS} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-steam-muted text-sm">
                Histórico indisponível para este jogo.
              </div>
            )}
          </div>
          <p className="text-xs text-steam-muted text-center mt-4">
            * Valores em BRL (R$). Dados via IsThereAnyDeal.
          </p>
        </div>
      </div>
    </div>
  );
}
