import { MarketAsset } from '../../domain/entities/MarketAsset';
import { IMarketAssetRepository } from '../../domain/contracts/IMarketAssetRepository';

export class GetTopMarketAssetsUseCase {
  constructor(private marketAssetRepository: IMarketAssetRepository) {}

  async execute(limit: number = 30): Promise<MarketAsset[]> {
    // Busca os dados lidos pela Brapi no PostgreSQL
    return this.marketAssetRepository.findTopAssets(limit);
  }
}
