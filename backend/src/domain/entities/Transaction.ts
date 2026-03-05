export type TransactionType = 'INCOME' | 'EXPENSE';

export interface TransactionProps {
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  date?: Date;
}

export class Transaction {
  public readonly id?: string;
  public userId: string;
  public type: TransactionType;
  public amount: number;
  public category: string;
  public description?: string;
  public date: Date;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(props: TransactionProps, id?: string) {
    this.userId = props.userId;
    this.type = props.type;
    this.category = props.category;
    this.description = props.description;
    
    // Regra de Negócio: O valor deve ser sempre absoluto e numérico, 
    // a natureza da operação (entrada/saida) é definida pelo "type".
    this.amount = Math.abs(props.amount);
    
    this.date = props.date || new Date();
    this.id = id;
  }

  public isExpense(): boolean {
    return this.type === 'EXPENSE';
  }

  public isIncome(): boolean {
    return this.type === 'INCOME';
  }
}
