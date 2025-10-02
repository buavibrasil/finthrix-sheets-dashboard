import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmailVerificationBanner from './EmailVerificationBanner';
import { useAuthStore } from '../../stores/authStore';
import { emailVerificationService } from '../../services/emailVerificationService';

// Mocks
vi.mock('../../stores/authStore');
vi.mock('../../services/emailVerificationService');

const mockUseAuthStore = vi.mocked(useAuthStore);
const mockEmailVerificationService = vi.mocked(emailVerificationService);

describe('EmailVerificationBanner', () => {
  const mockOnDismiss = vi.fn();
  const testEmail = 'test@example.com';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock do store com usuário não verificado
    mockUseAuthStore.mockReturnValue({
      user: {
        id: '1',
        email: testEmail,
        name: 'Test User',
        emailVerified: false,
        emailVerifiedAt: undefined
      },
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
      setUser: vi.fn()
    });
  });

  it('deve renderizar o banner para usuário com email não verificado', () => {
    render(<EmailVerificationBanner email={testEmail} onDismiss={mockOnDismiss} />);

    expect(screen.getByText('Email não verificado')).toBeInTheDocument();
    expect(screen.getByText(/Seu email/)).toBeInTheDocument();
    expect(screen.getByText(testEmail)).toBeInTheDocument();
    expect(screen.getByText(/ainda não foi verificado/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reenviar email' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dispensar' })).toBeInTheDocument();
  });

  it('não deve renderizar o banner se o usuário tem email verificado', () => {
    // Mock com usuário verificado
    mockUseAuthStore.mockReturnValue({
      user: {
        id: '1',
        email: testEmail,
        name: 'Test User',
        emailVerified: true,
        emailVerifiedAt: '2024-01-01T00:00:00Z'
      },
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
      setUser: vi.fn()
    });

    const { container } = render(<EmailVerificationBanner email={testEmail} onDismiss={mockOnDismiss} />);
    expect(container.firstChild).toBeNull();
  });

  it('deve reenviar email de verificação com sucesso', async () => {
    mockEmailVerificationService.resendVerificationEmail.mockResolvedValueOnce({
      success: true,
      message: 'Email de verificação reenviado com sucesso!'
    });

    render(<EmailVerificationBanner email={testEmail} onDismiss={mockOnDismiss} />);

    const resendButton = screen.getByRole('button', { name: 'Reenviar email' });
    fireEvent.click(resendButton);

    expect(resendButton).toHaveTextContent('Reenviando...');
    expect(resendButton).toBeDisabled();

    await waitFor(() => {
      expect(mockEmailVerificationService.resendVerificationEmail).toHaveBeenCalledWith({
        email: testEmail
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Email de verificação reenviado! Verifique sua caixa de entrada.')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(resendButton).toHaveTextContent('Reenviar email');
      expect(resendButton).not.toBeDisabled();
    });
  });

  it('deve mostrar erro ao falhar no reenvio', async () => {
    mockEmailVerificationService.resendVerificationEmail.mockResolvedValueOnce({
      success: false,
      message: 'Email não encontrado'
    });

    render(<EmailVerificationBanner email={testEmail} onDismiss={mockOnDismiss} />);

    const resendButton = screen.getByRole('button', { name: 'Reenviar email' });
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(screen.getByText('Email não encontrado')).toBeInTheDocument();
    });
  });

  it('deve tratar erro de rede no reenvio', async () => {
    const networkError = new Error('Network Error');
    mockEmailVerificationService.resendVerificationEmail.mockRejectedValueOnce(networkError);

    render(<EmailVerificationBanner email={testEmail} onDismiss={mockOnDismiss} />);

    const resendButton = screen.getByRole('button', { name: 'Reenviar email' });
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });
  });

  it('deve dispensar o banner ao clicar em "Dispensar"', () => {
    render(<EmailVerificationBanner email={testEmail} onDismiss={mockOnDismiss} />);

    const dismissButton = screen.getByRole('button', { name: 'Dispensar' });
    fireEvent.click(dismissButton);

    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('deve dispensar o banner ao clicar no X', () => {
    render(<EmailVerificationBanner email={testEmail} onDismiss={mockOnDismiss} />);

    const closeButton = screen.getByRole('button', { name: 'Fechar banner' });
    fireEvent.click(closeButton);

    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('deve ter acessibilidade adequada', () => {
    const { container } = render(<EmailVerificationBanner email={testEmail} onDismiss={mockOnDismiss} />);

    // Verifica se o ícone de aviso tem aria-hidden
    const warningIcon = container.querySelector('svg[aria-hidden="true"]');
    expect(warningIcon).toHaveAttribute('aria-hidden', 'true');

    // Verifica se o botão de fechar tem aria-label
    const closeButton = screen.getByRole('button', { name: 'Fechar banner' });
    expect(closeButton).toHaveAttribute('aria-label', 'Fechar banner');

    // Verifica se os botões são focáveis
    const resendButton = screen.getByRole('button', { name: 'Reenviar email' });
    const dismissButton = screen.getByRole('button', { name: 'Dispensar' });
    
    expect(resendButton).toBeVisible();
    expect(dismissButton).toBeVisible();
    expect(closeButton).toBeVisible();
  });

  it('deve limpar mensagem ao tentar reenviar novamente', async () => {
    mockEmailVerificationService.resendVerificationEmail
      .mockResolvedValueOnce({
        success: false,
        message: 'Primeiro erro'
      })
      .mockResolvedValueOnce({
        success: true,
        message: 'Sucesso na segunda tentativa'
      });

    render(<EmailVerificationBanner email={testEmail} onDismiss={mockOnDismiss} />);

    const resendButton = screen.getByRole('button', { name: 'Reenviar email' });
    
    // Primeira tentativa - erro
    fireEvent.click(resendButton);
    await waitFor(() => {
      expect(screen.getByText('Primeiro erro')).toBeInTheDocument();
    });

    // Segunda tentativa - sucesso
    fireEvent.click(resendButton);
    await waitFor(() => {
      expect(screen.queryByText('Primeiro erro')).not.toBeInTheDocument();
      expect(screen.getByText('Email de verificação reenviado! Verifique sua caixa de entrada.')).toBeInTheDocument();
    });
  });
});