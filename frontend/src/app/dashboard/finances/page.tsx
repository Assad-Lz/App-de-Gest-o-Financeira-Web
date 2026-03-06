'use client';

import { useState, useEffect } from 'react';
import { Plus, ArrowUpRight, ArrowDownRight, Trash2, Filter, Loader2, X, Tag, ChevronLeft, ChevronRight, PieChart as PieIcon, LineChart as LineIcon } from 'lucide-react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#10b981', '#eab308', '#3b82f6', '#f43f5e', '#a855f7', '#ec4899', '#f97316', '#64748b'];

const EXPENSE_CATEGORIES = ['Custos Fixos', 'Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Outros'];
const INCOME_CATEGORIES = ['Salário', 'Dividendos', 'Rendimentos', 'Vendas', 'Freelance', 'Restituição', 'Bônus', 'Outros'];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type Transaction = {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: string;
  description: string;
  date: string;
};

type FilterType = 'ALL' | 'INCOME' | 'EXPENSE';

export default function FinancesPage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ type: 'EXPENSE', amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0] });
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const fetchTransactions = async () => {
    if (!session?.user) return;
    try {
      const userId = (session.user as any).email; 
      const response = await axios.get(`${API_URL}/transactions/${userId}`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();

    const fallbackTimer = setTimeout(() => {
      setLoading(false);
    }, 8000);

    return () => clearTimeout(fallbackTimer);
  }, [session]);

  const handleSaveTransaction = async () => {
    if (!session?.user || !form.amount || !form.category) return;
    
    setIsSubmitting(true);
    try {
      if (editingId) {
        // Modo Edição (PUT)
        await axios.put(`${API_URL}/transactions/${editingId}`, {
          type: form.type,
          amount: parseFloat(form.amount),
          category: form.category,
          description: form.description || undefined,
          date: new Date(`${form.date}T12:00:00Z`).toISOString()
        });
      } else {
        // Modo Criação (POST)
        await axios.post(`${API_URL}/transactions`, {
          userId: (session.user as any).email,
          type: form.type,
          amount: parseFloat(form.amount),
          category: form.category,
          description: form.description || undefined,
          date: new Date(`${form.date}T12:00:00Z`).toISOString()
        });
      }
      
      resetForm();
      fetchTransactions();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      alert('Erro ao salvar. Verifique se o backend está rodando.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if(!confirm('Tem certeza que deseja excluir esta transação?')) return;
    
    try {
      await axios.delete(`${API_URL}/transactions/${id}`);
      fetchTransactions();
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
    }
  };

  const startEditing = (tx: Transaction) => {
    setForm({
      type: tx.type,
      amount: tx.amount.toString(),
      category: tx.category,
      description: tx.description || '',
      date: tx.date ? new Date(tx.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setEditingId(tx.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setForm({ type: 'EXPENSE', amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0] });
    setEditingId(null);
    setShowForm(false);
  };

  // Filtro por Mês/Ano (Planejamento)
  const monthlyTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const filtered = filter === 'ALL' ? monthlyTransactions : monthlyTransactions.filter(t => t.type === filter);

  const totalIncome = monthlyTransactions.filter(t => t.type === 'INCOME').reduce((a, t) => a + t.amount, 0);
  const totalExpense = monthlyTransactions.filter(t => t.type === 'EXPENSE').reduce((a, t) => a + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const changeMonth = (offset: number) => {
    let newMonth = currentMonth + offset;
    let newYear = currentYear;
    if (newMonth > 11) { newMonth = 0; newYear++; }
    if (newMonth < 0) { newMonth = 11; newYear--; }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };
  
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  // Agrupamento para Gráfico de Pizza (Categorias de Despesa do Mês)
  const categoryTotals = monthlyTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc: any, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = Object.keys(categoryTotals)
    .sort((a, b) => categoryTotals[b] - categoryTotals[a]) // Ordena para as maiores fatias
    .map(cat => ({
      name: cat,
      value: categoryTotals[cat]
    }));

  // Agrupamento para Gráfico de Área (Fluxo Diário do Mês)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dailyFlowData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dayTransactions = monthlyTransactions.filter(t => new Date(t.date).getDate() === day);
    const inc = dayTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const exp = dayTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    return { day: day.toString(), income: inc, expense: exp };
  });

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-slate-400">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin" />
        </div>
        <p className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-emerald-500 animate-pulse">Autenticando Ledger...</p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-6 lg:space-y-10 px-2 sm:px-4 lg:px-0 w-full overflow-hidden"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter mb-2 uppercase italic">
            Flow <span className="text-gradient">Manager</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm lg:text-base">Controle total de entradas e saídas com rastreamento inteligente.</p>
        </div>
        <button
          onClick={() => {
            if(showForm && editingId) {
              resetForm();
            } else {
              setShowForm(!showForm);
            }
          }}
          className="flex items-center justify-center gap-2 w-full lg:w-auto px-6 lg:px-8 py-3.5 lg:py-4 rounded-[1.25rem] bg-emerald-500 text-slate-950 font-black uppercase tracking-widest text-[10px] hover:scale-[1.03] active:scale-95 transition-all shadow-2xl shadow-emerald-500/20"
        >
          {showForm && editingId ? 'Cancelar Edição' : (
            <><Plus className="w-4 h-4" /> Nova Transação</>
          )}
        </button>
      </motion.div>

      {/* Planejamento Mensal - Navegador */}
      <motion.div variants={itemVariants} className="flex items-center justify-between bg-slate-900 border border-white/5 rounded-[1.5rem] p-4 sm:p-5 lg:p-6 shadow-2xl w-full">
        <button onClick={() => changeMonth(-1)} className="p-2 md:p-3 rounded-xl bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors shrink-0">
           <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>
        <div className="flex flex-col items-center">
           <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em] mb-1 text-center">Painel Mensal</span>
           <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-wider text-center flex-1 truncate">{monthNames[currentMonth]} {currentYear}</h2>
        </div>
        <button onClick={() => changeMonth(1)} className="p-2 md:p-3 rounded-xl bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors shrink-0">
           <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-8">
        {[
          { label: 'Saldo de Caixa', value: balance, color: balance >= 0 ? 'emerald' : 'red', icon: balance >= 0 ? ArrowUpRight : ArrowDownRight },
          { label: 'Receitas Consolidadas', value: totalIncome, color: 'emerald', icon: ArrowUpRight },
          { label: 'Despesas Consolidadas', value: totalExpense, color: 'red', icon: ArrowDownRight },
        ].map((card, i) => (
          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            key={i} 
            className="glass-panel p-6 lg:p-8 rounded-[2rem] border-white/5 border-glow flex flex-col justify-between min-h-[140px] lg:h-40"
          >
            <div className="flex justify-between items-start mb-4 lg:mb-0">
              <p className="text-slate-500 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] w-3/4 leading-tight">{card.label}</p>
              <div className={`p-2 lg:p-2.5 rounded-xl ${card.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'} border border-current/10 flex-shrink-0`}>
                <card.icon className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>
            </div>
            <p className={`text-2xl lg:text-3xl font-black tracking-tighter text-white italic truncate`}>
              <span className="text-xs lg:text-sm font-medium not-italic mr-1 text-slate-500">R$</span>
              {card.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Gráficos Mensais Dinâmicos */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico de Área (Fluxo Diário) */}
        <motion.div className="lg:col-span-2 glass-panel rounded-[2rem] p-5 lg:p-8 flex flex-col border-white/5 border-glow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
            <h3 className="text-sm lg:text-md font-black text-white tracking-widest uppercase flex items-center gap-2"><LineIcon className="w-4 h-4 text-blue-500" /> Fluxo Diário</h3>
            <div className="flex items-center gap-3 lg:gap-4 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Entradas</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /> Saídas</div>
            </div>
          </div>
          <div className="h-60 lg:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncomeDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenseDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#334155" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} dy={10} />
                <YAxis stroke="#334155" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} tickFormatter={(val) => `R$${val}`} />
                <CartesianGrid strokeDasharray="4 4" stroke="#ffffff05" vertical={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '1.25rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '0.75rem', fontWeight: 700 }}
                />
                <Area type="monotone" dataKey="income" name="Entrada" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncomeDaily)" />
                <Area type="monotone" dataKey="expense" name="Saída" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenseDaily)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Gráfico de Pizza (Categorias) */}
        <motion.div className="glass-panel rounded-[2rem] p-5 lg:p-8 flex flex-col border-white/5 border-glow">
           <div className="flex items-center gap-3 mb-6 lg:mb-8">
             <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500"><PieIcon className="w-4 h-4" /></div>
             <h3 className="text-sm lg:text-md font-black text-white uppercase tracking-widest">Despesas por Categoria</h3>
           </div>
           <div className="flex-1 w-full flex items-center justify-center min-h-[200px]">
               {pieData.length === 0 ? (
                 <div className="text-center">
                   <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Sem despesas registradas</p>
                 </div>
               ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" cornerRadius={4}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', fontSize: '12px' }}/>
                    <Legend verticalAlign="bottom" height={36} content={
                      (props) => {
                         const { payload } = props;
                         return (
                           <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase mt-4">
                             {payload?.map((entry, index) => (
                               <li key={`item-${index}`} className="flex items-center gap-1.5 truncate max-w-[100px]">
                                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                 <span className="truncate">{entry.value}</span>
                               </li>
                             ))}
                           </ul>
                         );
                      }
                    }/>
                  </PieChart>
                </ResponsiveContainer>
               )}
           </div>
        </motion.div>
      </motion.div>

      {/* Nova/Editar Transação Popup (Modal) */}
      <AnimatePresence>
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 lg:p-6 bg-slate-950/80 backdrop-blur-sm overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-panel p-5 sm:p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] border border-emerald-500/20 bg-slate-900 w-full max-w-2xl max-h-[85vh] lg:max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl flex flex-col relative mt-8 lg:mt-0"
          >
            <button 
              onClick={resetForm} 
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-10"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6 pr-8">
               <div className="w-1.5 h-6 bg-emerald-500 rounded-full shrink-0" />
               <h3 className="text-sm lg:text-base font-black text-white uppercase tracking-[0.2em] break-words">
                 {editingId ? 'Editar Transação' : 'Nova Transação'}
               </h3>
            </div>
            
            <div className="space-y-5 lg:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-1">Direção</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 text-slate-200 px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-sm appearance-none cursor-pointer"
                  >
                    <option value="EXPENSE">Despesa (Sai dinheiro)</option>
                    <option value="INCOME">Entrada (Entra dinheiro)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-1">Valor</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-white/10 text-slate-200 px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-sm placeholder:text-slate-700"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-1">Data (Para planejamento informe datas futuras)</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 text-slate-200 px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-[13px] date-picker-custom"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 pl-1 mb-1">
                  <Tag className="w-3.5 h-3.5 text-emerald-500" />
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Categoria</label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(form.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat })}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${form.category.toLowerCase() === cat.toLowerCase() ? 'bg-emerald-500 text-slate-950 border-emerald-500' : 'bg-slate-800/50 text-slate-400 border-white/5 hover:bg-slate-700 hover:text-slate-200'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  placeholder="Ou digite uma Categoria Personalizada..."
                  className="w-full bg-slate-950 border border-white/10 text-slate-200 px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-sm placeholder:text-slate-700 mt-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-1">Especificação / Descrição</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Detalhes adicionais da transação..."
                  className="w-full bg-slate-950 border border-white/10 text-slate-200 px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-sm placeholder:text-slate-700"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-white/5">
              <button type="button" onClick={resetForm} className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 text-slate-300 font-black uppercase tracking-widest text-[10px] hover:bg-slate-700 transition-colors text-center">
                Cancelar
              </button>
              <button 
                type="button"
                onClick={handleSaveTransaction}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-500 text-slate-950 font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Salvar Edição' : 'Registrar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Filters and List */}
      <motion.div variants={itemVariants} className="space-y-4 lg:space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
           <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 lg:pb-0">
             <Filter className="w-4 h-4 text-slate-600 flex-shrink-0 ml-1 lg:ml-0" />
             <div className="flex p-1 bg-white/[0.03] border border-white/5 rounded-2xl gap-1">
               {(['ALL', 'INCOME', 'EXPENSE'] as FilterType[]).map(f => (
                 <button
                   key={f}
                   onClick={() => setFilter(f)}
                   className={`px-4 lg:px-6 py-2.5 lg:py-2 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   {f === 'ALL' ? 'Histórico' : f === 'INCOME' ? 'Entradas' : 'Despesas'}
                 </button>
               ))}
             </div>
           </div>
           <span className="text-[9px] lg:text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-4 py-2.5 lg:py-2 border border-white/5 rounded-full text-center whitespace-nowrap">
             {filtered.length} Registros Localizados
           </span>
        </div>

        <div className="glass-panel rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden border-white/5 border-glow">
          {filtered.length === 0 ? (
            <div className="py-20 lg:py-24 text-center">
              <p className="text-slate-600 font-black uppercase text-[10px] lg:text-xs tracking-[0.2em]">O fluxo está zerado</p>
              <p className="text-slate-700 text-[9px] lg:text-[10px] uppercase font-bold mt-2 italic px-4">Adicione a primeira transação para iniciar o monitoramento</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03] max-h-[600px] lg:max-h-[800px] overflow-y-auto custom-scrollbar">
              {filtered.map(tx => (
                <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 lg:px-8 lg:py-6 hover:bg-white/[0.02] transition-colors group relative gap-4 sm:gap-0">
                  <div className="flex items-start lg:items-center gap-4 lg:gap-6 w-full sm:w-auto overflow-hidden">
                    <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-[1.25rem] lg:rounded-2xl flex items-center justify-center flex-shrink-0 border ${tx.type === 'INCOME' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' : 'bg-red-500/5 border-red-500/10 text-red-400'} shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                      {tx.type === 'INCOME'
                        ? <ArrowUpRight className="w-5 h-5 lg:w-6 lg:h-6" />
                        : <ArrowDownRight className="w-5 h-5 lg:w-6 lg:h-6" />
                      }
                    </div>
                    <div className="cursor-pointer min-w-0 flex-1 overflow-hidden" onClick={() => startEditing(tx)}>
                      <p className="font-black text-white text-xs lg:text-sm tracking-tight group-hover:text-emerald-400 transition-colors uppercase truncate w-full">{tx.description || 'Null Entry'}</p>
                      <div className="flex items-center gap-2 mt-1 lg:mt-1.5 overflow-hidden">
                        <span className="text-[9px] lg:text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{tx.category}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-700 flex-shrink-0" />
                        <span className="text-[9px] lg:text-[10px] text-slate-500 font-bold uppercase tracking-tighter shrink-0">{new Date(tx.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 lg:gap-8 mt-2 sm:mt-0 ml-16 sm:ml-0 shrink-0">
                    <p className={`text-lg lg:text-xl font-black italic tracking-tighter ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                      <span className="text-[9px] lg:text-[10px] font-medium not-italic mr-1 opacity-50 uppercase">{tx.type === 'INCOME' ? 'cr' : 'dt'}</span>
                      {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 sm:translate-x-4 sm:group-hover:translate-x-0">
                      <button 
                        onClick={() => handleDeleteTransaction(tx.id)}
                        className="p-2 lg:p-3 text-slate-500 lg:text-slate-600 hover:text-red-500 bg-white/[0.05] sm:bg-white/[0.02] hover:bg-red-500/10 rounded-xl border border-white/10 sm:border-white/5 transition-all"
                        title="Eliminate Transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
