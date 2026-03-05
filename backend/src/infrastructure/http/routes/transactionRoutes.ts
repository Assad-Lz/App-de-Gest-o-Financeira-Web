import { Router, Request, Response } from 'express';
import { CreateTransactionUseCase } from '../../../application/use-cases/CreateTransactionUseCase';
import { GetUserTransactionsUseCase } from '../../../application/use-cases/GetUserTransactionsUseCase';
import { DeleteTransactionUseCase } from '../../../application/use-cases/DeleteTransactionUseCase';
import { UpdateTransactionUseCase } from '../../../application/use-cases/UpdateTransactionUseCase';
import { PrismaTransactionRepository } from '../../database/PrismaTransactionRepository';
import { PrismaUserRepository } from '../../database/PrismaUserRepository';
import { CreateTransactionController } from '../controllers/CreateTransactionController';
import { GetUserTransactionsController } from '../controllers/GetUserTransactionsController';
import { DeleteTransactionController } from '../controllers/DeleteTransactionController';
import { UpdateTransactionController } from '../controllers/UpdateTransactionController';

const transactionRoutes = Router();

const prismaTransactionRepository = new PrismaTransactionRepository();
const prismaUserRepository = new PrismaUserRepository();

const createTransactionUseCase = new CreateTransactionUseCase(prismaTransactionRepository, prismaUserRepository);
const createTransactionController = new CreateTransactionController(createTransactionUseCase);

const getUserTransactionsUseCase = new GetUserTransactionsUseCase(prismaTransactionRepository);
const getUserTransactionsController = new GetUserTransactionsController(getUserTransactionsUseCase);

const deleteTransactionUseCase = new DeleteTransactionUseCase(prismaTransactionRepository);
const deleteTransactionController = new DeleteTransactionController(deleteTransactionUseCase);

const updateTransactionUseCase = new UpdateTransactionUseCase(prismaTransactionRepository);
const updateTransactionController = new UpdateTransactionController(updateTransactionUseCase);

transactionRoutes.post('/', (request: Request, response: Response) => {
  return createTransactionController.handle(request, response);
});

transactionRoutes.get('/:userId', (request: Request, response: Response) => {
  return getUserTransactionsController.handle(request, response);
});

transactionRoutes.delete('/:id', (request: Request, response: Response) => {
  return deleteTransactionController.handle(request, response);
});

transactionRoutes.put('/:id', (request: Request, response: Response) => {
  return updateTransactionController.handle(request, response);
});

export { transactionRoutes };
