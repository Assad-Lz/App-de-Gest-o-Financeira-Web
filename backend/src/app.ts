import express from 'express';
import cors from 'cors';
import { userRoutes } from './infrastructure/http/routes/userRoutes';
import { transactionRoutes } from './infrastructure/http/routes/transactionRoutes';
import { aiRoutes } from './infrastructure/http/routes/aiRoutes';
import { marketRoutes } from './infrastructure/http/routes/marketRoutes';
import { investmentRoutes } from './infrastructure/http/routes/investmentRoutes';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import { internalGuard } from './infrastructure/http/middlewares/InternalGuardMiddleware';

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

// WAF corporativo (Security Headers & Anti-Injection)
app.use(helmet()); 
app.use(hpp()); 

// Sanitizador XSS manual (substituto do xss-clean incompatível com Express 5+)
// Remove tags HTML perigosas dos campos string no body da requisição
app.use((req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    const sanitize = (val: any): any => {
      if (typeof val === 'string') return val.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (typeof val === 'object' && val !== null) {
        return Object.fromEntries(Object.entries(val).map(([k, v]) => [k, sanitize(v)]));
      }
      return val;
    };
    req.body = sanitize(req.body);
  }
  next();
}); 

app.use(limiter);
app.use(express.json({ limit: '10kb' })); // Body parser blindado contra payloads gigantes
app.use(cors());

// Middleware Supremo de Proxy-Edge: Só aceita se o request vir do servidor Next.js na Nuvem
app.use(internalGuard);

// Registro das rotas
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

app.use('/users', userRoutes);
app.use('/transactions', transactionRoutes);
app.use('/ai', aiRoutes);
app.use('/market', marketRoutes);
app.use('/investments', investmentRoutes);

export { app };
