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
  const [form, setForm] = useState({ type: 'EXPENSE', amount: '', category: '', description: '' });

  const fetchTransactions = async () => {
    if (!session?.user) return;
    try {
      const userId = (session.user as any).email; // No nosso backend, por enquanto identificamos pelo email ou uuid.
      // Ajuste: O CreateUserController retorna o 'id' real do banco.
      // Idealmente pegaríamos o 'id' da sessão.
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
      await axios.post(`${API_URL}/transactions`, {
        userId: (session.user as any).email, // Backend busca o ID pelo email se necessário, ou passamos o email para o usecase findByEmail
        type: form.type,
        amount: parseFloat(form.amount),
        category: form.category,
        description: form.description || undefined
      });
      
      setForm({ type: 'EXPENSE', amount: '', category: '', description: '' });
      setShowForm(false);
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
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Despesas e Receitas</h1>
          <p className="text-slate-400">Visualize e gerencie todas as suas movimentações financeiras.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:opacity-90 transition-opacity shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" /> Nova Transação
        </button>
      </div>

      {/* Nova Transação Form */}
      {showForm && (
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 space-y-4">
          <h3 className="text-lg font-bold text-slate-200">Adicionar Transação</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Tipo</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="EXPENSE">Despesa</option>
                <option value="INCOME">Receita</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Valor (R$)</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                placeholder="0,00"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Categoria</label>
              <input
                type="text"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                placeholder="Ex: Alimentação, Salário..."
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Descrição</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Opcional..."
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleSaveTransaction}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Salvar Transação
            </button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Saldo Total', value: balance, color: balance >= 0 ? 'emerald' : 'red', icon: balance >= 0 ? ArrowUpRight : ArrowDownRight },
          { label: 'Total Receitas', value: totalIncome, color: 'emerald', icon: ArrowUpRight },
          { label: 'Total Despesas', value: totalExpense, color: 'red', icon: ArrowDownRight },
        ].map((card, i) => (
          <div key={i} className="glass-panel p-5 rounded-2xl">
            <p className="text-slate-400 text-sm mb-1">{card.label}</p>
            <p className={`text-2xl font-bold text-${card.color}-400`}>
              R$ {card.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Filter className="w-5 h-5 text-slate-400 self-center" />
        {(['ALL', 'INCOME', 'EXPENSE'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${filter === f ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
          >
            {f === 'ALL' ? 'Todas' : f === 'INCOME' ? 'Receitas' : 'Despesas'}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Nenhuma transação encontrada. Comece adicionando uma acima!
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filtered.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'INCOME' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                    {tx.type === 'INCOME'
                      ? <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                      : <ArrowDownRight className="w-5 h-5 text-red-400" />
                    }
                  </div>
                  <div>
                    <p className="font-medium text-slate-200 text-sm">{tx.description || 'Sem descrição'}</p>
                    <p className="text-xs text-slate-500">{tx.category} · {new Date(tx.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className={`font-bold text-sm ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <button 
                    onClick={() => handleDeleteTransaction(tx.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
