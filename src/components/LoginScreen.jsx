import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, ArrowRight, ShieldCheck, Zap, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

export default function LoginScreen({ onLogin }) {
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginClick = () => {
    setIsLoading(true);
    // Simulate auth delay for UX
    setTimeout(() => {
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center"
      >
        {/* Left Side: Hero Copy */}
        <div className="space-y-8 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>A nova era do rastreamento</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
              Nunca mais pague <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
                o preço cheio.
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Monitore preços, sincronize sua Wishlist e receba alertas automáticos quando os jogos que você deseja atingirem a mínima histórica.
            </p>
          </motion.div>

          {/* Feature List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="grid sm:grid-cols-2 gap-6 pt-4 max-w-2xl mx-auto lg:mx-0 text-left"
          >
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Tracking em Tempo Real</h3>
                <p className="text-sm text-muted-foreground mt-1">Sincronizado diretamente com os dados oficiais.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Privacidade Garantida</h3>
                <p className="text-sm text-muted-foreground mt-1">Apenas leitura da sua wishlist pública.</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="glass rounded-2xl p-8 relative overflow-hidden group">
            {/* Glossy top highlight */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <div className="text-center mb-10">
              <div className="relative w-28 h-28 mx-auto mb-8 flex items-center justify-center">
                {/* Anel Externo Giratório */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-primary/20 border-t-primary border-l-primary shadow-[0_0_20px_rgba(26,159,255,0.3)]"
                />
                {/* Anel Interno Pulsante e Invertido */}
                <motion.div 
                  animate={{ rotate: -360, scale: [0.95, 1.05, 0.95] }}
                  transition={{ rotate: { repeat: Infinity, duration: 8, ease: "linear" }, scale: { repeat: Infinity, duration: 4, ease: "easeInOut" } }}
                  className="absolute inset-3 rounded-full border border-cyan-400/30 border-b-cyan-400 border-r-cyan-400"
                />
                {/* Fundo Glow */}
                <motion.div 
                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute inset-4 rounded-full bg-primary/20 blur-xl"
                />
                
                {/* Container Principal do Ícone Levintando */}
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/30 relative z-10 border border-white/20"
                >
                  <Gamepad2 className="w-8 h-8 text-white" strokeWidth={1.5} />
                </motion.div>
                
                {/* Partículas Orbitando */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                  className="absolute inset-0 z-20 pointer-events-none"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9] absolute top-1 right-3" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_#1a9fff] absolute bottom-2 left-4" />
                </motion.div>
              </div>

              <h2 className="text-2xl font-semibold text-white mb-2">Acesse sua Conta</h2>
              <p className="text-muted-foreground text-sm">
                Entre com a Steam para sincronizar seus dados
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleLoginClick}
                disabled={isLoading}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className={cn(
                  "w-full h-12 rounded-xl flex items-center justify-center gap-3 font-medium transition-all duration-300 relative overflow-hidden",
                  "bg-[#171a21] hover:bg-[#1a1f29] border border-white/10 text-white",
                  isLoading && "opacity-80 cursor-not-allowed"
                )}
              >
                {/* Simulated Steam Logo */}
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                  <path d="M11.979 0C5.366 0 0 5.363 0 11.975c0 4.79 2.802 8.914 6.945 10.871l3.197-9.308c-.287-.582-.44-1.229-.44-1.91 0-2.39 1.939-4.326 4.328-4.326 2.39 0 4.328 1.936 4.328 4.326 0 2.39-1.938 4.326-4.328 4.326-.788 0-1.528-.215-2.155-.589l-2.738 7.971C10.057 23.82 10.999 24 11.979 24 18.604 24 24 18.627 24 12S18.604 0 11.979 0zM14.03 12.012c0-1.127-.916-2.043-2.043-2.043-1.127 0-2.043.916-2.043 2.043 0 1.127.916 2.043 2.043 2.043 1.127 0 2.043-.916 2.043-2.043zm1.611 0c0 2.019-1.638 3.654-3.654 3.654-2.019 0-3.654-1.635-3.654-3.654 0-2.019 1.635-3.654 3.654-3.654 2.016 0 3.654 1.635 3.654 3.654z" />
                </svg>
                {isLoading ? "Conectando..." : "Sign in with Steam"}
                
                <motion.div
                  animate={{ x: isHovering && !isLoading ? 5 : 0, opacity: isHovering && !isLoading ? 1 : 0 }}
                  className="absolute right-4"
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-4 text-xs text-muted-foreground">Novo por aqui?</span>
                </div>
              </div>

              <a
                href="https://store.steampowered.com/join/"
                target="_blank"
                rel="noreferrer"
                className="w-full h-12 rounded-xl flex items-center justify-center font-medium transition-colors border border-border hover:bg-white/5 text-muted-foreground hover:text-white"
              >
                Criar conta gratuita na Steam
              </a>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-8">
              Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
