import { Request, Response } from 'express';
import { CreateInvestmentUseCase } from '../../../application/use-cases/CreateInvestmentUseCase';

export class CreateInvestmentController {
  constructor(private createInvestmentUseCase: CreateInvestmentUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const { userId, userEmail, type, amount, assetSymbol } = request.body;
    const emailToUse = userEmail || userId;
    
    try {
      const investment = await this.createInvestmentUseCase.execute({
        userEmail: emailToUse,
        type,
        amount,
        assetSymbol
      });
      return response.status(201).json(investment);
    } catch (err: any) {
      return response.status(400).json({
        message: err.message || 'Error creating investment.',
      });
    }
  }
}
