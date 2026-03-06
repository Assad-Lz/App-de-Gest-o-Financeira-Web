import { Request, Response, NextFunction } from 'express';

export function internalGuard(req: Request, res: Response, next: NextFunction): void {
  // Ignora a checagem no endpoint de Health (usado pela plataforma de Coud, Render/Fly)
  if (req.path === '/health') {
    return next();
  }

  const apiKey = req.headers['x-api-secret-key'];
  const VALID_KEY = process.env.INTERNAL_API_SECRET_KEY || 'default-dev-secret-key';

  if (!apiKey || apiKey !== VALID_KEY) {
    res.status(401).json({ error: 'Acesso Negado: Requisição Externa Não Autorizada Pelo Proxy.' });
    return;
  }

  next();
}
