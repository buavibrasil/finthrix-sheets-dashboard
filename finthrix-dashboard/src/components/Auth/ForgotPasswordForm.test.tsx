import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ForgotPasswordForm from './ForgotPasswordForm';

// Mock do useAuthStore
const mockForgotPassword = vi.fn();
const mockClearError = vi.fn();
let mockAuthState = {
  forgotPassword: mockForgotPassword,
  isLoading: false,
  error: null as string | null,
  clearError: mockClearError,
};

vi.mock('../../stores/authStore', () => ({
  useAuthStore: () => mockAuthState,
}));

describe('ForgotPasswordForm', () => {
  const mockOnBackToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState = {
      forgotPassword: mockForgotPassword,
      isLoading: false,
      error: null,
      clearError: mockClearError,
    };
  });

  it('deve renderizar o formulário corretamente', () => {
    render(<ForgotPasswordForm onBackToLogin={mockOnBackToLogin} />);

    expect(screen.getByText('Recuperar senha')).toBeInTheDocument();
    expect(screen.getByText('Digite seu email e enviaremos um link para redefinir sua senha.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar link de recuperação' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '← Voltar ao login' })).toBeInTheDocument();
  });

  it('deve validar email obrigatório', async () => {
    render(<ForgotPasswordForm onBackToLogin={mockOnBackToLogin} />);

    const submitButton = screen.getByRole('button', { name: 'Enviar link de recuperação' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
    });
  });

  it('deve validar formato do email', async () => {
    render(<ForgotPasswordForm onBackToLogin={mockOnBackToLogin} />);

    const emailInput = screen.getByLabelText('Email *');
    fireEvent.change(emailInput, { target: { value: 'email-invalido' } });

    const submitButton = screen.getByRole('button', { name: 'Enviar link de recuperação' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
    });
  });

  it('deve chamar forgotPassword com email válido', async () => {
    mockForgotPassword.mockResolvedValue(undefined);
    
    render(<ForgotPasswordForm onBackToLogin={mockOnBackToLogin} />);

    const emailInput = screen.getByLabelText('Email *');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const submitButton = screen.getByRole('button', { name: 'Enviar link de recuperação' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('deve exibir mensagem de sucesso após envio', async () => {
    mockForgotPassword.mockResolvedValue(undefined);
    
    render(<ForgotPasswordForm onBackToLogin={mockOnBackToLogin} />);

    const emailInput = screen.getByLabelText('Email *');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const submitButton = screen.getByRole('button', { name: 'Enviar link de recuperação' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Verifique seu email')).toBeInTheDocument();
      expect(screen.getByText('Enviamos um link para redefinir sua senha para:')).toBeInTheDocument();
    });
  });

  it('deve exibir estado de carregamento', () => {
    mockAuthState.isLoading = true;

    render(<ForgotPasswordForm onBackToLogin={mockOnBackToLogin} />);

    expect(screen.getByRole('button', { name: 'Enviando email de recuperação, aguarde...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviando email de recuperação, aguarde...' })).toBeDisabled();
  });

  it('deve exibir erro quando presente', () => {
    mockAuthState.error = 'Email não encontrado';

    render(<ForgotPasswordForm onBackToLogin={mockOnBackToLogin} />);

    expect(screen.getByText('Email não encontrado')).toBeInTheDocument();
  });

  it('deve chamar onBackToLogin quando botão voltar é clicado', () => {
    render(<ForgotPasswordForm onBackToLogin={mockOnBackToLogin} />);

    const backButton = screen.getByRole('button', { name: '← Voltar ao login' });
    fireEvent.click(backButton);

    expect(mockOnBackToLogin).toHaveBeenCalled();
  });

  it('deve ter atributos de acessibilidade corretos', () => {
    render(<ForgotPasswordForm onBackToLogin={mockOnBackToLogin} />);

    const emailInput = screen.getByLabelText('Email *');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('aria-required', 'true');

    const submitButton = screen.getByRole('button', { name: 'Enviar link de recuperação' });
    expect(submitButton).toHaveAttribute('type', 'submit');
  });


});