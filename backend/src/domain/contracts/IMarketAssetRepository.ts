import { MarketAsset } from '../entities/MarketAsset';

export interface IMarketAssetRepository {
  findTopAssets(limit?: number): Promise<MarketAsset[]>;
  upsert(asset: any): Promise<void>;
}
