import { Router } from 'express';
import { GenerateFinancialAdviceUseCase } from '../../../application/use-cases/GenerateFinancialAdviceUseCase';
import { PrismaTransactionRepository } from '../../database/PrismaTransactionRepository';
import { GeminiAiAssistantProvider } from '../../providers/GeminiAiAssistantProvider';
import { GenerateFinancialAdviceController } from '../controllers/GenerateFinancialAdviceController';

const aiRoutes = Router();

// Injeções Isoladas para o Módulo de IA
const prismaTransactionRepository = new PrismaTransactionRepository();
const geminiAiProvider = new GeminiAiAssistantProvider();
const generateFinancialAdviceUseCase = new GenerateFinancialAdviceUseCase(prismaTransactionRepository, geminiAiProvider);
const generateFinancialAdviceController = new GenerateFinancialAdviceController(generateFinancialAdviceUseCase);

// Rota GET usando o ID como parametro para o MVP (no futuro pegará pelo JWT)
aiRoutes.get('/advice/:userId', (request, response) => {
  return generateFinancialAdviceController.handle(request, response);
});

export { aiRoutes };
