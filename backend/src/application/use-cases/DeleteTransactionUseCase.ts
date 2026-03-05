import { ITransactionRepository } from '../../domain/contracts/ITransactionRepository';

interface IRequest {
  id: string;
}

export class DeleteTransactionUseCase {
  constructor(private transactionsRepository: ITransactionRepository) {}

  async execute({ id }: IRequest): Promise<void> {
    // Verifica se a transação existe antes de deletar (opcional, mas boa prática)
    // Aqui usaremos o delete direto já que o repositório Prisma já lida com exceções se não existir.
    await this.transactionsRepository.delete(id);
  }
}
