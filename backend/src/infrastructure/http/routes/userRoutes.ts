import { Router } from 'express';
import { CreateUserUseCase } from '../../../application/use-cases/CreateUserUseCase';
import { PrismaUserRepository } from '../../database/PrismaUserRepository';
import { CreateUserController } from '../controllers/CreateUserController';

const userRoutes = Router();

// Injeção de Dependências
const prismaUserRepository = new PrismaUserRepository();
const createUserUseCase = new CreateUserUseCase(prismaUserRepository);
const createUserController = new CreateUserController(createUserUseCase);

userRoutes.post('/', (request, response) => {
  return createUserController.handle(request, response);
});

export { userRoutes };
