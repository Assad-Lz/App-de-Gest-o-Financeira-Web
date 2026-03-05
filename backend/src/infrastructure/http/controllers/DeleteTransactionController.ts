import { Request, Response } from 'express';
import { DeleteTransactionUseCase } from '../../../application/use-cases/DeleteTransactionUseCase';

export class DeleteTransactionController {
  constructor(private deleteTransactionUseCase: DeleteTransactionUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    try {
      await this.deleteTransactionUseCase.execute({ id: idStr });
      return response.status(204).send();
    } catch (err: any) {
      return response.status(400).json({
        message: err.message || 'Unexpected error.',
      });
    }
  }
}
