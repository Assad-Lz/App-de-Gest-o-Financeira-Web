/**
 * Testes do Dashboard - FinEasy
 * Verifica se os cards e seções principais aparecem corretamente
 * após o carregamento dos dados (mocked).
 */

import { render, screen, waitFor } from '@testing-library/react';

// Mock do NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: { name: 'Zacky', email: 'zacky@fineasy.com' },
    },
    status: 'authenticated',
  })),
  signOut: jest.fn(),
}));

// Mock do Axios — simula respostas da API sem servidor
jest.mock('axios', () => ({
  get: jest.fn((url: string) => {
    if (url.includes('/transactions/')) {
      return Promise.resolve({ data: [
        { type: 'INCOME', amount: 5000, category: 'Salário', description: 'Salário mensal', date: new Date().toISOString() },
        { type: 'EXPENSE', amount: 1200, category: 'Moradia', description: 'Aluguel', date: new Date().toISOString() },
      ]});
    }
    if (url.includes('/market/assets/top')) {
      return Promise.resolve({ data: [
        { symbol: 'PETR4', price: 38.50, changePerc: 1.2 },
      ]});
    }
    if (url.includes('/investments/')) {
      return Promise.resolve({ data: [
        { type: 'RENDA_FIXA', amount: 10000 },
      ]});
    }
    return Promise.resolve({ data: [] });
  }),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  create: jest.fn().mockReturnThis(),
  defaults: { headers: { common: {} } },
}));

// Mock do GSAP
jest.mock('gsap', () => ({
  __esModule: true,
  default: { fromTo: jest.fn(), to: jest.fn(), from: jest.fn(), set: jest.fn(), timeline: jest.fn(() => ({ fromTo: jest.fn().mockReturnThis(), to: jest.fn().mockReturnThis() })) },
}));

// Mock do next/link
jest.mock('next/link', () => ({ __esModule: true, default: ({ children }: any) => children }));

// Mock do framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }: any) => <div {...rest}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import DashboardPage from '../app/dashboard/page';

describe('Dashboard Page', () => {
  beforeEach(() => {
    render(<DashboardPage />);
  });

  it('deve exibir o spinner de carregamento inicialmente', () => {
    expect(screen.getByText(/Sincronizando Patrimônio/i)).toBeInTheDocument();
  });

  it('deve exibir a saudação ao usuário após o carregamento', async () => {
    await waitFor(() => {
      expect(screen.getByText(/Olá,/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('deve renderizar o card de Saldo Líquido após o carregamento', async () => {
    await waitFor(() => {
      expect(screen.getByText(/Saldo Líquido/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('deve renderizar o card de Fluxo de Entrada após o carregamento', async () => {
    await waitFor(() => {
      expect(screen.getByText(/Fluxo de Entrada/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('deve renderizar o card de Fluxo de Saída após o carregamento', async () => {
    await waitFor(() => {
      expect(screen.getByText(/Fluxo de Saída/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('deve renderizar o card de Patrimônio Investido após o carregamento', async () => {
    await waitFor(() => {
      expect(screen.getByText(/Patrimônio Investido/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('deve renderizar o gráfico de Análise de Fluxo Mensal', async () => {
    await waitFor(() => {
      expect(screen.getByText(/Análise de Fluxo Mensal/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('deve renderizar o Market Feed', async () => {
    await waitFor(() => {
      expect(screen.getByText(/Market Feed/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
