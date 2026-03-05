/**
 * Testes do Dashboard - FinEasy
 * Verifica se os cards e seções principais aparecem corretamente.
 */

import { render, screen } from '@testing-library/react';

// Mocks necessários
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: { name: 'Zacky', email: 'zacky@fineasy.com' },
    },
    status: 'authenticated',
  })),
  signOut: jest.fn(),
}));

const mockGsapObj = {
  fromTo: jest.fn(),
  to: jest.fn(),
  from: jest.fn(),
  set: jest.fn(),
  timeline: jest.fn(() => ({
    fromTo: jest.fn().mockReturnThis(),
    to: jest.fn().mockReturnThis(),
  })),
};

jest.mock('gsap', () => ({
  __esModule: true,
  default: mockGsapObj,
  gsap: mockGsapObj,
}));

import DashboardPage from '../app/dashboard/page';

describe('Dashboard Page', () => {
  beforeEach(() => {
    render(<DashboardPage />);
  });

  it('deve exibir a saudação ao usuário', () => {
    expect(screen.getByText(/Olá,/i)).toBeInTheDocument();
  });

  it('deve renderizar o card de Saldo Atual', () => {
    expect(screen.getByText('Saldo Atual')).toBeInTheDocument();
  });

  it('deve renderizar o card de Receitas Totais', () => {
    expect(screen.getByText('Receitas Totais')).toBeInTheDocument();
  });

  it('deve renderizar o card de Despesas Totais', () => {
    expect(screen.getByText('Despesas Totais')).toBeInTheDocument();
  });

  it('deve renderizar o gráfico de Fluxo de Caixa Mensal', () => {
    expect(screen.getByText('Fluxo de Caixa Mensal')).toBeInTheDocument();
  });

  it('deve renderizar a seção de Ações em Alta', () => {
    expect(screen.getByText('Ações em Alta')).toBeInTheDocument();
  });
});
