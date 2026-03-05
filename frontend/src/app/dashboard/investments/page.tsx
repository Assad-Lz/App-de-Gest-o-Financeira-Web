'use client';

import { useState } from 'react';
import { TrendingUp, Calculator, DollarSign, Landmark, BarChart3, Info } from 'lucide-react';

type ProductType = 'CDB' | 'TESOURO_SELIC' | 'TESOURO_IPCA' | 'TESOURO_PRE' | 'LCI_LCA' | 'POUPANCA';

const PRODUCTS: { id: ProductType; label: string; icon: string; description: string; risk: string; color: string }[] = [
  { id: 'CDB', label: 'CDB', icon: '🏦', description: 'Certificado de Depósito Bancário. Rende % do CDI.', risk: 'Baixo', color: 'emerald' },
  { id: 'TESOURO_SELIC', label: 'Tesouro SELIC', icon: '🏛️', description: 'Acompanha a taxa SELIC. Liquidez diária.', risk: 'Muito Baixo', color: 'blue' },
  { id: 'TESOURO_IPCA', label: 'Tesouro IPCA+', icon: '📈', description: 'IPCA + taxa prefixada. Proteção contra inflação.', risk: 'Baixo-Médio', color: 'yellow' },
  { id: 'TESOURO_PRE', label: 'Tesouro Prefixado', icon: '🔒', description: 'Taxa fixa anual garantida na contratação.', risk: 'Médio', color: 'purple' },
  { id: 'LCI_LCA', label: 'LCI / LCA', icon: '🌿', description: 'Isento de IR para pessoa física. Rende % do CDI.', risk: 'Baixo', color: 'teal' },
  { id: 'POUPANCA', label: 'Poupança', icon: '💰', description: 'Tradicional, sem IR. Rendimento limitado.', risk: 'Muito Baixo', color: 'orange' },
];

// Taxas de referência (atualizadas para o contexto atual)
const BASE_RATES = {
  SELIC: 10.50,
  CDI: 10.40,
  IPCA: 4.83,
};

interface SimResult {
  bruto: number;
  imposto: number;
  liquido: number;
  rendimento: number;
  taxaEfetiva: number;
}

function calcularRendimento(
  produto: ProductType,
  valorInicial: number,
  meses: number,
  taxaParam: number
): SimResult {
  let taxaAnual = 0;
  let aliquotaIR = 0;
  
  // Alíquota do IR por prazo (tabela regressiva)
  if (meses <= 6) aliquotaIR = 0.225;
  else if (meses <= 12) aliquotaIR = 0.20;
  else if (meses <= 24) aliquotaIR = 0.175;
  else aliquotaIR = 0.15;

  switch (produto) {
    case 'CDB':
      taxaAnual = (taxaParam / 100) * (BASE_RATES.CDI / 100);
      break;
    case 'TESOURO_SELIC':
      taxaAnual = BASE_RATES.SELIC / 100 + 0.0013; // taxa + 0.13%
      break;
    case 'TESOURO_IPCA':
      taxaAnual = BASE_RATES.IPCA / 100 + taxaParam / 100;
      break;
    case 'TESOURO_PRE':
      taxaAnual = taxaParam / 100;
      break;
    case 'LCI_LCA':
      taxaAnual = (taxaParam / 100) * (BASE_RATES.CDI / 100);
      aliquotaIR = 0; // isento
      break;
    case 'POUPANCA':
      // Poupança: 70% da SELIC quando SELIC > 8.5%
      taxaAnual = 0.70 * (BASE_RATES.SELIC / 100);
      aliquotaIR = 0; // isento
      break;
  }

  const taxaMensal = Math.pow(1 + taxaAnual, 1 / 12) - 1;
  const montanteBruto = valorInicial * Math.pow(1 + taxaMensal, meses);
  const rendimentoBruto = montanteBruto - valorInicial;
  const imposto = rendimentoBruto * aliquotaIR;
  const rendimentoLiquido = rendimentoBruto - imposto;
  const montanteLiquido = valorInicial + rendimentoLiquido;

  return {
    bruto: montanteBruto,
    imposto,
    liquido: montanteLiquido,
    rendimento: rendimentoLiquido,
    taxaEfetiva: (montanteLiquido / valorInicial - 1) * 100,
  };
}

