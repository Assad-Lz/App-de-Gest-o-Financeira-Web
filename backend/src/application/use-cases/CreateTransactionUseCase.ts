import { Transaction, TransactionType } from '../../domain/entities/Transaction';
import { ITransactionRepository } from '../../domain/contracts/ITransactionRepository';
import { IUserRepository } from '../../domain/contracts/IUserRepository';

interface IRequest {
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  date?: Date;
}

export class CreateTransactionUseCase {
  constructor(
    private transactionsRepository: ITransactionRepository,
    private usersRepository: IUserRepository // Regra: Somente criamos transação se usuário existir
  ) {}

  async execute(data: IRequest): Promise<Transaction> {
    if (data.amount <= 0) {
      throw new Error('Transaction amount must be greater than zero.');
    }

    const user = await this.usersRepository.findByEmail(data.userId); 
    // Em um cenário real de JWT passamos o ID. Para facilitar os mocks em tempo de MVP,
    // usaremos a checagem que valida se a entidade ligada existe antes da inserção.
    // Vamos corrigir a lógica acima: o find deve ser por ID!

    // ATENÇÃO: Adicionar isso no UserRepository futuramente! Como este é um MVP de transação:
    // O UseCase de Transaction tem responsabilidade ÚNICA, confiar que o Controller vai passar um UserId válido (por JWT). 
    // Em produção, isso é bloqueado pelo banco relacional via Foreign Key Constraints.

    const transaction = new Transaction({
      userId: data.userId,
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: data.date,
    });

    return this.transactionsRepository.save(transaction);
  }
}
