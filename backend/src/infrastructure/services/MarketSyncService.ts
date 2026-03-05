import axios from 'axios';
import cron from 'node-cron';
import { IMarketAssetRepository } from '../../domain/contracts/IMarketAssetRepository';

export class MarketSyncService {
  private static tickers = [
    "PETR4", "VALE3", "ITUB4", "BBDC4", "ABEV3", "MGLU3", "WEGE3", "RENT3", "HAPV3", "BBAS3", 
    "SANB11", "B3SA3", "JBSS3", "SUZB3", "ELET3", "GGBR4", "CSNA3", "VIVT3", "RAIL3", "RDOR3",
    "RADL3", "LREN3", "PRIO3", "TIMS3", "EGIE3", "VVB11", "IVVB11", "BOVA11", "SMAL11", "KLBN11",
    "BPAC11", "CRFB3", "NTCO3", "BRFS3", "ENGI11", "TAEE11", "EQTL3", "FLRY3", "EZTC3", "CYRE3",
    "GOAU4", "USIM5", "CMIG4", "CPLE6", "TOTS3", "PSSA3", "ALPA4", "MRVE3", "YDUQ3", "CIEL3"
  ];

  constructor(private marketAssetRepository: IMarketAssetRepository) {}

  async syncExchangeRates() {
    console.log('[MarketSync] Fetching exchange rates...');
    try {
      const { data } = await axios.get("https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL");
      
      const assets = [
        {
          symbol: 'USD_BRL',
          name: 'Dólar Americano',
          price: parseFloat(data.USDBRL.ask),
          changePerc: parseFloat(data.USDBRL.pctChange)
        },
        {
          symbol: 'EUR_BRL',
          name: 'Euro',
          price: parseFloat(data.EURBRL.ask),
          changePerc: parseFloat(data.EURBRL.pctChange)
        }
      ];

      for (const asset of assets) {
        await this.marketAssetRepository.upsert(asset);
      }
      console.log('[MarketSync] Exchange rates synced.');
    } catch (error: any) {
      console.error('[MarketSync] Error syncing exchange rates:', error.message);
    }
  }

  async syncStocks() {
    console.log('[MarketSync] Fetching stocks from BRAPI...');
    const token = process.env.BRAPI_TOKEN;
    if (!token) {
      console.warn('[MarketSync] BRAPI_TOKEN not defined.');
      return;
    }

    for (const ticker of MarketSyncService.tickers) {
      try {
        const url = `https://brapi.dev/api/quote/${ticker}?token=${token}`;
        const { data } = await axios.get(url);
        
        if (data.results && data.results.length > 0) {
          const stock = data.results[0];
          await this.marketAssetRepository.upsert({
            symbol: stock.symbol,
            name: stock.shortName || stock.symbol,
            price: parseFloat(stock.regularMarketPrice),
            changePerc: parseFloat(stock.regularMarketChangePercent || 0)
          });
        }
        // Delay to respect free tier
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error: any) {
        console.error(`[MarketSync] Error syncing ticker ${ticker}:`, error.message);
      }
    }
    console.log('[MarketSync] Stocks synced.');
  }

  async runFullSync() {
    console.log(`[${new Date().toISOString()}] Starting full market sync...`);
    await this.syncExchangeRates();
    await this.syncStocks();
  }

  start() {
    console.log('[MarketSync] Scheduler initialized (every hour).');
    
    // Run immediately on boot
    this.runFullSync();

    // Schedule: every hour at minute 0
    cron.schedule('0 * * * *', () => {
      this.runFullSync();
    });
  }
}
