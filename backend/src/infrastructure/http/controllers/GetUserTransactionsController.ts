import { Request, Response } from 'express';
import { GetUserTransactionsUseCase } from '../../../application/use-cases/GetUserTransactionsUseCase';

export class GetUserTransactionsController {
  constructor(private getUserTransactionsUseCase: GetUserTransactionsUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const userId = request.params.userId?.toString();

      if (!userId) {
        return response.status(400).json({ error: 'UserId parameter is required.' });
      }

      const transactions = await this.getUserTransactionsUseCase.execute(userId);

      return response.status(200).json(transactions);
    } catch (err: any) {
      return response.status(400).json({
        error: err.message || 'Unexpected error while fetching transactions.',
      });
    }
  }
}
