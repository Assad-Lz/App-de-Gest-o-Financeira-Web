'use client';

import { motion } from 'framer-motion';
import { LayoutDashboard, Wallet, LineChart, MessageSquarePlus, LogOut, Settings, Landmark } from 'lucide-react';
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

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-emerald-500/30">
      {/* Sidebar Overlay (Glassmorphism) */}
      <motion.aside 
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-72 h-full flex flex-col border-r border-white/5 bg-slate-950/20 backdrop-blur-3xl z-20 shrink-0"
      >
        <div className="p-8 flex items-center gap-4 border-b border-white/5">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-2xl shadow-emerald-500/10 p-1.5 border border-white/10">
            <Image src="/logo.png" alt="FinEasy" width={40} height={40} className="object-contain" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-white tracking-tight leading-none text-xl">FinEasy</h2>
            <span className="text-[10px] text-emerald-500 font-black tracking-[0.2em] uppercase mt-1 opacity-80">Plataforma</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-10 space-y-1 overflow-y-auto">
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
                    <span className="font-semibold text-sm relative z-10">{item.label}</span>
                    
                    {isActive && (
                      <motion.div 
                        layoutId="active-dot"
                        className="absolute right-4 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"
                      />
                    )}
                 </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/40">
          <Link href="/">
            <button className="flex w-full items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair da Sessão</span>
            </button>
          </Link>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto relative scroll-smooth scrollbar-hide">
        {/* Subtle top glare */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 h-full p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
