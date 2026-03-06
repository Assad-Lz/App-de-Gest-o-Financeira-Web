import { Router, Request, Response } from 'express';
import { CreateInvestmentUseCase } from '../../../application/use-cases/CreateInvestmentUseCase';
import { GetUserInvestmentsUseCase } from '../../../application/use-cases/GetUserInvestmentsUseCase';
import { PrismaInvestmentRepository } from '../../database/PrismaInvestmentRepository';
import { PrismaTransactionRepository } from '../../database/PrismaTransactionRepository';
import { PrismaUserRepository } from '../../database/PrismaUserRepository';
import { CreateInvestmentController } from '../controllers/CreateInvestmentController';
import { GetUserInvestmentsController } from '../controllers/GetUserInvestmentsController';

const investmentRoutes = Router();

const prismaInvestmentRepository = new PrismaInvestmentRepository();
const prismaTransactionRepository = new PrismaTransactionRepository();
const prismaUserRepository = new PrismaUserRepository();

const createInvestmentUseCase = new CreateInvestmentUseCase(
  prismaInvestmentRepository,
  prismaTransactionRepository,
  prismaUserRepository
);
const createInvestmentController = new CreateInvestmentController(createInvestmentUseCase);

const getUserInvestmentsUseCase = new GetUserInvestmentsUseCase(
  prismaInvestmentRepository,
  prismaUserRepository
);
const getUserInvestmentsController = new GetUserInvestmentsController(getUserInvestmentsUseCase);

investmentRoutes.post('/', (request: Request, response: Response) => {
  return createInvestmentController.handle(request, response);
});

investmentRoutes.get('/:userId', (request: Request, response: Response) => {
  return getUserInvestmentsController.handle(request, response);
});

export { investmentRoutes };
