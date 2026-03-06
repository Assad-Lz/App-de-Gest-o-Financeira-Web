import { PrismaClient } from '@prisma/client';
import { Transaction } from '../../domain/entities/Transaction';
import { ITransactionRepository } from '../../domain/contracts/ITransactionRepository';

const prisma = new PrismaClient();

export class PrismaTransactionRepository implements ITransactionRepository {
  async save(transaction: Transaction): Promise<Transaction> {
    const savedTx = await prisma.transaction.create({
      data: {
        userId: transaction.userId,
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        date: transaction.date,
      },
    });

    return new Transaction({
      userId: savedTx.userId,
      type: savedTx.type as 'INCOME' | 'EXPENSE',
      amount: savedTx.amount,
      category: savedTx.category,
      description: savedTx.description || undefined,
      date: savedTx.date,
    }, savedTx.id);
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { userId },
          { user: { email: userId } }
        ]
      },
      orderBy: { date: 'desc' },
    });

    return transactions.map(tx => new Transaction({
      userId: tx.userId,
      type: tx.type as 'INCOME' | 'EXPENSE',
      amount: tx.amount,
      category: tx.category,
      description: tx.description || undefined,
      date: tx.date,
    }, tx.id));
  }

  async delete(id: string): Promise<void> {
    await prisma.transaction.delete({
      where: { id },
    });
  }

  async update(id: string, data: Partial<Omit<Transaction, 'id' | 'userId'>>): Promise<Transaction> {
    const updatedTx = await prisma.transaction.update({
      where: { id },
      data: {
        type: data.type,
        amount: data.amount,
        category: data.category,
        description: data.description,
        date: data.date,
      },
    });

    return new Transaction({
      userId: updatedTx.userId,
      type: updatedTx.type as 'INCOME' | 'EXPENSE',
      amount: updatedTx.amount,
      category: updatedTx.category,
      description: updatedTx.description || undefined,
      date: updatedTx.date,
    }, updatedTx.id);
  }
}
