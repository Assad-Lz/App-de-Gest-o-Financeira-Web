import { app } from './app';
import { MarketSyncService } from './infrastructure/services/MarketSyncService';
import { PrismaMarketAssetRepository } from './infrastructure/database/PrismaMarketAssetRepository';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend is running on port ${PORT} 🚀`);

  // Inicializa a sincronização automática de mercado (Cron)
  const marketRepository = new PrismaMarketAssetRepository();
  const syncService = new MarketSyncService(marketRepository);
  syncService.start();
});
