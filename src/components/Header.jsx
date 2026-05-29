import { Tags, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export default function Header({ isLogged, onLogout }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-14 h-14">
            {/* Animated Gradient Background Loop */}
            <motion.div
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary via-indigo-500 to-cyan-400 opacity-90 blur-md bg-[length:200%_200%]"
            />
            {/* Icon Container centralizado e clean */}
            <div className="relative z-10 w-12 h-12 rounded-2xl bg-gradient-to-br from-background to-secondary/90 border border-white/10 flex items-center justify-center shadow-xl">
              <Tags className="text-primary w-6 h-6" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-lg">
            GamePrice<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Tracker</span>
          </h1>
        </div>

        {isLogged && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white leading-none">Usuário Conectado</p>
                <p className="text-xs text-muted-foreground mt-1">Conta Premium</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden">
                <img src="https://avatars.githubusercontent.com/u/9919?s=200&v=4" alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
            
            <button 
              onClick={onLogout}
              className="p-2 rounded-md text-muted-foreground hover:text-white hover:bg-secondary transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </div>
    </header>
  );
}
