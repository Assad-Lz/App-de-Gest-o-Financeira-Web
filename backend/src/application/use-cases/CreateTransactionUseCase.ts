import { Transaction, TransactionType } from '../../domain/entities/Transaction';
import { ITransactionRepository } from '../../domain/contracts/ITransactionRepository';
import { IUserRepository } from '../../domain/contracts/IUserRepository';

interface IRequest {
  userEmail: string;
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  date?: Date;
}

export class CreateTransactionUseCase {
  constructor(
    private transactionsRepository: ITransactionRepository,
    private usersRepository: IUserRepository 
  ) {}

  async execute(data: IRequest): Promise<Transaction> {
    if (data.amount <= 0) {
      throw new Error('Transaction amount must be greater than zero.');
    }

    // Como o front utiliza OAuth (NextAuth), podemos não ter o UUID localmente salvo no Frontend.
    // O backend usa o e-mail como chave mestra temporária para "sincronizar" e resgatar o ID real do Banco.
    let user = await this.usersRepository.findByEmail(data.userEmail); 
    
    // Auto-criação Mock para suportar NextAuth sem hooks demorados. (Em prod pesada, isso fica no Login)
    if (!user) {
       user = await this.usersRepository.save(new (await import('../../domain/entities/User')).User({
          email: data.userEmail,
          name: data.userEmail.split('@')[0],
          provider: 'google'
       }));
    }

    const transaction = new Transaction({
      userId: user.id as string, // Aqui injetamos o UUID real p/ Foreign Key Constraints
      type: data.type,
      amount: data.amount,
      category: data.category || 'Geral',
      description: data.description || '', // Corrige o Linter de tipagem undefined -> string
      date: data.date,
    });

    return this.transactionsRepository.save(transaction);
  }
}
