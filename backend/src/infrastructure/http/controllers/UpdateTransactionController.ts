import { Request, Response } from 'express';
import { UpdateTransactionUseCase } from '../../../application/use-cases/UpdateTransactionUseCase';

export class UpdateTransactionController {
  constructor(private updateTransactionUseCase: UpdateTransactionUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const idStr = Array.isArray(id) ? id[0] : id;
    const { type, amount, category, description, date } = request.body;

    try {
      const transaction = await this.updateTransactionUseCase.execute({
        id: idStr,
        type,
        amount,
        category,
        description,
        date: date ? new Date(date) : undefined,
      });

      return response.status(200).json(transaction);
    } catch (err: any) {
      return response.status(400).json({
        message: err.message || 'Unexpected error.',
      });
    }
  }
}
