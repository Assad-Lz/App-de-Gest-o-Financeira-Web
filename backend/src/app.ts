import express from 'express';
import cors from 'cors';
import { userRoutes } from './infrastructure/http/routes/userRoutes';
import { transactionRoutes } from './infrastructure/http/routes/transactionRoutes';
import { aiRoutes } from './infrastructure/http/routes/aiRoutes';
import { marketRoutes } from './infrastructure/http/routes/marketRoutes';
import { rateLimit } from 'express-rate-limit';

const app = express();

// Limite de 100 requisições a cada 15 minutos por IP
// Isso totaliza ~9600 req/dia por IP, mas como o usuário é único e o plano é 15k/mês,
// o limite protege contra loops infinitos ou bots.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' }
});

app.use(limiter);
app.use(express.json());
app.use(cors());

// Registro das rotas
app.use('/users', userRoutes);
app.use('/transactions', transactionRoutes);
app.use('/ai', aiRoutes);
app.use('/market', marketRoutes);

export { app };
