export type InvestmentType = 'RESERVA' | 'ACAO' | 'CDB' | 'FII';

export interface InvestmentProps {
  id?: string;
  userId: string;
  type: InvestmentType;
  amount: number;
  assetSymbol?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Investment {
  public readonly id?: string;
  public userId: string;
  public type: InvestmentType;
  public amount: number;
  public assetSymbol?: string;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(props: InvestmentProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.type = props.type;
    this.amount = props.amount;
    this.assetSymbol = props.assetSymbol;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
