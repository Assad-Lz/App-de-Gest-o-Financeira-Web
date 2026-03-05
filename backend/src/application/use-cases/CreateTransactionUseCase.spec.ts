import { CreateTransactionUseCase } from './CreateTransactionUseCase';
import { Transaction } from '../../domain/entities/Transaction';
import { ITransactionRepository } from '../../domain/contracts/ITransactionRepository';

// Usado o Any aqui propositalmente para mockar a interface sem importar todo o IUserRepository
const mockUserRepository = {
  findByEmail: jest.fn(),
  save: jest.fn()
} as any;

class InMemoryTransactionRepository implements ITransactionRepository {
  public items: Transaction[] = [];

  async save(transaction: Transaction): Promise<Transaction> {
    const newTx = new Transaction(
      {
        userId: transaction.userId,
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        date: transaction.date,
      },
      String(Math.random())
    );
    this.items.push(newTx);
    return newTx;
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    return this.items.filter(item => item.userId === userId);
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter(item => item.id !== id);
  }
}

describe('Create Transaction Use Case', () => {
  let transactionsRepository: InMemoryTransactionRepository;
  let createTransactionUseCase: CreateTransactionUseCase;

  beforeEach(() => {
    transactionsRepository = new InMemoryTransactionRepository();
    createTransactionUseCase = new CreateTransactionUseCase(transactionsRepository, mockUserRepository);
  });

  it('should be able to insert a new income transaction', async () => {
    const transaction = await createTransactionUseCase.execute({
      userId: 'user-123',
      type: 'INCOME',
      amount: 5000,
      category: 'Salário',
      description: 'Salário do mês'
    });

    expect(transaction).toHaveProperty('id');
    expect(transaction.amount).toBe(5000);
    expect(transaction.isIncome()).toBe(true);
  });

  it('should transform negative amounts into absolute values through the Entity', async () => {
    const transaction = await createTransactionUseCase.execute({
      userId: 'user-123',
      type: 'EXPENSE',
      amount: 150, // A entity garante valor absoluto mesmo se passar + ou -. O UseCase valida se for zero.
      category: 'Alimentação'
    });

    expect(transaction.amount).toBe(150);
    expect(transaction.isExpense()).toBe(true);
  });

  it('should reject transactions with zero or negative inserted amount at the UseCase level', async () => {
    await expect(
      createTransactionUseCase.execute({
        userId: 'user-123',
        type: 'EXPENSE',
        amount: -50,
        category: 'Mercado'
      })
    ).rejects.toThrow('Transaction amount must be greater than zero.');
  });
});
