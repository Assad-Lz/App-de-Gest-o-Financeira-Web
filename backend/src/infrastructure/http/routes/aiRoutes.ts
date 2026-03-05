import { Router, Request, Response } from 'express';
import { GenerateFinancialAdviceUseCase } from '../../../application/use-cases/GenerateFinancialAdviceUseCase';
import { PrismaTransactionRepository } from '../../database/PrismaTransactionRepository';
import { GeminiAiAssistantProvider } from '../../providers/GeminiAiAssistantProvider';
import { GenerateFinancialAdviceController } from '../controllers/GenerateFinancialAdviceController';

const aiRoutes = Router();

// Injeções
const prismaTransactionRepository = new PrismaTransactionRepository();
const geminiAiProvider = new GeminiAiAssistantProvider();
const generateFinancialAdviceUseCase = new GenerateFinancialAdviceUseCase(prismaTransactionRepository, geminiAiProvider);
const generateFinancialAdviceController = new GenerateFinancialAdviceController(generateFinancialAdviceUseCase);

// Rota GET original de dica pontual baseada no userId
aiRoutes.get('/advice/:userId', (request, response) => {
  return generateFinancialAdviceController.handle(request, response);
});

// Rota POST de chat conversacional — aceita histórico, intenção e contexto financeiro
aiRoutes.post('/chat', async (request: Request, response: Response) => {
  const { message, history = [], userName, intent, financialContext } = request.body as {
    message: string;
    history: { role: 'user' | 'model'; content: string }[];
    userName?: string;
    intent?: string;
    financialContext?: {
      saldo?: number;
      receitaMensal?: number;
      despesaMensal?: number;
      maiorCategoria?: string;
      economiaPerc?: number;
    };
  };

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return response.status(400).json({ error: 'Campo "message" é obrigatório.' });
  }

  try {
    // Injetar o contexto financeiro e intenção no prompt para respostas mais precisas
    let contextualMessage = message.trim();

    if (financialContext && Object.keys(financialContext).length > 0) {
      const ctx = financialContext;
      const contextInfo = `[Contexto financeiro do usuário no FinEasy: Saldo atual: R$ ${ctx.saldo?.toFixed(2) ?? 'N/A'} | Receita mensal: R$ ${ctx.receitaMensal ?? 'N/A'} | Despesas mensais: R$ ${ctx.despesaMensal ?? 'N/A'} | Maior categoria de gasto: ${ctx.maiorCategoria ?? 'N/A'} | Taxa de economia: ${ctx.economiaPerc ?? 'N/A'}%]\n\n`;
      contextualMessage = contextInfo + message.trim();
    }

    if (intent) {
      contextualMessage += `\n\n[Intenção detectada: ${intent}. ${
        intent === 'investment' ? 'Priorize dados concretos sobre rendimentos, riscos e comparativos.' :
        intent === 'expense' ? 'Foque em análise de gastos e sugestões de economia.' :
        intent === 'planning' ? 'Aborde planejamento de longo prazo e metas financeiras.' :
        intent === 'question' ? 'Responda de forma didática e completa.' :
        'Seja conciso e natural.'
      }]`;
    }

    const reply = await geminiAiProvider.chat(contextualMessage, history, userName);
    return response.status(200).json({ reply });
  } catch (error) {
    console.error('Erro no endpoint /ai/chat:', error);
    return response.status(500).json({ error: 'Falha interna ao processar o chat.' });
  }
});

export { aiRoutes };
