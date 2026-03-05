import { Transaction } from '../entities/Transaction';

export interface ITransactionRepository {
  save(transaction: Transaction): Promise<Transaction>;
  findByUserId(userId: string): Promise<Transaction[]>;
  delete(id: string): Promise<void>;
}
