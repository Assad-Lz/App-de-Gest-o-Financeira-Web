import { CreateUserUseCase } from './CreateUserUseCase';
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/contracts/IUserRepository';

// Mocking do Repositório (Em Memória) focado em testes ultrarrápidos, sem hitting real no DB!
class InMemoryUserRepository implements IUserRepository {
  public items: User[] = [];

  async findByEmail(email: string): Promise<User | null> {
    const user = this.items.find((item) => item.email === email);
    return user || null;
  }

  async save(user: User): Promise<User> {
    const newUser = new User(
      {
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        provider: user.provider,
      },
      String(Math.random())
    );
    this.items.push(newUser);
    return newUser;
  }
}

describe('Create User Use Case', () => {
  let usersRepository: InMemoryUserRepository;
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUserRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it('should be able to create a new user', async () => {
    const user = await createUserUseCase.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'strong_password',
    });

    expect(user).toHaveProperty('id');
    expect(user.email).toBe('john@example.com');
  });

  it('should not be able to create a user with an existing email', async () => {
    await createUserUseCase.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'strong_password',
    });

    await expect(
      createUserUseCase.execute({
        name: 'John Doe Again',
        email: 'john@example.com',
        password: 'another_password',
      })
    ).rejects.toThrow('User already exists.');
  });

  it('should reject invalid email format', async () => {
    await expect(
      createUserUseCase.execute({
        name: 'Jane Doe',
        email: 'janedoe_invalid_mail.com',
        password: 'password123',
      })
    ).rejects.toThrow('Invalid email format.');
  });

  it('should require a password if provider is email (default)', async () => {
    await expect(
      createUserUseCase.execute({
        name: 'Paul',
        email: 'paul@example.com',
        // password not provided
      })
    ).rejects.toThrow('Password is required when registering via email.');
  });

  it('should not require a password if provider is oauth (Google/Facebook)', async () => {
    const user = await createUserUseCase.execute({
      name: 'Oauth User',
      email: 'oauth@example.com',
      provider: 'google',
    });

    expect(user).toHaveProperty('id');
    expect(user.passwordHash).toBeUndefined();
  });
});
