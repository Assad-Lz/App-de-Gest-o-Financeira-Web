'use client';

import { useEffect, useRef, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    import('gsap').then(({ gsap }) => {
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current.children,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out' }
        );
      }
    });
  }, [session]);

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
      <div className="flex items-center justify-center h-full min-h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mr-3" />
        Sincronizando seu patrimônio...
      </div>
    );
  }

  return (
    <div ref={contentRef} className="max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 gs-reveal">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            Olá, <span className="text-gradient drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">{session?.user?.name?.split(' ')[0] || 'Investidor'}</span>!
          </h1>
          <p className="text-slate-500 font-medium">Aqui está o resumo estratégico do seu patrimônio atualizado.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/finances" className="px-6 py-3 rounded-2xl bg-slate-900/50 text-slate-300 font-semibold hover:bg-slate-800 transition-all border border-white/5 hover:border-white/10 backdrop-blur-md">
            Gerenciar Finanças
          </Link>
          <button className="px-6 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-emerald-500/20">
            Relatório IA
          </button>
        </div>
      </div>

      {/* Top Cards Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 gs-reveal">
        {[
          { title: "Saldo Líquido", value: balance, color: balance >= 0 ? 'emerald' : 'red', isUp: balance >= 0, icon: TrendingUp },
          { title: "Fluxo de Entrada", value: totalIncome, color: 'emerald', isUp: true, icon: ArrowUpRight },
          { title: "Fluxo de Saída", value: totalExpense, color: 'red', isUp: false, icon: ArrowDownRight },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-8 rounded-[2rem] relative overflow-hidden group border-white/5 hover:border-emerald-500/20 transition-all duration-500 border-glow">
            <div className="flex justify-between items-start mb-6">
              <p className="text-slate-500 text-xs font-black uppercase tracking-[0.1em]">{stat.title}</p>
              <div className={`p-2.5 rounded-xl ${stat.isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'} border border-current/10`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            
            <h3 className={`text-4xl font-black text-white tracking-tighter mb-4 flex items-baseline gap-1`}>
              <span className="text-xl font-medium text-slate-500">R$</span>
              {stat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>

            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${stat.isUp ? 'text-emerald-500/80' : 'text-red-500/80'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${stat.isUp ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
              {stat.isUp ? 'Saúde Financeira OK' : 'Alerta de Gastos'}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Flow & Pie Chart Area */}
        <div className="lg:col-span-2 space-y-8 flex flex-col gs-reveal">
          <div className="glass-panel rounded-[2rem] p-8 flex flex-col border-white/5 border-glow">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-white tracking-widest uppercase text-xs">Análise de Fluxo Mensal</h3>
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Entradas</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /> Saídas</div>
              </div>
            </div>
            <div className="h-72 w-full">
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
          </div>

          <div className="glass-panel rounded-[2rem] p-8 border-white/5 border-glow">
             <div className="flex items-center gap-3 mb-6">
               <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                 <PieIcon className="w-5 h-5" />
               </div>
               <h3 className="text-sm font-black text-white uppercase tracking-widest">Alocação de Gastos</h3>
             </div>
             <div className="h-56 w-full flex items-center justify-center">
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
          </div>
        </div>

        {/* Small Widgets column */}
        <div className="space-y-8 flex flex-col gs-reveal">
          
          {/* AI Advice Widget */}
          <div className="glass-panel rounded-[2rem] p-8 bg-gradient-to-br from-emerald-500/10 via-slate-950/40 to-slate-950/60 border-emerald-500/10 relative overflow-hidden flex-1 group cursor-pointer hover:border-emerald-500/30 transition-all duration-500">
            <div className="absolute -top-12 -right-12 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles className="w-48 h-48 text-emerald-400 rotate-12" />
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-emerald-500/20 w-fit">
                <Sparkles className="w-3 h-3" /> IA Expert
              </div>
              <h3 className="text-2xl font-black text-white tracking-tighter mb-4 group-hover:text-emerald-400 transition-colors">Insights do Dia</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed flex-1">
                {balance < 0 
                  ? "Detectamos um déficit no seu fluxo. Sugerimos revisar as categorias de lazer e focar em reduzir custos fixos para recuperar seu equilíbrio."
                  : balance === 0 
                    ? "Inicie o registro de dados para que nossa IA possa processar seu perfil financeiro e gerar metas personalizadas." 
                    : "Fluxo saudável detectado. Seu lucro marginal atual permite uma alocação de 15% em ativos de renda variável."}
              </p>
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Clique para ver mais</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>

          {/* Market Top Assets */}
          <div className="glass-panel rounded-[2rem] p-8 flex-1 border-white/5 border-glow">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-sm font-black text-white uppercase tracking-widest">Market Feed</h3>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 opacity-80">Live</span>
               </div>
             </div>
             <div className="space-y-4">
               {marketAssets.length === 0 ? (
                 <div className="py-10 text-center text-slate-600 font-bold uppercase text-[10px] tracking-widest">Aguardando dados...</div>
               ) : marketAssets.map((asset, i) => (
                 <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 border border-white/5">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-xs text-slate-400 border border-white/5">
                       {asset.symbol.substring(0, 2)}
                     </div>
                     <div>
                       <p className="font-black text-white text-sm tracking-tight">{asset.symbol}</p>
                       <p className="text-[10px] text-slate-500 font-bold uppercase">B3 S.A.</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="font-black text-white text-sm tracking-tighter mb-0.5">R$ {asset.price.toFixed(2)}</p>
                     <div className={`text-[10px] font-black px-2 py-0.5 rounded-md inline-block ${asset.changePerc > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                       {asset.changePerc > 0 ? '+' : ''}{(asset.changePerc || 0).toFixed(2)}%
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </div>

        </div>
      </div>

    </div>
  );
}
