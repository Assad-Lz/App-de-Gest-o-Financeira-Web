'use client';

import { useState } from 'react';
import { User, Bell, Shield, Palette, ChevronRight, Loader2, Download } from 'lucide-react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isExporting, setIsExporting] = useState(false);
  const [notifications, setNotifications] = useState({
    aiTips: true,
    weeklyReport: true,
    marketAlerts: false,
  });

  const handleExportData = async () => {
    if (!session?.user) return alert('Faça login primeiro.');
    setIsExporting(true);
    try {
      const email = (session.user as any).email;
      const res = await axios.get(`${API_URL}/transactions/${email}`);
      const dataStr = JSON.stringify(res.data, null, 2);
      
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fin_easy_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao exportar:', err);
      alert('Houve um erro ao baixar os dados. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

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
              value={session?.user?.email || "usuario@gmail.com"}
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
          <h2 className="font-bold text-slate-200">Segurança e Dados</h2>
        </div>
        
        <div className="flex flex-col gap-2 relative">
          
          <div className="flex items-center justify-between p-4 bg-slate-800/40 hover:bg-slate-800/70 rounded-xl cursor-default transition-colors">
            <div>
              <p className="font-medium text-sm text-slate-200">Autenticação Google</p>
              <p className="text-slate-500 text-xs mt-0.5">Conta Google Cloud conectada ✓</p>
            </div>
            <Shield className="w-4 h-4 text-emerald-500" />
          </div>

          <button 
            onClick={handleExportData}
            disabled={isExporting}
            className="flex items-center justify-between p-4 bg-slate-800/40 hover:bg-slate-800/70 border border-transparent hover:border-white/10 rounded-xl cursor-pointer transition-colors w-full text-left disabled:opacity-50"
          >
            <div>
              <p className="font-medium text-sm text-slate-200 flex items-center gap-2">
                Exportar meus dados
                {isExporting && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">Baixe (.json) o raio-x histórico do seu patrimônio.</p>
            </div>
            {isExporting ? <Loader2 className="w-4 h-4 text-slate-500 animate-spin" /> : <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />}
          </button>

          <button className="flex items-center justify-between p-4 bg-slate-800/40 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl cursor-pointer transition-colors w-full text-left">
            <div>
              <p className="font-medium text-sm text-red-500">Excluir conta</p>
              <p className="text-slate-500 text-xs mt-0.5">Encerrar sessão e apagar histórico da AWS.</p>
            </div>
            <ChevronRight className="w-4 h-4 text-red-500" />
          </button>
          
        </div>
      </div>
    </div>
  );
}
