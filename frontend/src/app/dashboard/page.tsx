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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 gs-reveal">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
            Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-400">{session?.user?.name?.split(' ')[0] || 'Investidor'}</span>!
          </h1>
          <p className="text-slate-400">Aqui está o resumo do seu patrimônio atualizado no FinEasy.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/finances" className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors border border-slate-700">
            Gerenciar Finanças
          </Link>
          <button className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:opacity-90 transition-opacity shadow-lg shadow-emerald-600/20">
            Relatório PDF
          </button>
        </div>
      </div>

      {/* Top Cards Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 gs-reveal">
        {[
          { title: "Saldo Atual", value: balance, color: balance >= 0 ? 'emerald' : 'red', isUp: balance >= 0 },
          { title: "Receitas Totais", value: totalIncome, color: 'emerald', isUp: true },
          { title: "Despesas Totais", value: totalExpense, color: 'red', isUp: false },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl relative overflow-hidden group border-emerald-900/10">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${stat.isUp ? 'text-emerald-500' : 'text-red-500'}`}>
              <TrendingUp className="w-16 h-16" />
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">{stat.title}</p>
            <h3 className={`text-3xl font-bold text-slate-100 mb-4`}>
              R$ {stat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${stat.isUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {stat.isUp ? 'Patrimônio em dia' : 'Cuidado com os gastos'}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Flow & Pie Chart Area */}
        <div className="lg:col-span-2 space-y-6 flex flex-col gs-reveal">
          <div className="glass-panel rounded-2xl p-6 flex flex-col border-emerald-900/10">
            <h3 className="text-lg font-bold text-slate-200 mb-6">Fluxo de Caixa (Março)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashflowData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f1f5f9' }}
                    itemStyle={{ fontSize: '0.875rem' }}
                  />
                  <Area type="monotone" dataKey="income" name="Receita" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expense" name="Despesa" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border-emerald-900/10">
             <div className="flex items-center gap-2 mb-4">
               <PieIcon className="w-5 h-5 text-yellow-500" />
               <h3 className="text-lg font-bold text-slate-200">Distribuição por Categoria</h3>
             </div>
             <div className="h-48 w-full flex items-center justify-center">
                 {pieData.length === 0 ? (
                   <p className="text-slate-500 text-sm italic">Adicione despesas para ver a distribuição.</p>
                 ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.5rem' }}/>
                      <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                 )}
             </div>
          </div>
        </div>

        {/* Small Widgets column */}
        <div className="space-y-6 flex flex-col gs-reveal">
          
          {/* AI Advice Widget */}
          <div className="glass-panel rounded-2xl p-6 bg-gradient-to-br from-emerald-900/40 to-slate-900/60 border-emerald-500/20 relative overflow-hidden flex-1 group cursor-pointer hover:border-emerald-500/40 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Sparkles className="w-24 h-24 text-emerald-400 blur-[2px]" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-4 border border-emerald-500/30">
                <Sparkles className="w-3 h-3" /> IA FinEasy
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2 leading-tight group-hover:text-emerald-300 transition-colors">Conselho Financeiro</h3>
              <p className="text-sm text-slate-400 line-clamp-4">
                {balance < 0 
                  ? "Seu saldo está negativo! Reduza gastos supérfluos e priorize o pagamento de dívidas com juros altos."
                  : balance === 0 
                    ? "Comece agora a registrar suas finanças para que eu possa te dar os melhores conselhos!" 
                    : "Ótimo trabalho! Seu saldo está positivo. Considere investir o excedente para acelerar sua independência financeira."}
              </p>
            </div>
          </div>

          {/* Market Top Assets */}
          <div className="glass-panel rounded-2xl p-6 flex-1 border-emerald-900/10">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-bold text-slate-200">Ações em Alta</h3>
               <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">Mercado BR</span>
             </div>
             <div className="space-y-3">
               {marketAssets.map((asset, i) => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors border border-slate-700/30">
                   <div>
                     <p className="font-bold text-slate-200 text-sm">{asset.symbol}</p>
                   </div>
                   <div className="text-right">
                     <p className="font-medium text-slate-200 text-sm mb-0.5">R$ {asset.price.toFixed(2)}</p>
                     <p className={`text-xs font-bold ${asset.changePerc > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                       {asset.changePerc > 0 ? '+' : ''}{(asset.changePerc || 0).toFixed(2)}%
                     </p>
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
