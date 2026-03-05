import { Router } from 'express';
import { CreateTransactionUseCase } from '../../../application/use-cases/CreateTransactionUseCase';
import { PrismaTransactionRepository } from '../../database/PrismaTransactionRepository';
import { PrismaUserRepository } from '../../database/PrismaUserRepository';
import { CreateTransactionController } from '../controllers/CreateTransactionController';

const transactionRoutes = Router();

const prismaTransactionRepository = new PrismaTransactionRepository();
const prismaUserRepository = new PrismaUserRepository();
const createTransactionUseCase = new CreateTransactionUseCase(prismaTransactionRepository, prismaUserRepository);
const createTransactionController = new CreateTransactionController(createTransactionUseCase);

transactionRoutes.post('/', (request, response) => {
  return createTransactionController.handle(request, response);
});

export { transactionRoutes };
