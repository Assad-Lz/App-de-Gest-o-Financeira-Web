export interface MarketAssetProps {
  symbol: string;
  name: string;
  price: number;
  changePerc?: number;
}

export class MarketAsset {
  public readonly id?: string;
  public symbol: string;
  public name: string;
  public price: number;
  public changePerc?: number;
  public updatedAt?: Date;

  constructor(props: MarketAssetProps, id?: string) {
    this.symbol = props.symbol;
    this.name = props.name;
    this.price = props.price;
    this.changePerc = props.changePerc;
    this.id = id;
    this.updatedAt = new Date();
  }
}
