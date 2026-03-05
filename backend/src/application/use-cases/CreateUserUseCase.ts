import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/contracts/IUserRepository';

interface IRequest {
  name: string;
  email: string;
  password?: string;
  provider?: string;
}

export class CreateUserUseCase {
  constructor(private usersRepository: IUserRepository) {}

  async execute(data: IRequest): Promise<User> {
    const userAlreadyExists = await this.usersRepository.findByEmail(data.email);

    if (userAlreadyExists) {
      throw new Error('User already exists.');
    }

    const user = new User({
      name: data.name,
      email: data.email,
      provider: data.provider || 'email',
    });

    if (!user.isValidEmail()) {
      throw new Error('Invalid email format.');
    }

    // Se a autenticação não for via Google/Facebook, deve criptografar a senha!
    if (user.provider === 'email') {
      if (!data.password) {
        throw new Error('Password is required when registering via email.');
      }
      user.passwordHash = `${data.password}_hashed`; // Fake DB hashing por enquanto
    }

    return this.usersRepository.save(user);
  }
}
