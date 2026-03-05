'use client';

import { useState } from 'react';
import { User, Bell, Shield, Palette, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    aiTips: true,
    weeklyReport: true,
    marketAlerts: false,
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Configurações</h1>
        <p className="text-slate-400">Gerencie sua conta e preferências do FinEasy.</p>
      </div>

      {/* Profile Section */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <User className="w-5 h-5 text-emerald-400" />
          <h2 className="font-bold text-slate-200">Perfil</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">Nome</label>
            <input
              type="text"
              defaultValue="Usuário FinEasy"
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">Email</label>
            <input
              type="email"
              defaultValue="usuario@gmail.com"
              className="w-full bg-slate-800 border border-slate-700 text-slate-400 px-4 py-2.5 rounded-xl text-sm cursor-not-allowed opacity-60"
              readOnly
            />
          </div>
        </div>
        <button className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:opacity-90 transition-opacity">
          Salvar Alterações
        </button>
      </div>

      {/* Notifications Section */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-5 h-5 text-yellow-400" />
          <h2 className="font-bold text-slate-200">Notificações</h2>
        </div>
        {[
          { key: 'aiTips' as const, label: 'Dicas da IA FinEasy', desc: 'Receba insights financeiros personalizados semanais' },
          { key: 'weeklyReport' as const, label: 'Relatório semanal', desc: 'Resumo das suas finanças toda segunda-feira' },
          { key: 'marketAlerts' as const, label: 'Alertas de mercado', desc: 'Notificações sobre variações nos seus ativos favoritos' },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl">
            <div>
              <p className="text-slate-200 font-medium text-sm">{item.label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
            </div>
            <button
              onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key] }))}
              className={`w-12 h-6 rounded-full transition-colors relative ${notifications[item.key] ? 'bg-emerald-600' : 'bg-slate-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${notifications[item.key] ? 'left-6.5' : 'left-0.5'}`} style={{ left: notifications[item.key] ? '26px' : '2px' }} />
            </button>
          </div>
        ))}
      </div>

      {/* Security Section */}
      <div className="glass-panel p-6 rounded-2xl space-y-3">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h2 className="font-bold text-slate-200">Segurança</h2>
        </div>
        {[
          { label: 'Alterar senha', desc: 'Atualize sua senha de acesso' },
          { label: 'Autenticação Google', desc: 'Vinculada a sua conta Google ✓' },
          { label: 'Exportar meus dados', desc: 'Baixe um relatório completo das suas finanças' },
          { label: 'Excluir conta', desc: 'Remova permanentemente sua conta e dados', danger: true },
        ].map((item, i) => (
          <div key={i} className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors ${item.danger ? 'hover:bg-red-500/10 border border-transparent hover:border-red-500/20' : 'bg-slate-800/40 hover:bg-slate-800/70'}`}>
            <div>
              <p className={`font-medium text-sm ${item.danger ? 'text-red-400' : 'text-slate-200'}`}>{item.label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
            </div>
            <ChevronRight className={`w-4 h-4 ${item.danger ? 'text-red-400' : 'text-slate-500'}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
