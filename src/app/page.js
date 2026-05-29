"use client";

import { useState } from 'react';
import Header from '../components/Header';
import ProfileSection from '../components/ProfileSection';
import ManualSearchSection from '../components/ManualSearchSection';
import MonitoredGamesSection from '../components/MonitoredGamesSection';
import PriceChartModal from '../components/PriceChartModal';
import { useMonitoredGames } from '../hooks/useMonitoredGames';
import { ExternalLink, MessageCircle } from 'lucide-react';

export default function Home() {
  const { monitoredGames, addGame, removeGame, isMonitored } = useMonitoredGames();
  const [selectedGame, setSelectedGame] = useState(null);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-steam-accent selection:text-white">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-12">
        <ProfileSection
          onMonitor={addGame}
          isMonitored={isMonitored}
          onCardClick={setSelectedGame}
        />

        <ManualSearchSection
          onMonitor={addGame}
          isMonitored={isMonitored}
          onCardClick={setSelectedGame}
        />

        <MonitoredGamesSection
          monitoredGames={monitoredGames}
          onRemove={removeGame}
        />
      </main>

      <footer className="bg-steam-dark border-t border-steam-border py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-steam-muted text-sm">
            PriceLoot &copy; 2026 — Dados via IsThereAnyDeal & Steam API.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-steam-muted hover:text-white transition-colors">
              <ExternalLink className="w-6 h-6" />
            </a>
            <a href="#" className="text-steam-muted hover:text-white transition-colors">
              <MessageCircle className="w-6 h-6" />
            </a>
          </div>
        </div>
      </footer>

      {selectedGame && (
        <PriceChartModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </div>
  );
}
