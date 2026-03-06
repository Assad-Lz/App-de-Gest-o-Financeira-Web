'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Bot, User, Sparkles, RefreshCw, Copy, ThumbsUp, ThumbsDown,
  CheckCheck, TrendingUp, BookOpen, Heart, HelpCircle, DollarSign, Zap
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageFeedback = 'up' | 'down' | null;
type IntentCategory = 'investment' | 'expense' | 'planning' | 'greeting' | 'thanks' | 'question' | 'general';
type ConversationState = 'greeting' | 'asking_name' | 'chatting';

type Message = {
  id: string;
  role: 'ai' | 'user';
  content: string;
  feedback?: MessageFeedback;
  intent?: IntentCategory;
  timestamp: Date;
  isTyping?: boolean;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const STORAGE_KEY = 'fineasy_chat_history';
const STORAGE_NAME_KEY = 'fineasy_user_name';

// ─── 1. Detecção de intenção ─────────────────────────────────────────────────
const detectIntent = (text: string): IntentCategory => {
  const t = text.toLowerCase();
  if (/obrigad|valeu|gratid|thanks|agradeço/.test(t)) return 'thanks';
  if (/oi|olá|ola|bom dia|boa tarde|boa noite|tudo bem|e aí|eai/.test(t)) return 'greeting';
  if (/cdb|tesouro|lci|lca|poupança|fundo|ação|ações|fii|investir|rendimento|selic|cdi/.test(t)) return 'investment';
  if (/gasto|despesa|conta|divida|dívida|cartão|salario|salário|receita|renda/.test(t)) return 'expense';
  if (/planejar|meta|objetivo|reserva|emergência|aposentadoria|futuro/.test(t)) return 'planning';
  if (/[?]|como|qual|quando|onde|por que|porque|quanto|posso|devo/.test(t)) return 'question';
  return 'general';
};

const intentConfig: Record<IntentCategory, { icon: React.ReactNode; color: string; label: string }> = {
  investment: { icon: <TrendingUp className="w-3 h-3" />, color: 'emerald', label: 'Investimento' },
  expense: { icon: <DollarSign className="w-3 h-3" />, color: 'yellow', label: 'Finanças' },
  planning: { icon: <BookOpen className="w-3 h-3" />, color: 'blue', label: 'Planejamento' },
  greeting: { icon: <Heart className="w-3 h-3" />, color: 'pink', label: 'Saudação' },
  thanks: { icon: <Heart className="w-3 h-3" />, color: 'pink', label: 'Agradecimento' },
  question: { icon: <HelpCircle className="w-3 h-3" />, color: 'purple', label: 'Pergunta' },
  general: { icon: <Zap className="w-3 h-3" />, color: 'slate', label: 'Geral' },
};

// ─── 2. Respostas offline para saudações e agradecimentos ────────────────────
const getOfflineResponse = (text: string, name?: string): string | null => {
  const t = text.toLowerCase().trim();
  const n = name ? `, ${name}` : '';

  if (/^(obrigad[oa]|valeu|obg|vlw|muito obrigad[oa]|thanks|grata?|agradeço)([!.]*)$/.test(t)) {
    const respostas = [
      `Fico feliz em ajudar${n}! 😊 Se tiver mais alguma dúvida, pode perguntar à vontade.`,
      `Disponha${n}! Estou aqui sempre que precisar de orientação financeira. 💚`,
      `Por nada${n}! É um prazer ser sua consultora FinEasy. Alguma outra dúvida?`,
    ];
    return respostas[Math.floor(Math.random() * respostas.length)];
  }

  if (/^(oi|olá|ola|hello|hey|e ?aí|eai)([!.]*)$/.test(t)) {
    const respostas = [
      `Olá${n}! 👋 Que bom te ver por aqui! Em que posso te ajudar hoje?`,
      `Oi${n}! 😊 Pronta para te ajudar com suas finanças. O que você precisa?`,
    ];
    return respostas[Math.floor(Math.random() * respostas.length)];
  }

  if (/tudo bem|como vai|como você (tá|está)|que tal/.test(t)) {
    return `Estou muito bem${n}, funcionando a todo vapor para te ajudar! 🚀 E você, como estão as suas finanças?`;
  }

  if (/^(ok|certo|entendi|beleza|blz|legal|ótimo|otimo|perfeito)([!.]*)$/.test(t)) {
    return `Perfeito${n}! Se surgir qualquer dúvida, é só chamar. 😊`;
  }

  return null;
};

// ─── 3. Quick actions dinâmicos por contexto ─────────────────────────────────
const getQuickActions = (lastIntent?: IntentCategory): string[] => {
  if (lastIntent === 'investment') return [
    'Qual a diferença entre CDB e LCI?', 'Quanto rende R$5.000 no Tesouro SELIC em 1 ano?', 'O que é FGC e qual o limite?', 'Como diversificar com pouco dinheiro?'
  ];
  if (lastIntent === 'expense') return [
    'Como montar um orçamento mensal?', 'Quanto devo guardar de reserva de emergência?', 'Como reduzir gastos com cartão?', 'Regra 50-30-20, o que é?'
  ];
  if (lastIntent === 'planning') return [
    'Como me aposentar mais cedo?', 'O que é FIRE e como funciona?', 'Como criar uma reserva de emergência?', 'Qual o melhor investimento para longo prazo?'
  ];
  return [
    'Comparar CDB vs Tesouro Direto', 'Analisar minha reserva de emergência', 'Simular rendimento de R$10.000', 'Dicas para investir com R$500/mês'
  ];
};

// ─── Extração inteligente de nome ────────────────────────────────────────────
const extractName = (text: string): string => {
  const patterns = [
    /(?:pode(?:m)?(?:\s+me)?\s+chamar(?:\s+de)?|me\s+chame?\s+de|meu\s+nome\s+[eé]|pode\s+chamar\s+de|chame(?:[-\s]me)?\s+de|sou\s+(?:o|a)?\s*)\s+([a-záàâãéèêíïóôõöúüç]+)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1];
  }
  const stopWords = new Set(['de', 'da', 'do', 'me', 'um', 'uma', 'o', 'a', 'e', 'é', 'as', 'os', 'pode', 'chamar', 'chame', 'meu', 'nome']);
  const words = text.trim().split(/\s+/).filter(w => !stopWords.has(w.toLowerCase()));
  return words[words.length - 1] || text.trim();
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function AIConsultantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>('greeting');
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastIntent, setLastIntent] = useState<IntentCategory | undefined>(undefined);
  const [isStreaming, setIsStreaming] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ─── 4. Histórico persistente no localStorage ──────────────────────────────
  useEffect(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    const savedName = localStorage.getItem(STORAGE_NAME_KEY);

    if (savedMessages && savedName) {
      try {
        const parsed: Message[] = JSON.parse(savedMessages).map((m: Message) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        setMessages(parsed);
        setUserName(savedName);
        setConversationState('chatting');
        // Reconstruir chatHistory
        const hist = parsed
          .filter(m => !m.isTyping)
          .map(m => ({ role: m.role === 'ai' ? 'model' as const : 'user' as const, content: m.content }));
        setChatHistory(hist);
        return;
      } catch {}
    }

    // Nova conversa: mensagem de boas-vindas
    const introMsg: Message = {
      id: 'intro',
      role: 'ai',
      content: '✨ Olá! Eu sou a **FinIA**, sua consultora de inteligência artificial do FinEasy.\n\nEstou aqui para te ajudar com análise de gastos, investimentos (CDB, Tesouro Direto, Ações e muito mais), planejamento financeiro e qualquer dúvida sobre o mundo das finanças.\n\nAntes de começarmos... como posso te chamar? 😊',
      timestamp: new Date(),
    };
    setMessages([introMsg]);
    setConversationState('asking_name');
    setTimeout(() => inputRef.current?.focus(), 400);
  }, []);

  // Salvar histórico ao atualizar mensagens
  useEffect(() => {
    if (messages.length > 0 && conversationState === 'chatting') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.filter(m => !m.isTyping)));
      if (userName) localStorage.setItem(STORAGE_NAME_KEY, userName);
    }
  }, [messages, conversationState, userName]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addMessage = (role: 'ai' | 'user', content: string, extras?: Partial<Message>): Message => {
    const msg: Message = { id: Date.now().toString() + Math.random(), role, content, timestamp: new Date(), ...extras };
    setMessages(prev => [...prev, msg]);
    return msg;
  };

  // ─── 5. Efeito de digitação letra por letra ────────────────────────────────
  const streamMessage = useCallback(async (text: string, extras?: Partial<Message>) => {
    const id = Date.now().toString() + Math.random();
    const baseMsg: Message = { id, role: 'ai', content: '', timestamp: new Date(), ...extras };
    setMessages(prev => [...prev, baseMsg]);
    setIsStreaming(true);

    let current = '';
    const chars = text.split('');
    // Velocidade adaptativa: textos longos são mais rápidos
    const delay = text.length > 200 ? 8 : 18;

    for (const char of chars) {
      current += char;
      const snapshot = current;
      setMessages(prev => prev.map(m => m.id === id ? { ...m, content: snapshot } : m));
      await new Promise(r => setTimeout(r, delay));
    }
    setIsStreaming(false);
    return id;
  }, []);

  // ─── 6. Feedback por mensagem ──────────────────────────────────────────────
  const handleFeedback = (msgId: string, feedback: MessageFeedback) => {
    setMessages(prev => prev.map(m => m.id === msgId && m.role === 'ai' ? { ...m, feedback } : m));
  };

  // ─── 7. Copiar resposta ────────────────────────────────────────────────────
  const handleCopy = async (msgId: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_NAME_KEY);
    setMessages([]);
    setChatHistory([]);
    setUserName(undefined);
    setConversationState('greeting');
    setLastIntent(undefined);
    
    // Pequeno delay para garantir que o estado seja limpo antes da nova intro
    setTimeout(() => {
      const introMsg: Message = {
        id: 'intro-reset-' + Date.now(),
        role: 'ai',
        content: '✨ Conversa reiniciada! Eu sou a **FinIA**. Como posso te chamar? 😊',
        timestamp: new Date(),
      };
      setMessages([introMsg]);
      setConversationState('asking_name');
      inputRef.current?.focus();
    }, 150);
  };

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || isStreaming) return;

    const userText = input.trim();
    setInput('');
    setIsTyping(true);

    const intent = detectIntent(userText);
    setLastIntent(intent);

    // Adicionar mensagem do usuário
    addMessage('user', userText, { intent });

    // ─── Estado: aguardando nome ─────────────────────────────────────────────
    if (conversationState === 'asking_name') {
      const rawName = extractName(userText);
      const capitalizedName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
      setUserName(capitalizedName);
      setConversationState('chatting');

      const reply = `Prazer em te conhecer, **${capitalizedName}**! 🎉\n\nAgora que nos apresentamos, posso te ajudar com tudo sobre finanças. Pode perguntar sobre seus gastos, comparar investimentos, simular rendimentos ou pedir dicas personalizadas.\n\nO que você gostaria de explorar hoje?`;

      setTimeout(async () => {
        await streamMessage(reply, { intent: 'greeting' });
        setChatHistory([
          { role: 'user', content: userText },
          { role: 'model', content: reply },
        ]);
        setIsTyping(false);
      }, 500);
      return;
    }

    // ─── 8. Respostas offline para saudações/agradecimentos ─────────────────
    const offlineReply = getOfflineResponse(userText, userName);
    if (offlineReply) {
      await streamMessage(offlineReply, { intent });
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: userText },
        { role: 'model', content: offlineReply },
      ]);
      setIsTyping(false);
      return;
    }

    // ─── Chamada ao backend Gemini ───────────────────────────────────────────
    const newHistory = [...chatHistory, { role: 'user' as const, content: userText }];

    // ─── 9. Contexto financeiro do usuário enviado ao backend ────────────────
    const userFinancialContext = {
      saldo: 15340.50,
      receitaMensal: 8500,
      despesaMensal: 5430,
      maiorCategoria: 'Moradia',
      economiaPerc: 36.1,
    };

    try {
      const response = await fetch(`${BACKEND_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: chatHistory,
          userName,
          intent,
          financialContext: userFinancialContext,
        }),
      });

      let aiText = 'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?';
      if (response.ok) {
        const data = await response.json();
        aiText = data.reply || aiText;
      }

      await streamMessage(aiText, { intent });
      setChatHistory([...newHistory, { role: 'model', content: aiText }]);
    } catch {
      await streamMessage('Não consegui me conectar ao servidor de IA. Verifique se o backend está rodando.', { intent: 'general' });
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, isStreaming, conversationState, chatHistory, userName, streamMessage]);

  // ─── Renderiza markdown básico (bold, itálico) ────────────────────────────
  const renderContent = (text: string) => {
    return text.split(/(\*\*[^*]+\*\*|_[^_]+_)/).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
      if (part.startsWith('_') && part.endsWith('_')) return <em key={i}>{part.slice(1, -1)}</em>;
      return <span key={i}>{part}</span>;
    });
  };

  const quickActions = getQuickActions(lastIntent);

  return (
    <div className="fixed inset-0 top-16 z-[30] bg-[#020617] flex flex-col lg:static lg:z-auto lg:bg-transparent lg:h-[calc(100vh-96px)] max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="px-5 py-3 lg:px-0 lg:py-0 lg:mb-4 flex items-center justify-between bg-slate-900/30 lg:bg-transparent border-b border-white/5 lg:border-none shrink-0 shadow-sm lg:shadow-none">
        <div>
          <h1 className="text-lg lg:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 lg:w-7 lg:h-7 text-emerald-400" /> FinIA Consultoria
          </h1>
          <p className="text-slate-400 mt-0.5 text-[10px] lg:text-sm">
            {userName ? `Olá, ${userName}! Sua consultora pronta. ✨` : 'Nossa IA financeira generativa.'}
          </p>
        </div>
        <button onClick={handleReset} title="Nova conversa" className="p-2 lg:p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 transition-colors border border-slate-700">
          <RefreshCw className="w-4 h-4 lg:w-5 lg:h-5" />
        </button>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col overflow-hidden lg:glass-panel lg:rounded-2xl lg:border lg:border-emerald-900/10 bg-transparent relative">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none lg:hidden" />
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-700/50 relative z-10 pb-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 group ${msg.role === 'user' ? 'max-w-[80%] ml-auto flex-row-reverse' : 'max-w-[90%]'}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.role === 'ai'
                  ? 'bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                {msg.role === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className="flex flex-col gap-1 min-w-0 flex-1">
                {/* ─── 10. Badge de categoria/intenção ──────────────────────── */}
                {msg.role === 'user' && msg.intent && msg.intent !== 'general' && (
                  <div className={`flex items-center gap-1 text-${intentConfig[msg.intent].color}-400 text-[10px] font-bold self-end mb-0.5`}>
                    {intentConfig[msg.intent].icon}
                    <span>{intentConfig[msg.intent].label}</span>
                  </div>
                )}

                {/* Bubble */}
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line break-words shadow-sm ${
                  msg.role === 'ai'
                    ? 'bg-slate-800/80 text-slate-200 border border-emerald-500/10 rounded-tl-none mr-4'
                    : 'bg-emerald-600 text-white rounded-tr-none ml-4'
                }`}>
                  {renderContent(msg.content)}
                  {msg.role === 'ai' && isStreaming && messages[messages.length - 1]?.id === msg.id && (
                    <span className="inline-block w-1.5 h-4 bg-emerald-400 ml-0.5 animate-pulse rounded-sm align-middle" />
                  )}
                </div>

                {/* Timestamp + Ações (só em mensagens da IA) */}
                {msg.role === 'ai' && !msg.isTyping && msg.id !== 'intro' && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                    <span className="text-[10px] text-slate-600">
                      {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {/* Copiar */}
                    <button onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                      title="Copiar">
                      {copiedId === msg.id ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    {/* Feedback */}
                    <button onClick={() => handleFeedback(msg.id, msg.feedback === 'up' ? null : 'up')}
                      className={`p-1 rounded-lg transition-colors ${msg.feedback === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-800'}`}
                      title="Resposta útil">
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleFeedback(msg.id, msg.feedback === 'down' ? null : 'down')}
                      className={`p-1 rounded-lg transition-colors ${msg.feedback === 'down' ? 'text-red-400 bg-red-500/10' : 'text-slate-500 hover:text-red-400 hover:bg-slate-800'}`}
                      title="Resposta não útil">
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Indicador de digitação da IA */}
          {isTyping && !isStreaming && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-3.5 rounded-2xl bg-slate-800/80 border border-emerald-500/10 rounded-tl-none flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Actions dinâmicos */}
        {conversationState === 'chatting' && (
          <div className="px-4 py-3 flex gap-2 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden border-t border-white/5 bg-slate-900/50 lg:bg-transparent relative z-10">
            {quickActions.map(q => (
              <button key={q} onClick={() => setInput(q)}
                className="text-[10px] lg:text-xs px-4 py-2 rounded-full bg-slate-800 text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors border border-slate-700 shrink-0 font-medium shadow-sm">
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 lg:p-4 bg-[#020617] lg:bg-slate-900/40 border-t border-white/5 lg:border-slate-800/60 relative z-10 pb-[max(1rem,env(safe-area-inset-bottom))] lg:pb-4">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={conversationState === 'asking_name' ? 'Digite seu nome...' : 'Mensagem para a FinIA...'}
              className="w-full bg-slate-900 lg:bg-slate-800/80 border border-white/10 lg:border-slate-700 text-slate-200 pl-4 pr-14 py-3.5 lg:py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-500 text-sm lg:text-base shadow-inner"
              disabled={isStreaming}
            />
            <button type="submit" disabled={!input.trim() || isTyping || isStreaming}
              className="absolute right-2 p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg shadow-emerald-600/20">
              <Send className="w-4 h-4 lg:w-5 lg:h-5 ml-0.5" />
            </button>
          </form>
          <p className="text-center mt-2.5 text-[9px] lg:text-[11px] text-slate-500 px-4">
            A FinIA pode apresentar informações imprecisas. Valide os dados antes de investir.
          </p>
        </div>
      </div>
    </div>
  );
}
