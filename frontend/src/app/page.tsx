'use client';

import { useRef, useEffect, useState } from 'react';
import { Mail, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';
import { GlobeThree } from '../components/ui/Globe';
import gsap from 'gsap';
import Image from 'next/image';

export default function Home() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Importando dinamicamente p/ não quebrar SSR no Next.js App Router
    import('gsap').then(({ gsap }) => {
      const tl = gsap.timeline();
      
      tl.fromTo('.hero-title', 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      )
      .fromTo('.hero-subtitle',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
        "-=0.6"
      )
      .fromTo(formRef.current,
        { opacity: 0, scale: 0.95, backdropFilter: 'blur(0px)' },
        { opacity: 1, scale: 1, backdropFilter: 'blur(24px)', duration: 0.8, ease: 'back.out(1.2)' },
        "-=0.4"
      );
    });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = '/dashboard';
    }, 1500);
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center min-h-screen w-full px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Camada 3D do Background HighTech */}
      <GlobeThree />

      <div className="z-10 text-center mb-10 w-full max-w-2xl relative">
        <div className="hero-title flex flex-col items-center justify-center pointer-events-none">
          {/* Logo Injectada */}
          <div className="mb-6 bg-slate-900/40 p-4 rounded-2xl glass-panel relative group overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"/>
             <Image src="/logo.png" alt="FinEasy Logo" width={120} height={120} className="relative z-10 drop-shadow-2xl" priority />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-yellow-300 to-emerald-300 drop-shadow-lg">
            FinEasy
          </h1>
        </div>
        
        <p className="hero-subtitle text-lg md:text-xl text-slate-300 max-w-xl mx-auto font-medium">
          Gerencie seu capital, acompanhe ações High-Tech e seja guiado pela nossa Inteligência Artificial generativa.
        </p>
      </div>

      <div ref={formRef} className="z-10 w-full max-w-md">
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group shadow-emerald-900/20">
          
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <form onSubmit={handleLogin} className="relative z-20 space-y-6">
            <div className="space-y-4">
              <div className="relative group/input">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within/input:text-emerald-400 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu melhor e-mail" 
                  autoComplete="email"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm outline-none placeholder:text-slate-500 text-slate-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center px-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/25 hover:shadow-emerald-500/40 hover:scale-[1.02] focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Conectando FinEasy...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Acessar Plataforma <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-700/50 pt-6 relative z-20">
            <div className="flex items-center justify-center gap-4">
              <button type="button" className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 transition-colors text-sm font-medium gap-2 text-slate-200">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                Google Entrar
              </button>
            </div>
          </div>
          
        </div>
        
        <p className="mt-8 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 z-10 relative bg-background/50 py-1 px-3 rounded-full mx-auto w-max backdrop-blur-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> Proteção FinEasy e criptografia ponta a ponta
        </p>
      </div>
    </div>
  );
}
