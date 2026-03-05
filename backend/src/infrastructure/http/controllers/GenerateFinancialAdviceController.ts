import { Request, Response } from 'express';
import { GenerateFinancialAdviceUseCase } from '../../../application/use-cases/GenerateFinancialAdviceUseCase';

export class GenerateFinancialAdviceController {
  constructor(private generateFinancialAdviceUseCase: GenerateFinancialAdviceUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const { userId } = request.params; // No futuro o userId virá pelo Auth Middleware (request.user.id)

    try {
      const advice = await this.generateFinancialAdviceUseCase.execute(userId as string);
      return response.status(200).json({ advice });
    } catch (err: any) {
      return response.status(400).json({
        message: err.message || 'Error executing AI generation.',
      });
    }
  }
}
