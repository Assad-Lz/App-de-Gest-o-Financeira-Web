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

// Rota POST de chat conversacional — aceita histórico e mensagem do usuário
aiRoutes.post('/chat', async (request: Request, response: Response) => {
  const { message, history = [], userName } = request.body as {
    message: string;
    history: { role: 'user' | 'model'; content: string }[];
    userName?: string;
  };

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return response.status(400).json({ error: 'Campo "message" é obrigatório.' });
  }

  try {
    const reply = await geminiAiProvider.chat(message.trim(), history, userName);
    return response.status(200).json({ reply });
  } catch (error) {
    console.error('Erro no endpoint /ai/chat:', error);
    return response.status(500).json({ error: 'Falha interna ao processar o chat.' });
  }
});

export { aiRoutes };
