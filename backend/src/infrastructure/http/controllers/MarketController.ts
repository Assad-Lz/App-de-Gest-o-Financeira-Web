import { Request, Response } from 'express';
import { GetTopMarketAssetsUseCase } from '../../../application/use-cases/GetTopMarketAssetsUseCase';
import { SimulateInvestmentUseCase } from '../../../application/use-cases/SimulateInvestmentUseCase';

export class MarketController {
  constructor(
    private getTopMarketAssetsUseCase: GetTopMarketAssetsUseCase,
    private simulateInvestmentUseCase: SimulateInvestmentUseCase
  ) {}

  async getTopAssets(request: Request, response: Response): Promise<Response> {
    try {
      const topAssets = await this.getTopMarketAssetsUseCase.execute(5);
      return response.status(200).json(topAssets);
    } catch (err: any) {
      return response.status(400).json({ message: err.message });
    }
  }

  async simulate(request: Request, response: Response): Promise<Response> {
    const { initialAmount, monthlyContribution, durationMonths, annualInterestRatePerc } = request.body;
    try {
      const simulation = await this.simulateInvestmentUseCase.execute({
        initialAmount: Number(initialAmount),
        monthlyContribution: Number(monthlyContribution),
        durationMonths: Number(durationMonths),
        annualInterestRatePerc: Number(annualInterestRatePerc)
      });
      return response.status(200).json(simulation);
    } catch (err: any) {
      return response.status(400).json({ message: err.message });
    }
  }
}
