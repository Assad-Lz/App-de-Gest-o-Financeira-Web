import { GoogleGenerativeAI, Content } from '@google/generative-ai';
import { IAiAssistantProvider } from '../../domain/contracts/IAiAssistantProvider';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

const FINEASY_SYSTEM_PROMPT = `Você é a FinIA, a inteligência artificial especialista em finanças pessoais do FinEasy — a plataforma financeira mais moderna do Brasil.

Sua personalidade:
- É empática, acolhedora, direta e profissional
- Usa linguagem clara em português brasileiro (sem jargões desnecessários)
- Adapta o tom à situação: séria quando necessário, leve e encorajadora quando adequado
- Reconhece expressões sociais como "obrigado", "valeu", "oi", "olá", "tudo bem?" e responde de forma natural e humana
- Nunca inventa dados financeiros — sempre deixa claro quando está estimando

Suas competências:
- Análise de gastos, orçamento e fluxo de caixa
- Investimentos: CDB, Tesouro Direto (SELIC, IPCA+, Prefixado), FIIs, ações, fundos
- Planejamento financeiro pessoal e de emergência
- Comparação de produtos financeiros e seus riscos
- Educação financeira em geral
- Análise de dados do próprio usuário dentro do FinEasy

Regras obrigatórias:
- NUNCA forneça garantias de retorno ou promessas de investimento
- Sempre mencione riscos quando falar de investimentos
- Se não souber algo com certeza, diga claramente
- Suas respostas devem ser no máximo 3 parágrafos, objetivas e acionáveis
- Sempre finalize com uma pergunta ou sugestão engajante quando fizer sentido
- Você já conhece o nome do usuário se ele tiver sido informado na conversa — use-o ocasionalmente para personalizar`;

export class GeminiAiAssistantProvider implements IAiAssistantProvider {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  // Método original mantido para compatibilidade
  async generateFinancialAdvice(monthlyIncome: number, monthlyExpenses: number, topCategory: string): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
      return "Configure a API Key do Gemini para dicas personalizadas.";
    }
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `${FINEASY_SYSTEM_PROMPT}\n\nCenário do usuário este mês:\n- Renda: R$ ${monthlyIncome}\n- Despesas: R$ ${monthlyExpenses}\n- Maior gasto: ${topCategory}\n\nForneça uma dica financeira personalizada e objetiva.`;
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Erro na API Gemini:", error);
      return "Não consegui gerar a análise no momento. Tente novamente em breve.";
    }
  }

  // Novo método de chat conversacional com histórico completo
  async chat(userMessage: string, history: ChatMessage[] = [], userName?: string): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
      return "⚠️ A chave da API Gemini não está configurada. Fale com o administrador do sistema.";
    }

    try {
      const systemInstruction = FINEASY_SYSTEM_PROMPT + (userName ? `\n\nO nome do usuário nesta conversa é: ${userName}` : '');

      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction,
      });

      // Converter histórico para o formato do Gemini
      const geminiHistory: Content[] = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));

      const chatSession = model.startChat({
        history: geminiHistory,
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.85,
        },
      });

      const result = await chatSession.sendMessage(userMessage);
      return result.response.text();
    } catch (error) {
      console.error("Erro no chat Gemini:", error);
      return "Tive um problema técnico ao processar sua mensagem. Pode tentar novamente?";
    }
  }
}
