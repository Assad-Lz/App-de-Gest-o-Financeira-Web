'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import gsap from 'gsap';

type Message = {
  id: string;
  role: 'ai' | 'user';
  content: string;
};

const initialMessages: Message[] = [
  { id: '1', role: 'ai', content: 'Olá! Sou a IA Generativa do FinEasy. Notei pelos seus dados inseridos que houveram gastos excessivos com Alimentação neste mês. Como posso te ajudar a gerenciar melhor seu patrimônio hoje?' }
];

export default function AIConsultantPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Entrance Animation
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, scale: 0.98 }, 
        { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, []);

  useEffect(() => {
    // Auto-scroll para a última mensagem
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    const userInput = input;
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Chama o backend Node.js que aciona o Gemini 1.5 Flash
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/ai/advice/demo`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      let aiText = 'Houve um problema ao consultar a IA. Tente novamente.';
      if (response.ok) {
        const data = await response.json();
        aiText = data.advice || aiText;
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: aiText,
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'Não consegui me conectar ao servidor de IA no momento. Verifique se o backend está rodando em localhost:3001.',
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto gs-reveal" ref={containerRef}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-emerald-400" /> Consultoria IA FinEasy
          </h1>
          <p className="text-slate-400 mt-1">Converse com nosso modelo de linguagem tunado em seus dados financeiros.</p>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden border-emerald-900/10 h-[calc(100vh-140px)]">
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
               
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                 {msg.role === 'ai' ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
               </div>
               
               <div className={`px-5 py-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'ai' ? 'bg-slate-800/80 text-slate-200 border border-emerald-500/10 rounded-tl-none shadow-sm shadow-emerald-900/5' : 'bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-600/10'}`}>
                 <p>{msg.content}</p>
               </div>
            </div>
          ))}

          {isTyping && (
             <div className="flex gap-4 max-w-[85%]">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                 <Bot className="w-6 h-6" />
               </div>
               <div className="px-5 py-4 rounded-2xl bg-slate-800/80 text-slate-200 border border-emerald-500/10 rounded-tl-none flex items-center gap-1.5 h-12">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
               </div>
             </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900/40 border-t border-slate-800/60 backdrop-blur-md">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre seus investimentos, análises e onde cortar gastos..."
              className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 pl-5 pr-14 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-500"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
              className="absolute right-2 p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-600/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="text-center mt-3">
            <p className="text-[11px] text-slate-500 font-medium">A Inteligência Artificial "FinEasy" pode cometer erros de cálculo. Sempre valide com seus extratos reais.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
