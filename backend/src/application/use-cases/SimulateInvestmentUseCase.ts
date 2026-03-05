interface IRequest {
  initialAmount: number;
  monthlyContribution: number;
  durationMonths: number;
  annualInterestRatePerc: number; // ex: 10.5 para 10.5% ao ano
}

interface IResponse {
  totalInvested: number;
  totalInterest: number;
  finalBalance: number;
}

export class SimulateInvestmentUseCase {
  async execute(data: IRequest): Promise<IResponse> {
    const { initialAmount, monthlyContribution, durationMonths, annualInterestRatePerc } = data;

    if (initialAmount < 0 || monthlyContribution < 0 || durationMonths <= 0 || annualInterestRatePerc <= 0) {
      throw new Error('All investment parameters must be strictly positive.');
    }

    // Converter taxa anual para taxa mensal
    const monthlyInterestRate = (Math.pow(1 + annualInterestRatePerc / 100, 1 / 12) - 1);

    let finalBalance = initialAmount;
    let totalInvested = initialAmount;

    for (let month = 1; month <= durationMonths; month++) {
      // Rendimento sobre o saldo inicial do mês
      finalBalance = finalBalance * (1 + monthlyInterestRate);
      
      // Aporte do mês atual
      finalBalance += monthlyContribution;
      totalInvested += monthlyContribution;
    }

    const totalInterest = finalBalance - totalInvested;

    return {
      totalInvested: Number(totalInvested.toFixed(2)),
      totalInterest: Number(totalInterest.toFixed(2)),
      finalBalance: Number(finalBalance.toFixed(2)),
    };
  }
}
