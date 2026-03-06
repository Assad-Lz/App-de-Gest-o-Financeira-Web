import { Request, Response } from 'express';
import { GetUserInvestmentsUseCase } from '../../../application/use-cases/GetUserInvestmentsUseCase';

export class GetUserInvestmentsController {
  constructor(private getUserInvestmentsUseCase: GetUserInvestmentsUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const userId = request.params.userId as string; // E-mail mockado pelo NextAuth neste Setup
    
    try {
      const investments = await this.getUserInvestmentsUseCase.execute(userId);
      return response.json(investments);
    } catch (err: any) {
      return response.status(400).json({
        message: err.message || 'Error fetching investments.',
      });
    }
  }
}
