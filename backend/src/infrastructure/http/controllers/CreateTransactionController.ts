import { Request, Response } from 'express';
import { CreateTransactionUseCase } from '../../../application/use-cases/CreateTransactionUseCase';

export class CreateTransactionController {
  constructor(private createTransactionUseCase: CreateTransactionUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const { userId, userEmail, type, amount, category, description, date } = request.body;
    // Tenta pegar de userEmail, se não vier cai para userId (compatibilidade retroativa com o front atual)
    const emailToUse = userEmail || userId;
    try {
      const transaction = await this.createTransactionUseCase.execute({
        userEmail: emailToUse, // enviando email do usuário identificado
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