const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function InvestmentsPage() {
  const [selected, setSelected] = useState<ProductType>('CDB');
  const [valor, setValor] = useState('10000');
  const [meses, setMeses] = useState('12');
  const [taxa, setTaxa] = useState('110'); // % do CDI ou taxa fixa

  const product = PRODUCTS.find(p => p.id === selected)!;
  const valorNum = parseFloat(valor.replace(',', '.')) || 0;
  const mesesNum = parseInt(meses) || 12;
  const taxaNum = parseFloat(taxa.replace(',', '.')) || 0;

  const result = calcularRendimento(selected, valorNum, mesesNum, taxaNum);

  // Comparação entre todos os produtos
  const comparisons = PRODUCTS.map(p => {
    const defaultTaxa = p.id === 'CDB' || p.id === 'LCI_LCA' ? 110 :
                       p.id === 'TESOURO_IPCA' ? 6.20 :
                       p.id === 'TESOURO_PRE' ? 12.50 : 0;
    const r = calcularRendimento(p.id, valorNum, mesesNum, defaultTaxa);
    return { ...p, result: r };
  }).sort((a, b) => b.result.liquido - a.result.liquido);

  const showTaxaInput = ['CDB', 'TESOURO_IPCA', 'TESOURO_PRE', 'LCI_LCA'].includes(selected);
  const taxaLabel = selected === 'CDB' || selected === 'LCI_LCA' ? '% do CDI' :
                   selected === 'TESOURO_IPCA' ? 'Taxa adicional (% a.a.)' : 'Taxa (% a.a.)';

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-1 flex items-center gap-3">
          <Landmark className="w-8 h-8 text-yellow-400" /> Simulador de Investimentos
        </h1>
        <p className="text-slate-400">Compare CDB, Tesouro Direto, LCI/LCA e Poupança lado a lado, já com desconto de IR.</p>
      </div>

      {/* Indicadores de Referência */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Taxa SELIC', value: `${BASE_RATES.SELIC}% a.a.` },
          { label: 'CDI', value: `${BASE_RATES.CDI}% a.a.` },
          { label: 'IPCA (12m)', value: `${BASE_RATES.IPCA}%` },
        ].map(ind => (
          <div key={ind.label} className="glass-panel p-4 rounded-xl text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{ind.label}</p>
            <p className="text-xl font-bold text-emerald-400">{ind.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Configuração */}
        <div className="lg:col-span-2 space-y-5">
          {/* Produto selector */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Escolha o Produto</h3>
            <div className="grid grid-cols-2 gap-2">
              {PRODUCTS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  className={`p-3 rounded-xl text-left transition-all ${
                    selected === p.id
                      ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-lg mb-0.5">{p.icon}</div>
                  <div className="font-bold text-xs leading-tight">{p.label}</div>
                </button>
              ))}
            </div>
            <div className="flex items-start gap-2 p-3 bg-slate-800/40 rounded-xl">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400">{product.description} <span className={`font-bold text-emerald-400`}>Risco: {product.risk}</span></p>
            </div>
          </div>

          {/* Parâmetros */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4 text-yellow-400" /> Parâmetros
            </h3>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Valor inicial (R$)</label>
              <input
                type="number"
                value={valor}
                onChange={e => setValor(e.target.value)}
                placeholder="Ex: 10000"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Período (meses)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={meses}
                  onChange={e => setMeses(e.target.value)}
                  min="1" max="360"
                  className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <div className="flex gap-1">
                  {[6, 12, 24, 36].map(m => (
                    <button key={m} onClick={() => setMeses(String(m))}
                      className={`px-2.5 py-2 rounded-lg text-xs font-bold transition-colors ${meses === String(m) ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {showTaxaInput && (
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">{taxaLabel}</label>
                <input
                  type="number"
                  value={taxa}
                  onChange={e => setTaxa(e.target.value)}
                  step="0.1"
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            )}
          </div>
        </div>

        {/* Resultado */}
        <div className="lg:col-span-3 space-y-5">
          {/* Card de Resultado Principal */}
          <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-emerald-900/30 to-slate-900/50 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-slate-200">Resultado — {product.icon} {product.label}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-800/50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Valor Final Líquido</p>
                <p className="text-2xl font-bold text-emerald-400">{formatBRL(result.liquido)}</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Rendimento Líquido</p>
                <p className="text-2xl font-bold text-yellow-400">+{formatBRL(result.rendimento)}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="text-center p-3 bg-slate-800/30 rounded-xl">
                <p className="text-xs text-slate-500 mb-0.5">Montante Bruto</p>
                <p className="font-bold text-slate-300">{formatBRL(result.bruto)}</p>
              </div>
              <div className="text-center p-3 bg-slate-800/30 rounded-xl">
                <p className="text-xs text-slate-500 mb-0.5">Imposto de Renda</p>
                <p className="font-bold text-red-400">{result.imposto > 0 ? `-${formatBRL(result.imposto)}` : 'Isento ✓'}</p>
              </div>
              <div className="text-center p-3 bg-slate-800/30 rounded-xl">
                <p className="text-xs text-slate-500 mb-0.5">Retorno Efetivo</p>
                <p className="font-bold text-emerald-400">+{result.taxaEfetiva.toFixed(2)}%</p>
              </div>
            </div>
          </div>

          {/* Tabela de Comparação */}
          <div className="glass-panel p-5 rounded-2xl">
            <h3 className="font-bold text-slate-200 text-sm mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-yellow-400" /> Ranking dos Produtos (mesmo período e valor)
            </h3>
            <div className="space-y-2">
              {comparisons.map((p, i) => (
                <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                  p.id === selected ? 'bg-emerald-600/15 border border-emerald-500/30' : 'bg-slate-800/40'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                      i === 0 ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-400'
                    }`}>{i + 1}</span>
                    <span className="text-base">{p.icon}</span>
                    <span className={`font-medium text-sm ${p.id === selected ? 'text-emerald-300' : 'text-slate-300'}`}>{p.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400 text-sm">{formatBRL(p.result.liquido)}</p>
                    <p className="text-xs text-slate-500">+{formatBRL(p.result.rendimento)}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-600 mt-3 text-center">
              ⚠️ Simulação com taxas de referência. Consulte condições reais antes de investir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
