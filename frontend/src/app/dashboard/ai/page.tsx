'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react';

type Message = {
  id: string;
  role: 'ai' | 'user';
  content: string;
};

type ConversationState = 'greeting' | 'asking_name' | 'chatting';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AIConsultantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>('greeting');
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; content: string }[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mensagem inicial da FinIA
  useEffect(() => {
    setMessages([
      {
        id: 'intro',
        role: 'ai',
        content: '✨ Olá! Eu sou a **FinIA**, sua consultora de inteligência artificial do FinEasy.\n\nEstou aqui para te ajudar com análise de gastos, investimentos (CDB, Tesouro Direto, Ações e muito mais), planejamento financeiro e qualquer dúvida sobre o mundo das finanças.\n\nAntes de começarmos... como posso te chamar? 😊',
      },
    ]);
    setConversationState('asking_name');
    setTimeout(() => inputRef.current?.focus(), 400);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addMessage = (role: 'ai' | 'user', content: string): Message => {
    const msg: Message = { id: Date.now().toString() + Math.random(), role, content };
    setMessages(prev => [...prev, msg]);
    return msg;
  };

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput('');
    setIsTyping(true);

    // Adicionar mensagem do usuário
    addMessage('user', userText);

    // Estado: aguardando nome
    if (conversationState === 'asking_name') {
      const name = userText.split(' ')[0];
      const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      setUserName(capitalizedName);
      setConversationState('chatting');

      setTimeout(() => {
        addMessage('ai',
          `Prazer em te conhecer, **${capitalizedName}**! 🎉\n\nAgora que nos apresentamos, posso te ajudar com tudo sobre finanças. Pode perguntar sobre seus gastos, comparar investimentos, simular rendimentos ou pedir dicas personalizadas.\n\nO que você gostaria de explorar hoje?`
        );
        setChatHistory(prev => [
          ...prev,
          { role: 'user', content: userText },
          { role: 'model', content: `Prazer em te conhecer, ${capitalizedName}! Agora que nos apresentamos, estou pronto para ajudar.` },
        ]);
        setIsTyping(false);
      }, 800);
      return;
    }

    // Estado: conversa normal — chamar o backend Gemini
    const newHistory = [...chatHistory, { role: 'user' as const, content: userText }];

    try {
      const response = await fetch(`${BACKEND_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: chatHistory,
          userName,
        }),
      });

      let aiText = 'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?';
      if (response.ok) {
        const data = await response.json();
        aiText = data.reply || aiText;
      }

      addMessage('ai', aiText);
      setChatHistory([...newHistory, { role: 'model', content: aiText }]);
    } catch {
      addMessage('ai', 'Não consegui me conectar ao servidor de IA. Verifique se o backend está rodando em localhost:3001.');
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, conversationState, chatHistory, userName]);

  const handleReset = () => {
    setMessages([]);
    setChatHistory([]);
    setUserName(undefined);
    setConversationState('greeting');
    setTimeout(() => {
      setMessages([
        {
          id: 'intro-reset',
          role: 'ai',
          content: '✨ Olá novamente! Vamos recomeçar. Como posso te chamar? 😊',
        },
      ]);
      setConversationState('asking_name');
    }, 100);
  };

  // Renderiza o conteúdo com suporte a **bold**
  const renderContent = (text: string) => {
    return text.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-emerald-400" /> FinIA Consultoria
          </h1>
          <p className="text-slate-400 mt-1">
            {userName
              ? `Olá, ${userName}! Sua consultora de IA pessoal está pronta.`
              : 'Sua consultora financeira com IA generativa avançada.'}
          </p>
        </div>
        <button
          onClick={handleReset}
          title="Reiniciar conversa"
          className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Container */}
      <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden border border-emerald-900/10 h-[calc(100vh-200px)]">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-700/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'max-w-[80%] ml-auto flex-row-reverse' : 'max-w-[85%]'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                msg.role === 'ai'
                  ? 'bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                {msg.role === 'ai' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div className={`px-4 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                msg.role === 'ai'
                  ? 'bg-slate-800/80 text-slate-200 border border-emerald-500/10 rounded-tl-none'
                  : 'bg-emerald-600 text-white rounded-tr-none'
              }`}>
                {renderContent(msg.content)}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="px-4 py-4 rounded-2xl bg-slate-800/80 border border-emerald-500/10 rounded-tl-none flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Actions */}
        {conversationState === 'chatting' && (
          <div className="px-4 py-2 flex gap-2 flex-wrap border-t border-slate-800/40">
            {['📊 Analisar meus gastos', '💰 Comparar CDB vs Tesouro', '📈 Simular investimento', '🎯 Planejar reserva de emergência'].map(q => (
              <button
                key={q}
                onClick={() => setInput(q.replace(/^[^\s]+\s/, ''))}
                className="text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-slate-700/80 transition-colors border border-slate-700/60"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-slate-900/40 border-t border-slate-800/60 backdrop-blur-md">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={
                conversationState === 'asking_name'
                  ? 'Digite seu nome...'
                  : 'Pergunte sobre investimentos, gastos, planejamento...'
              }
              className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 pl-5 pr-14 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-600/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-center mt-2 text-[11px] text-slate-500">
            FinIA pode cometer erros. Sempre valide decisões financeiras importantes com um profissional.
          </p>
        </div>
      </div>
    </div>
  );
}
