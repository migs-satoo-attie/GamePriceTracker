'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'gpt_monitored_games';

/**
 * Hook para gerenciar a lista de jogos monitorados com persistência em localStorage.
 *
 * Retorna:
 *   monitoredGames  — array de jogos monitorados (com targetPrice)
 *   addGame(game, targetPrice) — adiciona jogo; targetPrice=null usa 80% do preço atual
 *   removeGame(id)  — remove pelo id
 *   isMonitored(id) — retorna true/false
 *   isLoaded        — true após hidratação do localStorage (evita flash de estado vazio no SSR)
 */
export function useMonitoredGames() {
  const [monitoredGames, setMonitoredGames] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hidratação: carrega do localStorage apenas no client após montagem
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setMonitoredGames(parsed);
      }
    } catch {
      // localStorage indisponível ou JSON inválido — ignora e começa com lista vazia
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Persiste sempre que a lista muda (após carregamento inicial)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(monitoredGames));
    } catch {
      // Falha silenciosa (ex.: storage cheio ou modo privado restritivo)
    }
  }, [monitoredGames, isLoaded]);

  const addGame = useCallback((game, targetPrice = null) => {
    setMonitoredGames(prev => {
      if (prev.some(m => m.id === game.id)) return prev; // idempotente
      const target = targetPrice !== null && targetPrice > 0
        ? targetPrice
        : Math.round(game.currentPrice * 0.8 * 100) / 100;
      return [...prev, { ...game, targetPrice: target }];
    });
  }, []);

  const removeGame = useCallback((id) => {
    setMonitoredGames(prev => prev.filter(g => g.id !== id));
  }, []);

  const isMonitored = useCallback((id) => {
    return monitoredGames.some(m => m.id === id);
  }, [monitoredGames]);

  return { monitoredGames, addGame, removeGame, isMonitored, isLoaded };
}
