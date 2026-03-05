import { CreateTransactionUseCase } from '../../../application/use-cases/CreateTransactionUseCase';
import { GetUserTransactionsUseCase } from '../../../application/use-cases/GetUserTransactionsUseCase';
import { DeleteTransactionUseCase } from '../../../application/use-cases/DeleteTransactionUseCase';
import { PrismaTransactionRepository } from '../../database/PrismaTransactionRepository';
import { PrismaUserRepository } from '../../database/PrismaUserRepository';
import { CreateTransactionController } from '../controllers/CreateTransactionController';
import { GetUserTransactionsController } from '../controllers/GetUserTransactionsController';
import { DeleteTransactionController } from '../controllers/DeleteTransactionController';

const transactionRoutes = Router();

const prismaTransactionRepository = new PrismaTransactionRepository();
const prismaUserRepository = new PrismaUserRepository();

const createTransactionUseCase = new CreateTransactionUseCase(prismaTransactionRepository, prismaUserRepository);
const createTransactionController = new CreateTransactionController(createTransactionUseCase);

const getUserTransactionsUseCase = new GetUserTransactionsUseCase(prismaTransactionRepository);
const getUserTransactionsController = new GetUserTransactionsController(getUserTransactionsUseCase);

const deleteTransactionUseCase = new DeleteTransactionUseCase(prismaTransactionRepository);
const deleteTransactionController = new DeleteTransactionController(deleteTransactionUseCase);

transactionRoutes.post('/', (request, response) => {
  return createTransactionController.handle(request, response);
});

transactionRoutes.get('/:userId', (request, response) => {
  return getUserTransactionsController.handle(request, response);
});

transactionRoutes.delete('/:id', (request, response) => {
  return deleteTransactionController.handle(request, response);
});

export { transactionRoutes };
