import { ITransactionRepository } from '../../domain/contracts/ITransactionRepository';
import { Transaction } from '../../domain/entities/Transaction';

export class GetUserTransactionsUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(userId: string): Promise<Transaction[]> {
    const transactions = await this.transactionRepository.findByUserId(userId);
    return transactions;
  }
}
