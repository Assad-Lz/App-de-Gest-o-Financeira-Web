import { Investment, InvestmentType } from '../../domain/entities/Investment';
import { IInvestmentRepository } from '../../domain/contracts/IInvestmentRepository';
import { ITransactionRepository } from '../../domain/contracts/ITransactionRepository';
import { IUserRepository } from '../../domain/contracts/IUserRepository';
import { Transaction } from '../../domain/entities/Transaction';

interface IRequest {
  userEmail: string;
  type: InvestmentType;
  amount: number;
  assetSymbol?: string;
}

export class CreateInvestmentUseCase {
  constructor(
    private investmentsRepository: IInvestmentRepository,
    private transactionsRepository: ITransactionRepository,
    private usersRepository: IUserRepository
  ) {}

  async execute(data: IRequest): Promise<Investment> {
    if (data.amount <= 0) {
      throw new Error('Investment amount must be greater than zero.');
    }

    const user = await this.usersRepository.findByEmail(data.userEmail);
    if (!user) {
      throw new Error('User not found. Sincronize suas transações primeiro.');
    }

    const investment = new Investment({
      userId: user.id as string,
      type: data.type,
      amount: data.amount,
      assetSymbol: data.assetSymbol,
    });

    const savedInvestment = await this.investmentsRepository.save(investment);

    // Business Logic: Translates investment allocation into a cashflow expense
    const mirrorTransaction = new Transaction({
      userId: user.id as string,
      type: 'EXPENSE',
      amount: data.amount,
      category: 'Investimento/Transferência',
      description: `Locação em ${data.assetSymbol || data.type}`,
      date: new Date(),
    });

    await this.transactionsRepository.save(mirrorTransaction);

    return savedInvestment;
  }
}
