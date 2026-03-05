import { GenerateFinancialAdviceUseCase } from './GenerateFinancialAdviceUseCase';
import { Transaction } from '../../domain/entities/Transaction';
import { IAiAssistantProvider } from '../../domain/contracts/IAiAssistantProvider';
import { ITransactionRepository } from '../../domain/contracts/ITransactionRepository';

// Mocks fakes
const mockAiProvider: IAiAssistantProvider = {
  generateFinancialAdvice: jest.fn().mockResolvedValue('Dica gerada pela IA fake para os testes.'),
};

const mockEmptyTransactionRepo: ITransactionRepository = {
  save: jest.fn(),
  findByUserId: jest.fn().mockResolvedValue([]),
  delete: jest.fn(),
};

const mockTransactionRepoWithData: ITransactionRepository = {
  save: jest.fn(),
  findByUserId: jest.fn().mockResolvedValue([
    new Transaction({ userId: '123', type: 'INCOME', amount: 5000, category: 'Salário' }),
    new Transaction({ userId: '123', type: 'EXPENSE', amount: 2000, category: 'Moradia' }),
    new Transaction({ userId: '123', type: 'EXPENSE', amount: 1000, category: 'Lazer' }),
  ]),
  delete: jest.fn(),
};

describe('Generate Financial Advice Use Case', () => {

  it('should return a default message if user has no transactions', async () => {
    const useCase = new GenerateFinancialAdviceUseCase(mockEmptyTransactionRepo, mockAiProvider);
    const result = await useCase.execute('123');
    
    expect(result).toBe("Você ainda não possui transações cadastradas. Cadastre suas receitas e despesas para eu poder analisar sua saúde financeira!");
    expect(mockAiProvider.generateFinancialAdvice).not.toHaveBeenCalled();
  });

  it('should calculate inputs and call AI Provider if user has data', async () => {
    const useCase = new GenerateFinancialAdviceUseCase(mockTransactionRepoWithData, mockAiProvider);
    const result = await useCase.execute('123');

    // income = 5000, expense = 3000, top category = Moradia (2000)
    expect(mockAiProvider.generateFinancialAdvice).toHaveBeenCalledWith(5000, 3000, 'Moradia');
    expect(result).toBe('Dica gerada pela IA fake para os testes.');
  });
});
