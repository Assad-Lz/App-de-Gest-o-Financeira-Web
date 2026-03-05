import { Router } from 'express';
import { CreateUserUseCase } from '../../../application/use-cases/CreateUserUseCase';
import { GetUserByEmailUseCase } from '../../../application/use-cases/GetUserByEmailUseCase';
import { PrismaUserRepository } from '../../database/PrismaUserRepository';
import { CreateUserController } from '../controllers/CreateUserController';
import { GetUserByEmailController } from '../controllers/GetUserByEmailController';

const userRoutes = Router();

// Injeção de Dependências
const prismaUserRepository = new PrismaUserRepository();
const createUserUseCase = new CreateUserUseCase(prismaUserRepository);
const createUserController = new CreateUserController(createUserUseCase);

const getUserByEmailUseCase = new GetUserByEmailUseCase(prismaUserRepository);
const getUserByEmailController = new GetUserByEmailController(getUserByEmailUseCase);

userRoutes.post('/', (request, response) => {
  return createUserController.handle(request, response);
});

userRoutes.get('/:email', (request, response) => {
  return getUserByEmailController.handle(request, response);
});

export { userRoutes };
