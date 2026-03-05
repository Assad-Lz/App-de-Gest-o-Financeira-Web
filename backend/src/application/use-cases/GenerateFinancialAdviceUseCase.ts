import { IAiAssistantProvider } from '../../domain/contracts/IAiAssistantProvider';
import { ITransactionRepository } from '../../domain/contracts/ITransactionRepository';

export class GenerateFinancialAdviceUseCase {
  constructor(
    private transactionsRepository: ITransactionRepository,
    private aiProvider: IAiAssistantProvider
  ) {}

  async execute(userId: string): Promise<string> {
    const transactions = await this.transactionsRepository.findByUserId(userId);

    if (transactions.length === 0) {
      return "Você ainda não possui transações cadastradas. Cadastre suas receitas e despesas para eu poder analisar sua saúde financeira!";
    }

    let totalIncome = 0;
    let totalExpense = 0;

    // Agrupamento para descobrir qual categoria gasta mais
    const expensesByCategory: Record<string, number> = {};

    transactions.forEach(tx => {
      if (tx.isIncome()) {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
        if (!expensesByCategory[tx.category]) {
          expensesByCategory[tx.category] = 0;
        }
        expensesByCategory[tx.category] += tx.amount;
      }
    });

    let topCategory = 'Nenhuma';
    let maxSpent = 0;

    for (const [category, amount] of Object.entries(expensesByCategory)) {
      if (amount > maxSpent) {
        maxSpent = amount;
        topCategory = category;
      }
    }

    // Chama o Provider Externo (Gemini) passando os dados de resumo do BD local.
    const advice = await this.aiProvider.generateFinancialAdvice(totalIncome, totalExpense, topCategory);

    return advice;
  }
}
