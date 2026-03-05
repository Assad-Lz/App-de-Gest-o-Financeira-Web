export interface IAiAssistantProvider {
  generateFinancialAdvice(monthlyIncome: number, monthlyExpenses: number, topCategory: string): Promise<string>;
}
