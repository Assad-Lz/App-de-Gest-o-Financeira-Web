import { ITransactionRepository } from '../../domain/contracts/ITransactionRepository';
import { Transaction } from '../../domain/entities/Transaction';

interface IRequest {
  id: string;
  type?: 'INCOME' | 'EXPENSE';
  amount?: number;
  category?: string;
  description?: string;
  date?: Date;
}

export class UpdateTransactionUseCase {
  constructor(private transactionsRepository: ITransactionRepository) {}

  async execute({ id, ...data }: IRequest): Promise<Transaction> {
    // Aqui poderíamos adicionar validações extras, como se a transação existe
    // O repositório Prisma.update já falha se o ID não for encontrado por padrão.
    return this.transactionsRepository.update(id, data);
  }
}
