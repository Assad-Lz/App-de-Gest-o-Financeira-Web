import { PrismaClient } from '@prisma/client';
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/contracts/IUserRepository';

const prisma = new PrismaClient();

export class PrismaUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return new User({
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash || undefined,
      provider: user.provider,
    }, user.id);
  }

  async save(user: User): Promise<User> {
    const savedUser = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        provider: user.provider,
      },
    });

    return new User({
      name: savedUser.name,
      email: savedUser.email,
      passwordHash: savedUser.passwordHash || undefined,
      provider: savedUser.provider,
    }, savedUser.id);
  }
}
