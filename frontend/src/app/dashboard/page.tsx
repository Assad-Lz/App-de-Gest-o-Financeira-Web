'use client';

import { useEffect, useRef, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Sparkles, TrendingUp, PieChart as PieIcon, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const COLORS = ['#10b981', '#eab308', '#3b82f6', '#f43f5e'];

export default function DashboardHome() {
  const { data: session } = useSession();
  const contentRef = useRef<HTMLDivElement>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [marketAssets, setMarketAssets] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) return;
      try {
        const userId = (session.user as any).email;
        const [txRes, marketRes] = await Promise.all([
          axios.get(`${API_URL}/transactions/${userId}`),
          axios.get(`${API_URL}/market/assets/top?limit=3`)
        ]);
        setTransactions(txRes.data);
        setMarketAssets(marketRes.data);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        // Fallback: se der erro, exibe vazio ao invés de tela eterna de loading
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Proteção de Loading infinito (timeout de 8 segundos máximo)
    const fallbackTimer = setTimeout(() => {
      setLoading(false);
    }, 8000);

    return () => clearTimeout(fallbackTimer);
  }, [session]);

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((a, t) => a + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((a, t) => a + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Gerar dados para o gráfico de pizza baseado em categorias reais
  const categoryTotals = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc: any, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = Object.keys(categoryTotals).map(cat => ({
    name: cat,
    value: categoryTotals[cat]
  })).slice(0, 4);

  // Dados para o gráfico de fluxo (mockados por meses anteriores, mas realçando o mês atual)
  const cashflowData = [
    { month: 'Jan', income: 0, expense: 0 },
    { month: 'Fev', income: 0, expense: 0 },
    { month: 'Mar', income: totalIncome, expense: totalExpense },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-slate-400">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin" />
        </div>
        <p className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-emerald-500 animate-pulse">Sincronizando Patrimônio...</p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-6 lg:space-y-8"
    >
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tighter mb-2">
            Olá, <span className="text-gradient drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">{session?.user?.name?.split(' ')[0] || 'Investidor'}</span>!
          </h1>
          <p className="text-slate-500 font-medium text-sm lg:text-base">Aqui está o resumo estratégico do seu patrimônio atualizado.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 lg:gap-4 w-full lg:w-auto">
          <Link href="/dashboard/finances" className="w-full sm:w-auto text-center px-6 py-3.5 lg:py-3 rounded-[1.25rem] bg-slate-900/50 text-slate-300 font-semibold hover:bg-slate-800 transition-all border border-white/5 hover:border-white/10 backdrop-blur-md">
            Gerenciar Finanças
          </Link>
          <Link href="/dashboard/ai" className="w-full sm:w-auto text-center px-6 py-3.5 lg:py-3 rounded-[1.25rem] bg-emerald-500 text-slate-950 font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-emerald-500/20">
            Relatório IA
          </Link>
        </div>
      </motion.div>

      {/* Top Cards Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-8">
        {[
          { title: "Saldo Líquido", value: balance, color: balance >= 0 ? 'emerald' : 'red', isUp: balance >= 0, icon: TrendingUp },
          { title: "Fluxo de Entrada", value: totalIncome, color: 'emerald', isUp: true, icon: ArrowUpRight },
          { title: "Fluxo de Saída", value: totalExpense, color: 'red', isUp: false, icon: ArrowDownRight },
        ].map((stat, i) => (
          <motion.div 
            whileHover={{ y: -5, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            key={i} 
            data-is-up={stat.isUp}
            className="glass-panel p-6 lg:p-8 rounded-[2rem] relative overflow-hidden group border-white/5 hover:border-emerald-500/20 duration-500 border-glow flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex justify-between items-start mb-4 lg:mb-6">
              <p className="text-slate-500 text-[10px] lg:text-xs font-black uppercase tracking-[0.1em]">{stat.title}</p>
              <div className={`p-2 lg:p-2.5 rounded-xl ${stat.isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'} border border-current/10`}>
                <stat.icon className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>
            </div>
            
            <h3 className={`text-3xl lg:text-4xl xl:text-5xl font-black text-white tracking-tighter mb-2 lg:mb-4 flex items-baseline gap-1 truncate`}>
              <span className="text-lg lg:text-xl font-medium text-slate-500 mr-1">R$</span>
              {stat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>

            <div className={`flex items-center gap-2 text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${stat.isUp ? 'text-emerald-500/80' : 'text-red-500/80'}`}>
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${stat.isUp ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
              <span className="truncate">{stat.isUp ? 'Saúde Financeira OK' : 'Alerta de Gastos'}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Flow & Pie Chart Area */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6 flex flex-col">
          <motion.div 
            whileHover={{ scale: 1.005 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="glass-panel rounded-[2rem] p-5 lg:p-8 flex flex-col border-white/5 border-glow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
              <h3 className="text-lg lg:text-xl font-black text-white tracking-widest uppercase text-xs">Análise de Fluxo Mensal</h3>
              <div className="flex items-center gap-3 lg:gap-4 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Entradas</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /> Saídas</div>
              </div>
            </div>
            <div className="h-60 lg:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashflowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#334155" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} dy={10} />
                  <YAxis stroke="#334155" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} tickFormatter={(val) => `R$${val}`} />
                  <CartesianGrid strokeDasharray="4 4" stroke="#ffffff05" vertical={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '1.25rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  />
                  <Area type="monotone" dataKey="income" name="Entrada" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expense" name="Saída" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="glass-panel rounded-[2rem] p-5 lg:p-8 border-white/5 border-glow"
          >
             <div className="flex items-center gap-3 mb-6">
               <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                 <PieIcon className="w-5 h-5" />
               </div>
               <h3 className="text-xs lg:text-sm font-black text-white uppercase tracking-widest">Alocação de Gastos</h3>
             </div>
             <div className="h-48 lg:h-56 w-full flex items-center justify-center">
                 {pieData.length === 0 ? (
                   <div className="text-center">
                     <p className="text-slate-600 text-sm font-semibold mb-1">Dados não coletados</p>
                     <p className="text-slate-700 text-[10px] uppercase tracking-tighter">Sincronize suas transações</p>
                   </div>
                 ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={8}
                        dataKey="value"
                        cornerRadius={6}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem' }}/>
                      <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ paddingLeft: '20px', fontSize: '12px', fontWeight: 600, color: '#94a3b8' }} />
                    </PieChart>
                  </ResponsiveContainer>
                 )}
             </div>
          </motion.div>
        </motion.div>

        {/* Small Widgets column */}
        <motion.div variants={itemVariants} className="space-y-6 flex flex-col">
          
          {/* AI Advice Widget */}
          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            className="glass-panel rounded-[2rem] p-6 lg:p-8 bg-gradient-to-br from-emerald-500/10 via-slate-950/40 to-slate-950/60 border-emerald-500/10 relative overflow-hidden flex-1 group cursor-pointer hover:border-emerald-500/30 transition-all duration-500 min-h-[250px] lg:min-h-0"
          >
            <div className="absolute -top-12 -right-12 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles className="w-40 h-40 lg:w-48 lg:h-48 text-emerald-400 rotate-12" />
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] mb-4 lg:mb-6 border border-emerald-500/20 w-fit">
                <Sparkles className="w-2.5 h-2.5 lg:w-3 lg:h-3" /> IA Expert
              </div>
              <h3 className="text-xl lg:text-2xl font-black text-white tracking-tighter mb-3 lg:mb-4 group-hover:text-emerald-400 transition-colors">Insights do Dia</h3>
              <p className="text-slate-400 text-xs lg:text-sm font-medium leading-relaxed flex-1">
                {balance < 0 
                  ? "Detectamos um déficit no seu fluxo. Sugerimos revisar as categorias de lazer e focar em reduzir custos fixos para recuperar seu equilíbrio."
                  : balance === 0 
                    ? "Inicie o registro de dados para que nossa IA possa processar seu perfil financeiro e gerar metas personalizadas." 
                    : "Fluxo saudável detectado. Seu lucro marginal atual permite uma alocação de 15% em ativos de renda variável."}
              </p>
              <div className="mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-500">Clique para ver mais</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </motion.div>

          {/* Market Top Assets */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="glass-panel rounded-[2rem] p-6 lg:p-8 flex-1 border-white/5 border-glow"
          >
             <div className="flex items-center justify-between mb-6 lg:mb-8">
               <h3 className="text-xs lg:text-sm font-black text-white uppercase tracking-widest">Market Feed</h3>
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-emerald-500 opacity-80">Live</span>
               </div>
             </div>
             <div className="space-y-3 lg:space-y-4">
               {marketAssets.length === 0 ? (
                 <div className="py-10 text-center text-slate-600 font-bold uppercase text-[10px] tracking-widest">Aguardando dados...</div>
               ) : marketAssets.map((asset, i) => (
                 <div key={i} className="flex items-center justify-between p-3 lg:p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 border border-white/5">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-[10px] lg:text-xs text-slate-400 border border-white/5 flex-shrink-0">
                       {asset.symbol.substring(0, 2)}
                     </div>
                     <div className="overflow-hidden">
                       <p className="font-black text-white text-xs lg:text-sm tracking-tight truncate">{asset.symbol}</p>
                       <p className="text-[9px] lg:text-[10px] text-slate-500 font-bold uppercase truncate">B3 S.A.</p>
                     </div>
                   </div>
                   <div className="text-right flex-shrink-0 ml-2">
                     <p className="font-black text-white text-xs lg:text-sm tracking-tighter mb-0.5">R$ {asset.price.toFixed(2)}</p>
                     <div className={`text-[9px] lg:text-[10px] font-black px-1.5 lg:px-2 py-0.5 rounded-md inline-block ${asset.changePerc > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                       {asset.changePerc > 0 ? '+' : ''}{(asset.changePerc || 0).toFixed(2)}%
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </motion.div>

        </motion.div>
      </div>

    </motion.div>
  );
}
