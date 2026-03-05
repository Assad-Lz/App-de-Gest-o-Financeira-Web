import { Router } from 'express';
import { CreateTransactionUseCase } from '../../../application/use-cases/CreateTransactionUseCase';
import { GetUserTransactionsUseCase } from '../../../application/use-cases/GetUserTransactionsUseCase';
import { PrismaTransactionRepository } from '../../database/PrismaTransactionRepository';
import { PrismaUserRepository } from '../../database/PrismaUserRepository';
import { CreateTransactionController } from '../controllers/CreateTransactionController';
import { GetUserTransactionsController } from '../controllers/GetUserTransactionsController';

const transactionRoutes = Router();

const prismaTransactionRepository = new PrismaTransactionRepository();
const prismaUserRepository = new PrismaUserRepository();
const createTransactionUseCase = new CreateTransactionUseCase(prismaTransactionRepository, prismaUserRepository);
const createTransactionController = new CreateTransactionController(createTransactionUseCase);

const getUserTransactionsUseCase = new GetUserTransactionsUseCase(prismaTransactionRepository);
const getUserTransactionsController = new GetUserTransactionsController(getUserTransactionsUseCase);

transactionRoutes.post('/', (request, response) => {
  return createTransactionController.handle(request, response);
});

transactionRoutes.get('/:userId', (request, response) => {
  return getUserTransactionsController.handle(request, response);
});

export { transactionRoutes };
