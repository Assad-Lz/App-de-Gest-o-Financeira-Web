import { Investment } from '../entities/Investment';

export interface IInvestmentRepository {
  save(investment: Investment): Promise<Investment>;
  findByUserId(userId: string): Promise<Investment[]>;
}
