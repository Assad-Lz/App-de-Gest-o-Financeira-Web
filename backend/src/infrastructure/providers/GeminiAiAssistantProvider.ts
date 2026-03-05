import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAiAssistantProvider } from '../../domain/contracts/IAiAssistantProvider';

export class GeminiAiAssistantProvider implements IAiAssistantProvider {
  private genAI: GoogleGenerativeAI;

  constructor() {
    // A API KEY virá das variáveis de ambiente na Vercel / Render
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async generateFinancialAdvice(monthlyIncome: number, monthlyExpenses: number, topCategory: string): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
      return "Para dicas personalizadas, configure a API Key do Gemini no ambiente da aplicação.";
    }

    try {
      // Usando o modelo genérico gemini-1.5-flash ou pro
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Você é um consultor financeiro especialista. Analise o seguinte cenário financeiro do usuário neste mês:
      - Renda Mensal Total: R$ ${monthlyIncome}
      - Despesas Totais: R$ ${monthlyExpenses}
      - Categoria com maior gasto: ${topCategory}

      Forneça 1 ou 2 parágrafos amigáveis de dica financeira construtiva, focando em melhorar a saúde financeira ou parabenizando se o saldo for positivo. Seja conciso e direto.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Erro na API Generativa Gemini:", error);
      return "Houve um problema ao gerar sua conselhor financeiro no momento. Tente novamente mais tarde.";
    }
  }
}
