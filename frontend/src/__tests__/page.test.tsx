/**
 * Testes da Página Home (Login) - FinEasy
 * Verifica se os principais elementos da tela de login são renderizados corretamente.
 */

import { render, screen } from '@testing-library/react';

// Mock do next-auth pois ele requer o Provider de Sessão no contexto
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
}));

// Mock do NeuralMesh
jest.mock('../components/ui/NeuralMesh', () => ({ NeuralMesh: () => null }));

// Mock do gsap
const mockGsapObj = {
  fromTo: jest.fn(),
  to: jest.fn(),
  from: jest.fn(),
  set: jest.fn(),
  timeline: jest.fn(() => ({
    fromTo: jest.fn().mockReturnThis(),
    to: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
  })),
};

jest.mock('gsap', () => ({
  __esModule: true,
  default: mockGsapObj,
  gsap: mockGsapObj,
}));

// Importando o componente a ser testado
import Home from '../app/page';

describe('Home Page (Login)', () => {
  beforeEach(() => {
    render(<Home />);
  });

  it('deve renderizar o título "FinEasy" na tela', () => {
    expect(screen.getByText('FinEasy')).toBeInTheDocument();
  });

  it('deve renderizar o campo de email', () => {
    expect(screen.getByPlaceholderText('Seu melhor e-mail')).toBeInTheDocument();
  });

  it('deve renderizar o botão de acesso à plataforma', () => {
    expect(screen.getByText(/Acessar Plataforma/i)).toBeInTheDocument();
  });

  it('deve renderizar o botão de login com Google', () => {
    expect(screen.getByText(/Google Entrar/i)).toBeInTheDocument();
  });

  it('deve exibir a mensagem de proteção FinEasy', () => {
    expect(screen.getByText(/Proteção FinEasy/i)).toBeInTheDocument();
  });
});
