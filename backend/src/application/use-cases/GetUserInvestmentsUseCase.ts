import { Investment } from '../../domain/entities/Investment';
import { IInvestmentRepository } from '../../domain/contracts/IInvestmentRepository';
import { IUserRepository } from '../../domain/contracts/IUserRepository';

export class GetUserInvestmentsUseCase {
  constructor(
    private investmentsRepository: IInvestmentRepository,
    private usersRepository: IUserRepository
  ) {}

  async execute(userEmail: string): Promise<Investment[]> {
    const user = await this.usersRepository.findByEmail(userEmail);
    if (!user) {
      return []; // Return empty if user has no investments/records yet
    }
    return this.investmentsRepository.findByUserId(user.id as string);
  } // Returns all investments
}
