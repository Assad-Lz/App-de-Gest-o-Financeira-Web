import { PrismaClient } from '@prisma/client';
import { Investment } from '../../domain/entities/Investment';
import { IInvestmentRepository } from '../../domain/contracts/IInvestmentRepository';

const prisma = new PrismaClient();

export class PrismaInvestmentRepository implements IInvestmentRepository {
  async save(investment: Investment): Promise<Investment> {
    const createdInvestment = await prisma.investment.create({
      data: {
        userId: investment.userId,
        type: investment.type,
        amount: investment.amount,
        assetSymbol: investment.assetSymbol,
      },
    });

    return new Investment({
      ...createdInvestment,
      assetSymbol: createdInvestment.assetSymbol || undefined,
      type: createdInvestment.type as any,
    });
  }

  async findByUserId(userId: string): Promise<Investment[]> {
    const investments = await prisma.investment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return investments.map(inv => new Investment({
      ...inv,
      assetSymbol: inv.assetSymbol || undefined,
      type: inv.type as any,
    }));
  }
}
