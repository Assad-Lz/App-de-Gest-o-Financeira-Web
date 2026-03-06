'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Wallet, LineChart, MessageSquarePlus, LogOut, Settings, Landmark, Menu, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Painel Geral', href: '/dashboard' },
  { icon: Wallet, label: 'Despesas e Receitas', href: '/dashboard/finances' },
  { icon: LineChart, label: 'Mercado de Ações', href: '/dashboard/market' },
  { icon: Landmark, label: 'Simulador de Investimentos', href: '/dashboard/investments' },
  { icon: MessageSquarePlus, label: 'Chat IA Consultoria', href: '/dashboard/ai' },
  { icon: Settings, label: 'Configurações', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close sidebar on path change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle scroll for mobile header shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-8 flex items-center gap-4 border-b border-white/5">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-white flex items-center justify-center shadow-2xl shadow-emerald-500/10 p-1.5 border border-white/10">
          <Image src="/logo.png" alt="FinEasy" width={40} height={40} className="object-contain" />
        </div>
        <div className="flex flex-col">
          <h2 className="font-bold text-white tracking-tight leading-none text-lg lg:text-xl">FinEasy</h2>
          <span className="text-[10px] text-emerald-500 font-black tracking-[0.2em] uppercase mt-1 opacity-80">Plataforma</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 lg:py-10 space-y-1 overflow-y-auto custom-scrollbar">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
               <div className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-500 ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-200'}`}>
                  {isActive && (
                    <motion.div 
                      layoutId="active-nav-indicator"
                      className="absolute inset-0 rounded-2xl bg-white/[0.03] border border-white/10 shadow-inner"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className={`p-2 rounded-lg transition-colors duration-500 ${isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-transparent group-hover:bg-white/5 text-slate-500 group-hover:text-slate-300'}`}>
                    <Icon className="w-5 h-5 relative z-10" />
                  </div>
                  <span className="font-semibold text-sm relative z-10 flex-1">{item.label}</span>
                  
                  {isActive ? (
                    <motion.div 
                      layoutId="active-dot"
                      className="absolute right-4 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"
                    />
                  ) : (
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300" />
                  )}
               </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 bg-slate-950/40">
        <Link href="/">
          <button className="flex w-full items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 group">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm uppercase tracking-widest text-[11px]">Sair da Sessão</span>
          </button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background overflow-x-hidden selection:bg-emerald-500/30">
      {/* Mobile Header */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 h-16 z-[40] flex items-center justify-between px-6 transition-all duration-300 ${scrolled ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/5 shadow-2xl' : 'bg-transparent'}`}>
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="FinEasy" width={32} height={32} className="object-contain" />
          <span className="font-bold text-white tracking-tighter text-lg italic">FinEasy</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-white active:scale-95 transition-all"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 h-screen sticky top-0 border-r border-white/5 bg-slate-950/20 backdrop-blur-3xl z-20 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[45]"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-slate-950 z-[50] border-r border-white/10 shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className={`flex-1 min-h-screen relative flex flex-col pt-16 lg:pt-0 pb-20 lg:pb-0 transition-all duration-500 ${isMobileMenuOpen ? 'blur-sm lg:blur-none opacity-50 lg:opacity-100' : ''}`}>
        {/* Subtle top glare */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-emerald-500/5 pointer-events-none" />
        
        <div className="relative z-10 p-6 md:p-8 lg:p-12 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
