'use client';

import { useState, useEffect } from 'react';
import { Plus, ArrowUpRight, ArrowDownRight, Trash2, Filter, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

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
  const [form, setForm] = useState({ type: 'EXPENSE', amount: '', category: '', description: '' });

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
          description: form.description || undefined
        });
      } else {
        // Modo Criação (POST)
        await axios.post(`${API_URL}/transactions`, {
          userId: (session.user as any).email,
          type: form.type,
          amount: parseFloat(form.amount),
          category: form.category,
          description: form.description || undefined
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
      description: tx.description || ''
    });
    setEditingId(tx.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setForm({ type: 'EXPENSE', amount: '', category: '', description: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const filtered = filter === 'ALL' ? transactions : transactions.filter(t => t.type === filter);

  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((a, t) => a + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((a, t) => a + t.amount, 0);
  const balance = totalIncome - totalExpense;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mr-3" />
        Carregando transações...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 lg:space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 gs-reveal">
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-8 gs-reveal">
        {[
          { label: 'Saldo de Caixa', value: balance, color: balance >= 0 ? 'emerald' : 'red', icon: balance >= 0 ? ArrowUpRight : ArrowDownRight },
          { label: 'Receitas Consolidadas', value: totalIncome, color: 'emerald', icon: ArrowUpRight },
          { label: 'Despesas Consolidadas', value: totalExpense, color: 'red', icon: ArrowDownRight },
        ].map((card, i) => (
          <div key={i} className="glass-panel p-6 lg:p-8 rounded-[2rem] border-white/5 border-glow flex flex-col justify-between min-h-[140px] lg:h-40">
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
          </div>
        ))}
      </div>

      {/* Nova/Editar Transação Form */}
      {showForm && (
        <div className="glass-panel p-6 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] border border-emerald-500/10 space-y-6 lg:space-y-8 bg-gradient-to-br from-emerald-500/5 to-transparent gs-reveal">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
             <h3 className="text-xs lg:text-sm font-black text-white uppercase tracking-[0.3em]">
               {editingId ? 'Data Modification' : 'Asset Acquisition'}
             </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="space-y-2">
              <label className="text-[9px] lg:text-[10px] text-slate-500 font-black uppercase tracking-widest pl-1">Direção</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full bg-slate-950/80 border border-white/5 text-slate-200 px-4 py-3 lg:py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-sm appearance-none cursor-pointer backdrop-blur-sm"
              >
                <option value="EXPENSE">Saída (Débito)</option>
                <option value="INCOME">Entrada (Crédito)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] lg:text-[10px] text-slate-500 font-black uppercase tracking-widest pl-1">Valor Monetário</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                placeholder="0,00"
                className="w-full bg-slate-950/80 border border-white/5 text-slate-200 px-4 py-3 lg:py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-sm placeholder:text-slate-800 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] lg:text-[10px] text-slate-500 font-black uppercase tracking-widest pl-1">Taxonomia</label>
              <input
                type="text"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                placeholder="Ex: Operacional, Lazer..."
                className="w-full bg-slate-950/80 border border-white/5 text-slate-200 px-4 py-3 lg:py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-sm placeholder:text-slate-800 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] lg:text-[10px] text-slate-500 font-black uppercase tracking-widest pl-1">Especificação</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Detalhes da transação..."
                className="w-full bg-slate-950/80 border border-white/5 text-slate-200 px-4 py-3 lg:py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-sm placeholder:text-slate-800 backdrop-blur-sm"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 pt-4 border-t border-white/5">
            <button 
              onClick={handleSaveTransaction}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 lg:px-8 py-3.5 lg:py-3.5 rounded-2xl bg-emerald-500 text-slate-950 font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingId ? 'Push Changes' : 'Execute Order'}
            </button>
            <button onClick={resetForm} className="w-full sm:w-auto px-6 lg:px-8 py-3.5 lg:py-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-colors text-center">
              Abort
            </button>
          </div>
        </div>
      )}

      {/* Filters and List */}
      <div className="space-y-4 lg:space-y-6 gs-reveal">
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
                   {f === 'ALL' ? 'History' : f === 'INCOME' ? 'Credit' : 'Debit'}
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
                  <div className="flex items-start lg:items-center gap-4 lg:gap-6">
                    <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-[1.25rem] lg:rounded-2xl flex items-center justify-center flex-shrink-0 border ${tx.type === 'INCOME' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' : 'bg-red-500/5 border-red-500/10 text-red-400'} shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                      {tx.type === 'INCOME'
                        ? <ArrowUpRight className="w-5 h-5 lg:w-6 lg:h-6" />
                        : <ArrowDownRight className="w-5 h-5 lg:w-6 lg:h-6" />
                      }
                    </div>
                    <div className="cursor-pointer" onClick={() => startEditing(tx)}>
                      <p className="font-black text-white text-xs lg:text-sm tracking-tight group-hover:text-emerald-400 transition-colors uppercase truncate">{tx.description || 'Null Entry'}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 lg:mt-1.5">
                        <span className="text-[9px] lg:text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{tx.category}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-700 flex-shrink-0" />
                        <span className="text-[9px] lg:text-[10px] text-slate-500 font-bold uppercase tracking-tighter whitespace-nowrap">{new Date(tx.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 lg:gap-8 mt-2 sm:mt-0 ml-16 sm:ml-0">
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
      </div>
    </div>
  );
}
