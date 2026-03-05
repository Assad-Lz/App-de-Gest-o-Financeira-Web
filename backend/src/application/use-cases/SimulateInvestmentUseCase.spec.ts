import { SimulateInvestmentUseCase } from './SimulateInvestmentUseCase';

describe('Simulate Investment Use Case', () => {
  let simulateInvestmentUseCase: SimulateInvestmentUseCase;

  beforeEach(() => {
    simulateInvestmentUseCase = new SimulateInvestmentUseCase();
  });

  it('should calculate compound interest correctly over time', async () => {
    // Cenário: R$ 1.000,00 inicial, sem aporte mensal, em 12 meses, rendendo 10% a.a
    const result = await simulateInvestmentUseCase.execute({
      initialAmount: 1000,
      monthlyContribution: 0,
      durationMonths: 12,
      annualInterestRatePerc: 10,
    });

    // 10% a.a sobre 1000 por 1 ano = 1100 (desprezando centavos de precisão de JS real)
    expect(result.totalInvested).toBeCloseTo(1000, 0);
    expect(result.finalBalance).toBeCloseTo(1100, 0);
    expect(result.totalInterest).toBeCloseTo(100, 0);
  });

  it('should reject negative parameters', async () => {
    await expect(
      simulateInvestmentUseCase.execute({
        initialAmount: -100,
        monthlyContribution: 50,
        durationMonths: 12,
        annualInterestRatePerc: 10,
      })
    ).rejects.toThrow('All investment parameters must be strictly positive.');
  });
});
