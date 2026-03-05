import { PrismaClient } from '@prisma/client';
import { MarketAsset } from '../../domain/entities/MarketAsset';
import { IMarketAssetRepository } from '../../domain/contracts/IMarketAssetRepository';

const prisma = new PrismaClient();

export class PrismaMarketAssetRepository implements IMarketAssetRepository {
  async findTopAssets(limit: number = 10): Promise<MarketAsset[]> {
    const assets = await prisma.marketAsset.findMany({
      orderBy: { changePerc: 'desc' },
      take: limit,
    });

    return assets.map(asset => new MarketAsset({
      symbol: asset.symbol,
      name: asset.name,
      price: asset.price,
      changePerc: asset.changePerc || undefined,
    }, asset.id));
  }
}
