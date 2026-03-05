import { Router } from 'express';
import { GetTopMarketAssetsUseCase } from '../../../application/use-cases/GetTopMarketAssetsUseCase';
import { SimulateInvestmentUseCase } from '../../../application/use-cases/SimulateInvestmentUseCase';
import { PrismaMarketAssetRepository } from '../../database/PrismaMarketAssetRepository';
import { MarketController } from '../controllers/MarketController';

const marketRoutes = Router();

const prismaMarketRepo = new PrismaMarketAssetRepository();
const getTopMarketAssetsUseCase = new GetTopMarketAssetsUseCase(prismaMarketRepo);
const simulateInvestmentUseCase = new SimulateInvestmentUseCase();

const marketController = new MarketController(getTopMarketAssetsUseCase, simulateInvestmentUseCase);

marketRoutes.get('/assets/top', (req, res) => marketController.getTopAssets(req, res));
marketRoutes.post('/simulate', (req, res) => marketController.simulate(req, res));

export { marketRoutes };
