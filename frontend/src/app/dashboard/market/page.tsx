'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Search, DollarSign, BarChart2, RefreshCw } from 'lucide-react';

interface MarketAsset {
  symbol: string;
  name: string;
  price: number;
  changePerc?: number;
}

export default function MarketPage() {
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [investAmount, setInvestAmount] = useState('');
  const [investSymbol, setInvestSymbol] = useState('PETR4');
  const [investYears, setInvestYears] = useState('5');
  const [simulationResult, setSimulationResult] = useState<number | null>(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/market/assets/top`);
      const data = await resp.json();
      if (Array.isArray(data)) {
        setAssets(data);
        if (data.length > 0) setInvestSymbol(data[0].symbol);
      }
    } catch (error) {
      console.error('Erro ao buscar ativos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = assets.filter(a =>
    a.symbol.toLowerCase().includes(search.toLowerCase()) ||
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSimulate = () => {
    const amount = parseFloat(investAmount);
    const years = parseInt(investYears);
    const asset = assets.find(a => a.symbol === investSymbol);
    if (!amount || !years || !asset) return;
    const annualReturn = 0.12; 
    const result = amount * Math.pow(1 + annualReturn, years);
    setSimulationResult(result);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Mercado de Ações</h1>
        <p className="text-slate-400">Acompanhe ativos da B3 em tempo real e simule seus investimentos.</p>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'IBOVESPA', value: '131.482', change: '+0.74%', up: true },
          { label: 'USD/BRL', value: 'R$ 5.18', change: '-0.21%', up: false },
          { label: 'SELIC', value: '10.50%', change: 'a.a.', up: true },
        ].map((ind, i) => (
          <div key={i} className="glass-panel p-5 rounded-2xl">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">{ind.label}</p>
            <p className="text-2xl font-bold text-slate-100">{ind.value}</p>
            <span className={`text-xs font-bold ${ind.up ? 'text-emerald-400' : 'text-red-400'}`}>{ind.change}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assets Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar ativo (ex: PETR4, Vale...)"
              className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden relative min-h-[400px]">
            <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800">
              <div className="grid grid-cols-5 gap-4 flex-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span className="col-span-2">Ativo</span>
                <span className="text-right">Preço</span>
                <span className="text-right">Variação</span>
                <span className="text-right">Ação</span>
              </div>
              <button 
                onClick={fetchAssets}
                disabled={loading}
                className="ml-4 p-1 hover:bg-slate-700 rounded transition-colors"
                title="Atualizar dados"
              >
                <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-10">
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                  <p className="text-sm text-slate-400 font-medium">Sincronizando com a B3...</p>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-slate-500">Nenhum ativo encontrado.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700/50">
                {filtered.map(asset => (
                  <div key={asset.symbol} className="grid grid-cols-5 gap-4 px-4 py-3.5 hover:bg-slate-800/30 transition-colors items-center">
                    <div className="col-span-2">
                      <p className="font-bold text-slate-200 text-sm">{asset.symbol}</p>
                      <p className="text-xs text-slate-500">{asset.name || 'Empresa B3'}</p>
                    </div>
                    <p className="text-right font-medium text-slate-200 text-sm">R$ {asset.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <div className="flex items-center justify-end gap-1">
                      {(asset.changePerc || 0) >= 0
                        ? <TrendingUp className="w-4 h-4 text-emerald-400" />
                        : <TrendingDown className="w-4 h-4 text-red-400" />
                      }
                      <span className={`text-sm font-bold ${(asset.changePerc || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {(asset.changePerc || 0) > 0 ? '+' : ''}{asset.changePerc?.toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-right">
                      <button 
                        onClick={() => { setInvestSymbol(asset.symbol); setSimulationResult(null); }}
                        className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Simular
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Simulator */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-5 h-5 text-yellow-500" />
              <h3 className="font-bold text-slate-200">Simulador de Investimento</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Ativo</label>
                <select
                  value={investSymbol}
                  onChange={e => setInvestSymbol(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  {assets.map(a => (
                    <option key={a.symbol} value={a.symbol}>{a.symbol} - {a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Valor Inicial (R$)</label>
                <input
                  type="number"
                  value={investAmount}
                  onChange={e => setInvestAmount(e.target.value)}
                  placeholder="Ex: 10000"
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Período (anos)</label>
                <input
                  type="number"
                  value={investYears}
                  onChange={e => setInvestYears(e.target.value)}
                  min="1" max="30"
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <button
                onClick={handleSimulate}
                className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-emerald-600/20"
              >
                Simular
              </button>

              {simulationResult && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">Valor estimado após {investYears} anos</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    R$ {simulationResult.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Baseado em retorno médio histórico de 12% a.a.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
