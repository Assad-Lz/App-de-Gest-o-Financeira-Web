'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Wallet, LineChart, MessageSquarePlus, LogOut, Settings, Landmark, Menu, X, ChevronRight, Moon, Sun, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useSession, signOut } from 'next-auth/react';

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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();

  useEffect(() => setMounted(true), []);

  // Fecha o painel de perfil ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfilePanel(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    if (distance < -50 && touchStart < 60 && !isMobileMenuOpen) setIsMobileMenuOpen(true);
    if (distance > 50 && isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  };

  const userImage = session?.user?.image;
  const userName = session?.user?.name;
  const userEmail = session?.user?.email;
  const initials = getInitials(userName);

  // Avatar reutilizável
  const AvatarButton = ({ size = 'md' }: { size?: 'sm' | 'md' }) => {
    const s = size === 'sm'
      ? { outer: 'w-8 h-8', text: 'text-xs' }
      : { outer: 'w-10 h-10', text: 'text-sm' };
    return (
      <button
        onClick={() => setShowProfilePanel(v => !v)}
        className={`${s.outer} rounded-full p-0.5 bg-gradient-to-tr from-emerald-500 to-emerald-300 shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer flex-shrink-0`}
        title={userName || 'Perfil'}
      >
        <div className="w-full h-full rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
          {userImage ? (
            <img src={userImage} alt={userName || 'Avatar'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span className={`font-black text-slate-700 dark:text-slate-200 ${s.text}`}>{initials}</span>
          )}
        </div>
      </button>
    );
  };

  // Dropdown de perfil
  const ProfilePanel = () => (
    <AnimatePresence>
      {showProfilePanel && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.18 }}
          className="absolute right-0 top-14 w-72 z-50 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900"
        >
          {/* Info do usuário */}
          <div className="p-5 flex items-center gap-4 border-b border-slate-100 dark:border-white/5">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 border-2 border-emerald-500/30 flex-shrink-0">
              {userImage ? (
                <img src={userImage} alt={userName || 'Avatar'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
                  <User className="w-7 h-7 text-emerald-500" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-slate-900 dark:text-white text-sm leading-tight truncate">{userName || 'Usuário'}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 truncate">{userEmail || ''}</p>
              <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-wider">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Ativo
              </span>
            </div>
          </div>
          {/* Ações */}
          <div className="p-3 space-y-1">
            <Link href="/dashboard/settings" onClick={() => setShowProfilePanel(false)}>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200 transition-all text-sm font-semibold">
                <Settings className="w-4 h-4" />
                Configurações
              </div>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-bold"
            >
              <LogOut className="w-4 h-4" />
              Sair da Conta
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-8 flex items-center gap-4 border-b border-slate-200 dark:border-white/5">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-white flex items-center justify-center shadow-2xl shadow-emerald-500/10 p-1.5 border border-slate-200 dark:border-white/10">
          <Image src="/logo.png" alt="FinEasy" width={40} height={40} className="object-contain" />
        </div>
        <div className="flex flex-col">
          <h2 className="font-bold text-slate-900 dark:text-white tracking-tight leading-none text-lg lg:text-xl">FinEasy</h2>
          <span className="text-[10px] text-emerald-500 font-black tracking-[0.2em] uppercase mt-1 opacity-80">Plataforma</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 lg:py-10 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
              }`}>
                {isActive && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className="absolute inset-0 rounded-2xl bg-emerald-50 dark:bg-white/[0.03] border border-emerald-200 dark:border-white/10 shadow-inner"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`p-2 rounded-lg transition-colors duration-300 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-transparent group-hover:bg-slate-100 dark:group-hover:bg-white/5 text-slate-500'
                }`}>
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

      <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-[11px] uppercase tracking-widest">Sair da Sessão</span>
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="flex h-[100dvh] w-full bg-background overflow-hidden selection:bg-emerald-500/30"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mobile Header */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 h-16 z-[40] flex items-center justify-between px-6 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 shadow-md'
          : 'bg-white/80 dark:bg-slate-950/70 backdrop-blur-lg border-b border-slate-200/60 dark:border-transparent'
      }`}>
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="FinEasy" width={32} height={32} className="object-contain" />
          <span className="font-bold text-slate-900 dark:text-white tracking-tighter text-lg italic">FinEasy</span>
        </div>
        <div className="flex items-center gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-emerald-500 active:scale-95 transition-all"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}
          <AvatarButton size="sm" />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white active:scale-95 transition-all"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 h-screen border-r border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950/20 backdrop-blur-3xl z-20 shrink-0 shadow-sm dark:shadow-none">
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
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.05}
              onDragEnd={(_, { offset, velocity }) => {
                if (offset.x < -50 || velocity.x < -500) setIsMobileMenuOpen(false);
              }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-white dark:bg-slate-950 z-[50] border-r border-slate-200 dark:border-white/10 shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-10 py-5 bg-white/80 dark:bg-background/50 backdrop-blur-3xl border-b border-slate-200 dark:border-white/5 z-30 shrink-0 shadow-sm relative">
          <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent pointer-events-none" />
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
              Bem Vindo <span className="text-emerald-400">De Volta</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase font-bold tracking-widest">Painel FinEasy 4.1</p>
          </div>

          <div className="flex items-center gap-4">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-900/50 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all duration-300"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-emerald-400 transition-colors" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                )}
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-emerald-400 transition-colors">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>
            )}

            {/* Avatar + Dropdown de Perfil */}
            <div ref={profileRef} className="relative">
              <AvatarButton />
              <ProfilePanel />
            </div>
          </div>
        </header>

        {/* Scrollable Main */}
        <main className={`flex-1 h-full overflow-y-auto overflow-x-hidden relative pt-16 lg:pt-0 pb-20 lg:pb-0 transition-all duration-500 ${isMobileMenuOpen ? 'blur-sm lg:blur-none opacity-50 lg:opacity-100' : ''}`}>
          <div className="absolute top-0 left-0 right-0 h-64 bg-emerald-500/5 pointer-events-none" />
          <div className="relative z-10 p-6 md:p-8 lg:p-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
