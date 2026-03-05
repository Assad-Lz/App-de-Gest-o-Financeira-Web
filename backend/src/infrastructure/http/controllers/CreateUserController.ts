import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../../application/use-cases/CreateUserUseCase';

export class CreateUserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const { name, email, password, provider } = request.body;

    try {
      const user = await this.createUserUseCase.execute({
        name,
        email,
        password,
        provider,
      });

      // Não devemos retornar o hash da senha na API
      delete user.passwordHash;

      return response.status(201).json(user);
    } catch (err: any) {
      return response.status(400).json({
        message: err.message || 'Unexpected error.',
      });
    }
  }
}
