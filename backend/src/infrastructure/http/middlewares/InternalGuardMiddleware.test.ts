import request from 'supertest';
import express, { Express } from 'express';
import { internalGuard } from './InternalGuardMiddleware';

describe('Security: InternalGuardMiddleware (TDD Rigoroso)', () => {
  let app: Express;

  beforeAll(() => {
    // Seta a chave mestra em memoria para os testes
    process.env.INTERNAL_API_SECRET_KEY = 'test-secret-key-123';

    app = express();
    app.use(express.json());
    
    // Aplica o escudo
    app.use(internalGuard);

    // Rotas fakes para testar bloqueio
    app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
    app.get('/api/protected', (req, res) => res.status(200).json({ data: 'Confidencial' }));
  });

  afterAll(() => {
    delete process.env.INTERNAL_API_SECRET_KEY;
  });

  it('1. DEVE PERMITIR tráfego no endpoint /health independente do Header', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('2. DEVE BLOQUEAR requisição sem o Header X-API-SECRET-KEY (Ex: Ataque Externo)', async () => {
    const response = await request(app).get('/api/protected');
    expect(response.status).toBe(401);
    expect(response.body.error).toContain('Acesso Negado');
  });

  it('3. DEVE BLOQUEAR requisição com X-API-SECRET-KEY forjado/inválido', async () => {
    const response = await request(app)
      .get('/api/protected')
      .set('x-api-secret-key', 'hacker-key-tentativa-falha');
    
    expect(response.status).toBe(401);
    expect(response.body.error).toContain('Acesso Negado');
  });

  it('4. DEVE PERMITIR requisição se o Proxy Edge injetar a Chave Mestra perfeitamente', async () => {
    const response = await request(app)
      .get('/api/protected')
      .set('x-api-secret-key', 'test-secret-key-123');
    
    expect(response.status).toBe(200);
    expect(response.body.data).toBe('Confidencial');
  });
});
