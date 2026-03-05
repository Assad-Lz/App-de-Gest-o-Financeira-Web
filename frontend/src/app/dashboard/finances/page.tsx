'use client';

import { useState } from 'react';
import { Plus, ArrowUpRight, ArrowDownRight, Trash2, Filter } from 'lucide-react';

const mockTransactions = [
  { id: '1', type: 'INCOME', amount: 7200, category: 'Salário', description: 'Salário mensal', date: '2025-06-01' },
  { id: '2', type: 'EXPENSE', amount: 1800, category: 'Moradia', description: 'Aluguel + Condomínio', date: '2025-06-05' },
  { id: '3', type: 'EXPENSE', amount: 650, category: 'Alimentação', description: 'Supermercado + Restaurantes', date: '2025-06-08' },
  { id: '4', type: 'INCOME', amount: 800, category: 'Freelance', description: 'Projeto web design', date: '2025-06-12' },
  { id: '5', type: 'EXPENSE', amount: 320, category: 'Transporte', description: 'Combustível + Uber', date: '2025-06-14' },
  { id: '6', type: 'EXPENSE', amount: 450, category: 'Lazer', description: 'Cinema + Academia + Viagem', date: '2025-06-18' },
  { id: '7', type: 'INCOME', amount: 500, category: 'Investimentos', description: 'Dividendos FIIs', date: '2025-06-20' },
  { id: '8', type: 'EXPENSE', amount: 210, category: 'Saúde', description: 'Plano de saúde + Remédios', date: '2025-06-22' },
];

type FilterType = 'ALL' | 'INCOME' | 'EXPENSE';

export default function FinancesPage() {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'EXPENSE', amount: '', category: '', description: '' });

  const filtered = filter === 'ALL' ? mockTransactions : mockTransactions.filter(t => t.type === filter);

  const totalIncome = mockTransactions.filter(t => t.type === 'INCOME').reduce((a, t) => a + t.amount, 0);
  const totalExpense = mockTransactions.filter(t => t.type === 'EXPENSE').reduce((a, t) => a + t.amount, 0);
  const balance = totalIncome - totalExpense;

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
            <button className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:opacity-90 transition-opacity">
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
          { label: 'Saldo do Mês', value: balance, color: balance >= 0 ? 'emerald' : 'red', icon: balance >= 0 ? ArrowUpRight : ArrowDownRight },
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
                  <p className="font-medium text-slate-200 text-sm">{tx.description}</p>
                  <p className="text-xs text-slate-500">{tx.category} · {new Date(tx.date).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className={`font-bold text-sm ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
