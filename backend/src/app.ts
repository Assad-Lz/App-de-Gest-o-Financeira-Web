import express from 'express';
import cors from 'cors';
import { userRoutes } from './infrastructure/http/routes/userRoutes';
import { transactionRoutes } from './infrastructure/http/routes/transactionRoutes';

const app = express();

app.use(express.json());
app.use(cors());

// Registro das rotas
app.use('/users', userRoutes);
app.use('/transactions', transactionRoutes);

export { app };
