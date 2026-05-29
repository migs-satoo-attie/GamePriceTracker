"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import LoginScreen from '../components/LoginScreen';
import ProfileSection from '../components/ProfileSection';
import ManualSearchSection from '../components/ManualSearchSection';
import MonitoredGamesSection from '../components/MonitoredGamesSection';
import PriceChartModal from '../components/PriceChartModal';
import { useMonitoredGames } from '../hooks/useMonitoredGames';
import { ExternalLink, MessageCircle } from 'lucide-react';

export default function Home() {
  const { monitoredGames, addGame, removeGame, isMonitored } = useMonitoredGames();
  const [selectedGame, setSelectedGame] = useState(null);
  
  // Simulated Auth State
  const [isLogged, setIsLogged] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/30 selection:text-primary">
      <Header isLogged={isLogged} onLogout={() => setIsLogged(false)} />

      <main className="flex-grow w-full">
        <AnimatePresence mode="wait">
          {!isLogged ? (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <LoginScreen onLogin={() => setIsLogged(true)} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12"
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-muted-foreground text-sm">
            GamePriceTracker &copy; 2026 — Interface Premium Redesign.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-muted-foreground hover:text-white transition-colors">
              <ExternalLink className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-white transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {selectedGame && (
          <PriceChartModal
            game={selectedGame}
            onClose={() => setSelectedGame(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
