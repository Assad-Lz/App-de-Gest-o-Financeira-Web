'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Search, DollarSign, BarChart2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

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

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-6 lg:space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tighter mb-2 italic uppercase">
          Market <span className="text-gradient">Intelligence</span>
        </h1>
        <p className="text-slate-500 font-medium text-sm lg:text-base">Dados em tempo real da B3 e ferramentas de projeção patrimonial.</p>
      </motion.div>

      {/* Market Overview Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
        {[
          { label: 'IBOVESPA', value: '131.482', change: '+0.74%', up: true, icon: TrendingUp },
          { label: 'USD/BRL', value: 'R$ 5.18', change: '-0.21%', up: false, icon: DollarSign },
          { label: 'SELIC', value: '10.50%', change: 'a.a.', up: true, icon: BarChart2 },
        ].map((ind, i) => (
          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            key={i} 
            className="glass-panel p-5 lg:p-6 rounded-[2rem] border-white/5 border-glow group flex items-center justify-between"
          >
            <div>
              <p className="text-slate-500 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] mb-1 lg:mb-2">{ind.label}</p>
              <p className="text-2xl lg:text-3xl font-black text-white tracking-tighter">{ind.value}</p>
              <div className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest mt-1 ${ind.up ? 'text-emerald-500' : 'text-red-500'}`}>
                {ind.change}
              </div>
            </div>
            <div className={`p-3 lg:p-4 rounded-xl lg:rounded-2xl ${ind.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'} border border-current/10 shadow-inner flex-shrink-0`}>
              <ind.icon className="w-5 h-5 lg:w-6 lg:h-6" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
        {/* Assets Table */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por ticker ou empresa..."
              className="w-full bg-slate-950/40 border border-white/5 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 backdrop-blur-md transition-all placeholder:text-slate-600 font-medium"
            />
          </div>

          <motion.div 
            whileHover={{ scale: 1.005 }}
            className="glass-panel rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden border-white/5 border-glow"
          >
            <div className="flex justify-between items-center px-4 md:px-8 py-4 md:py-5 border-b border-white/5 bg-white/[0.01]">
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4 flex-1 text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                <span className="col-span-2">Ativo Financeiro</span>
                <span className="text-right hidden md:block">Cotação Atual</span>
                <span className="text-right md:text-center">Ações</span>
                <span className="text-right opacity-0 hidden md:block">B</span>
              </div>
              <button 
                onClick={fetchAssets}
                disabled={loading}
                className="ml-2 md:ml-6 p-2 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/5"
                title="Sincronizar B3"
              >
                <RefreshCw className={`w-4 h-4 text-emerald-500 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="min-h-[400px] relative">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 backdrop-blur-md z-10 transition-all">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full" />
                      <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin" />
                    </div>
                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.3em]">Hacking B3 Data...</p>
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-24 text-center">
                  <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Ativo não localizado no radar</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.03] max-h-[500px] lg:max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
                  {filtered.map(asset => (
                    <div key={asset.symbol} className="flex flex-col md:grid md:grid-cols-5 gap-3 md:gap-4 px-4 md:px-8 py-4 md:py-5 hover:bg-white/[0.02] transition-colors group relative">
                      
                      <div className="md:col-span-2 flex items-center justify-between md:block">
                        <div>
                          <p className="font-black text-white text-sm tracking-tight group-hover:text-emerald-400 transition-colors uppercase">{asset.symbol}</p>
                          <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wider">{asset.name || 'Brazilian Stock'}</p>
                        </div>
                        {/* Preço Mobile */}
                        <div className="md:hidden text-right">
                          <p className="font-black text-white text-xs tracking-tighter italic">
                            R$ {asset.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${ (asset.changePerc || 0) >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {(asset.changePerc || 0) > 0 ? '+' : ''}{asset.changePerc?.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      {/* Preço Desktop */}
                      <p className="hidden md:block text-right font-black text-white text-sm tracking-tighter italic lg:my-auto">
                        <span className="text-[10px] text-slate-600 mr-1 opacity-50 font-medium not-italic">R$</span>
                        {asset.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      
                      {/* Variação Desktop */}
                      <div className="hidden md:flex items-center justify-end gap-2 lg:my-auto">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${ (asset.changePerc || 0) >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {(asset.changePerc || 0) > 0 ? '+' : ''}{asset.changePerc?.toFixed(2)}%
                        </span>
                      </div>

                      <div className="text-right mt-2 md:mt-0 lg:my-auto">
                        <button 
                          onClick={() => { setInvestSymbol(asset.symbol); setSimulationResult(null); }}
                          className="w-full md:w-auto text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 md:border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400 text-emerald-500 md:text-slate-400 px-4 py-2.5 md:py-2 rounded-xl transition-all"
                        >
                          Simular
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Simulator */}
        <motion.div variants={itemVariants} className="space-y-6 flex flex-col">
          <div className="glass-panel p-6 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] border border-white/5 border-glow bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent h-fit overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <BarChart2 className="w-24 h-24 lg:w-32 lg:h-32 text-emerald-500" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6 lg:mb-8">
                <div className="p-2 lg:p-2.5 rounded-2xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                  <BarChart2 className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
                <div>
                  <h3 className="text-sm lg:text-md font-black text-white uppercase tracking-widest leading-none">Simulation</h3>
                  <p className="text-[9px] lg:text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-1">Projeção de Longo Prazo</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[9px] lg:text-[10px] text-slate-500 font-black uppercase tracking-[0.1em] mb-2 block">Selecione o Ativo</label>
                  <select
                    value={investSymbol}
                    onChange={e => setInvestSymbol(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 text-slate-200 px-4 py-3 lg:py-3.5 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all appearance-none cursor-pointer hover:bg-slate-900"
                  >
                    {assets.map(a => (
                      <option key={a.symbol} value={a.symbol} className="bg-slate-900">{a.symbol} · {a.name?.substring(0, 15)}...</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] lg:text-[10px] text-slate-500 font-black uppercase tracking-[0.1em] mb-2 block">Patrimônio Inicial (R$)</label>
                  <input
                    type="number"
                    value={investAmount}
                    onChange={e => setInvestAmount(e.target.value)}
                    placeholder="Ex: 50000"
                    className="w-full bg-slate-950 border border-white/10 text-slate-200 px-4 py-3 lg:py-3.5 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all placeholder:text-slate-700"
                  />
                </div>

                <div>
                  <label className="text-[9px] lg:text-[10px] text-slate-500 font-black uppercase tracking-[0.1em] mb-2 block">Janela Temporal (Anos)</label>
                  <div className="flex items-center gap-3 lg:gap-4">
                    <input
                      type="range"
                      min="1" max="30"
                      value={investYears}
                      onChange={e => setInvestYears(e.target.value)}
                      className="flex-1 accent-emerald-500 h-1.5 lg:h-2 bg-slate-800 rounded-full"
                    />
                    <span className="w-10 lg:w-12 text-center text-xs lg:text-sm font-black text-emerald-400 bg-emerald-400/10 px-1.5 lg:px-2 py-1 rounded-lg border border-emerald-500/20">{investYears}y</span>
                  </div>
                </div>

                <button
                  onClick={handleSimulate}
                  className="w-full py-4 lg:py-4 rounded-[1.25rem] lg:rounded-[1.5rem] bg-emerald-500 text-slate-950 font-black uppercase tracking-widest text-[10px] lg:text-xs hover:scale-[1.03] active:scale-95 transition-all shadow-2xl shadow-emerald-500/20 mt-2 lg:mt-4"
                >
                  Computar Projeção
                </button>

                {simulationResult && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-500/5 border border-emerald-500/20 rounded-[1.5rem] lg:rounded-[2rem] p-4 lg:p-8 text-center mt-6 lg:mt-10 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-30" />
                    <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 lg:mb-3 truncate">Valor Estimado do Patrimônio</p>
                    <p className="text-xl sm:text-2xl lg:text-4xl font-black text-emerald-400 tracking-tighter italic lg:mb-2 truncate">
                      <span className="text-[10px] lg:text-sm font-medium not-italic mr-1 text-emerald-600 block sm:inline">R$</span>
                      {simulationResult.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-[7px] lg:text-[9px] text-slate-600 font-bold uppercase tracking-tighter mt-1 lg:mt-2 truncate">Projeção Linear com TIR de 12% a.a.</p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
