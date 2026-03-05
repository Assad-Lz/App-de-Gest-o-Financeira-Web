import { IUserRepository } from '../../domain/contracts/IUserRepository';
import { User } from '../../domain/entities/User';

export class GetUserByEmailUseCase {
  constructor(private usersRepository: IUserRepository) {}

  async execute(email: string): Promise<User | null> {
    const user = await this.usersRepository.findByEmail(email);
    return user;
  }
}
