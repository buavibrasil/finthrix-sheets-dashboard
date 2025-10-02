import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EmailVerification from './EmailVerification';
import { useAuthStore } from '../stores/authStore';
import { emailVerificationService } from '../services/emailVerificationService';

// Mocks
const mockNavigate = vi.fn();

vi.mock('../stores/authStore');
vi.mock('../services/emailVerificationService');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom') as any;
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams('email=test@example.com&token=valid-token')],
    useNavigate: () => mockNavigate,
  };
});

const mockUseAuthStore = vi.mocked(useAuthStore);
const mockEmailVerificationService = vi.mocked(emailVerificationService);

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('EmailVerification', () => {
  const mockSetUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAuthStore.mockReturnValue({
      user: null,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
      getCurrentUser: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      clearError: vi.fn(),
      verifyEmail: vi.fn(),
      resendVerificationEmail: vi.fn(),
      setUser: mockSetUser
    });

    // Mock do useNavigate
    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom') as any;
      return {
        ...actual,
        useNavigate: () => mockNavigate,
      };
    });
  });

  it('deve mostrar estado de carregamento inicialmente', () => {
    renderWithRouter(<EmailVerification />);

    expect(screen.getByText('FinThrix')).toBeInTheDocument();
    expect(screen.getByText('Verificando seu email...')).toBeInTheDocument();
    
    // Verifica se o spinner está presente
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('deve verificar email com sucesso', async () => {
    mockEmailVerificationService.verifyEmail.mockResolvedValueOnce({
      success: true,
      message: 'Email verificado com sucesso!',
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user' as const,
        permissions: [],
        createdAt: '2024-01-01T00:00:00Z',
        emailVerified: true,
        emailVerifiedAt: '2024-01-01T00:00:00Z'
      }
    });

    renderWithRouter(<EmailVerification />);

    await waitFor(() => {
      expect(mockEmailVerificationService.verifyEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        token: 'valid-token'
      });
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: 'Email verificado com sucesso!' })).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Redirecionando para o dashboard em alguns segundos...')).toBeInTheDocument();
    });

    expect(mockSetUser).toHaveBeenCalledWith({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: true,
      emailVerifiedAt: '2024-01-01T00:00:00Z'
    });
  });

  it('deve mostrar erro quando verificação falha', async () => {
    mockEmailVerificationService.verifyEmail.mockResolvedValueOnce({
      success: false,
      message: 'Token inválido'
    });

    renderWithRouter(<EmailVerification />);

    await waitFor(() => {
      expect(screen.getByText('Erro na verificação')).toBeInTheDocument();
      expect(screen.getByText('Token inválido')).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: 'Voltar ao login' })).toBeInTheDocument();
  });

  it('deve mostrar estado de token expirado', async () => {
    const expiredError = new Error('Token expirado');
    mockEmailVerificationService.verifyEmail.mockRejectedValueOnce(expiredError);

    renderWithRouter(<EmailVerification />);

    await waitFor(() => {
      expect(screen.getByText('Link expirado')).toBeInTheDocument();
      expect(screen.getByText('Link de verificação expirado. Solicite um novo link.')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Reenviar email de verificação' })).toBeInTheDocument();
  });

  it('deve reenviar email de verificação quando token expirado', async () => {
    // Primeiro, simula token expirado
    const expiredError = new Error('Token expirado');
    mockEmailVerificationService.verifyEmail.mockRejectedValueOnce(expiredError);

    // Depois, simula reenvio bem-sucedido
    mockEmailVerificationService.resendVerificationEmail.mockResolvedValueOnce({
      success: true,
      message: 'Email reenviado com sucesso!'
    });

    renderWithRouter(<EmailVerification />);

    await waitFor(() => {
      expect(screen.getByText('Link expirado')).toBeInTheDocument();
    });

    const resendButton = screen.getByRole('button', { name: 'Reenviar email de verificação' });
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(resendButton).toHaveTextContent('Reenviando...');
      expect(resendButton).toBeDisabled();
    });

    await waitFor(() => {
      expect(mockEmailVerificationService.resendVerificationEmail).toHaveBeenCalledWith({
        email: 'test@example.com'
      });
    });
  });

  it('deve tratar erro de rede', async () => {
    const networkError = new Error('Network Error');
    mockEmailVerificationService.verifyEmail.mockRejectedValueOnce(networkError);

    renderWithRouter(<EmailVerification />);

    await waitFor(() => {
      expect(screen.getByText('Erro na verificação')).toBeInTheDocument();
      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });
  });

  it('deve ter link para voltar ao login', async () => {
    mockEmailVerificationService.verifyEmail.mockResolvedValueOnce({
      success: false,
      message: 'Erro qualquer'
    });

    renderWithRouter(<EmailVerification />);

    await waitFor(() => {
      const loginLink = screen.getByRole('link', { name: 'Voltar ao login' });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });

  it('deve ter acessibilidade adequada', async () => {
    const { container } = renderWithRouter(<EmailVerification />);

    // Aguarda o componente carregar
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'FinThrix' })).toBeInTheDocument();
    });

    // Verifica estrutura de cabeçalhos
    expect(screen.getByRole('heading', { level: 1, name: 'FinThrix' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Erro na verificação' })).toBeInTheDocument();

    // Verifica se há elementos SVG (ícones) na página
    const svgElements = container.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it('deve redirecionar para dashboard após verificação bem-sucedida', async () => {
    vi.useFakeTimers();
    
    mockEmailVerificationService.verifyEmail.mockResolvedValueOnce({
      success: true,
      message: 'Email verificado com sucesso!',
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user' as const,
        permissions: [],
        createdAt: '2024-01-01T00:00:00Z',
        emailVerified: true,
        emailVerifiedAt: '2024-01-01T00:00:00Z'
      }
    });

    renderWithRouter(<EmailVerification />);

    // Aguarda o título mudar para sucesso
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: 'Email verificado com sucesso!' })).toBeInTheDocument();
    }, { timeout: 10000 });

    // Avança o timer para simular o setTimeout
    vi.advanceTimersByTime(3000);

    // Verifica se o navigate foi chamado
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    
    vi.useRealTimers();
  });
});