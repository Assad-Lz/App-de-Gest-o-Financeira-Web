import express from 'express';
import cors from 'cors';
import { userRoutes } from './infrastructure/http/routes/userRoutes';
import { transactionRoutes } from './infrastructure/http/routes/transactionRoutes';
import { aiRoutes } from './infrastructure/http/routes/aiRoutes';
import { marketRoutes } from './infrastructure/http/routes/marketRoutes';

const app = express();

app.use(express.json());
app.use(cors());

// Registro das rotas
app.use('/users', userRoutes);
app.use('/transactions', transactionRoutes);
app.use('/ai', aiRoutes);
app.use('/market', marketRoutes);

export { app };
