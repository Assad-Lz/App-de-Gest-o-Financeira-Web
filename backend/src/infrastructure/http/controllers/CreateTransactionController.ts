import { Request, Response } from 'express';
import { CreateTransactionUseCase } from '../../../application/use-cases/CreateTransactionUseCase';

export class CreateTransactionController {
  constructor(private createTransactionUseCase: CreateTransactionUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const { userId, type, amount, category, description, date } = request.body;
    // NOTA: 'userId' virá do header/middleware de autenticação (JWT) no futuro.

    try {
      const transaction = await this.createTransactionUseCase.execute({
        userEmail: userId, // o front manda userId = email
        type,
        amount,
        category,
        description: description || undefined,
        date: date ? new Date(date) : new Date(),
      });

      return response.status(201).json(transaction);
    } catch (err: any) {
      return response.status(400).json({
        message: err.message || 'Error executing transaction.',
      });
    }
  }
}
