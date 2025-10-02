import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ResetPasswordForm from './ResetPasswordForm';

// Mock do useAuthStore
const mockResetPassword = vi.fn();
const mockClearError = vi.fn();
let mockAuthState = {
  resetPassword: mockResetPassword,
  isLoading: false,
  error: null as string | null,
  clearError: mockClearError,
};

vi.mock('../../stores/authStore', () => ({
  useAuthStore: () => mockAuthState,
}));

describe('ResetPasswordForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnBackToLogin = vi.fn();
  const testToken = 'test-token-123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState = {
      resetPassword: mockResetPassword,
      isLoading: false,
      error: null,
      clearError: mockClearError,
    };
  });

  it('deve renderizar o formulário corretamente', () => {
    render(
      <ResetPasswordForm 
        token={testToken}
        onSuccess={mockOnSuccess}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    expect(screen.getAllByText('Redefinir senha')[0]).toBeInTheDocument();
    expect(screen.getByText('Digite sua nova senha abaixo.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nova senha *')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar nova senha *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Redefinir senha' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '← Voltar ao login' })).toBeInTheDocument();
  });

  it('deve validar senha obrigatória', async () => {
    render(
      <ResetPasswordForm 
        token={testToken}
        onSuccess={mockOnSuccess}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    const submitButton = screen.getByRole('button', { name: 'Redefinir senha' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Nova senha é obrigatória')).toBeInTheDocument();
    });
  });

  it('deve validar tamanho mínimo da senha', async () => {
    render(
      <ResetPasswordForm 
        token={testToken}
        onSuccess={mockOnSuccess}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    const passwordInput = screen.getByLabelText('Nova senha *');
    fireEvent.change(passwordInput, { target: { value: '123' } });

    const submitButton = screen.getByRole('button', { name: 'Redefinir senha' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Nova senha deve ter pelo menos 6 caracteres')).toBeInTheDocument();
    });
  });

  it('deve validar confirmação de senha obrigatória', async () => {
    render(
      <ResetPasswordForm 
        token={testToken}
        onSuccess={mockOnSuccess}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    const passwordInput = screen.getByLabelText('Nova senha *');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: 'Redefinir senha' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Confirmação de senha é obrigatória')).toBeInTheDocument();
    });
  });

  it('deve validar se senhas coincidem', async () => {
    render(
      <ResetPasswordForm 
        token={testToken}
        onSuccess={mockOnSuccess}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    const passwordInput = screen.getByLabelText('Nova senha *');
    const confirmPasswordInput = screen.getByLabelText('Confirmar nova senha *');
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });

    const submitButton = screen.getByRole('button', { name: 'Redefinir senha' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('As senhas não coincidem')).toBeInTheDocument();
    });
  });

  it('deve chamar resetPassword com dados válidos', async () => {
    mockResetPassword.mockResolvedValue(undefined);
    
    render(
      <ResetPasswordForm 
        token={testToken}
        onSuccess={mockOnSuccess}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    const passwordInput = screen.getByLabelText('Nova senha *');
    const confirmPasswordInput = screen.getByLabelText('Confirmar nova senha *');
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: 'Redefinir senha' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith({
        token: testToken,
        password: 'password123',
        confirmPassword: 'password123'
      });
    });
  });

  it('deve chamar onSuccess após redefinição bem-sucedida', async () => {
    mockResetPassword.mockResolvedValue(undefined);
    
    render(
      <ResetPasswordForm 
        token={testToken}
        onSuccess={mockOnSuccess}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    const passwordInput = screen.getByLabelText('Nova senha *');
    const confirmPasswordInput = screen.getByLabelText('Confirmar nova senha *');
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: 'Redefinir senha' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('deve exibir estado de carregamento', () => {
    mockAuthState.isLoading = true;

    render(
      <ResetPasswordForm 
        token={testToken}
        onSuccess={mockOnSuccess}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    expect(screen.getByRole('button', { name: 'Redefinindo senha, aguarde...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Redefinindo senha, aguarde...' })).toBeDisabled();
  });

  it('deve exibir erro quando presente', () => {
    mockAuthState.error = 'Token inválido ou expirado';

    render(
      <ResetPasswordForm 
        token={testToken}
        onSuccess={mockOnSuccess}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    expect(screen.getByText('Token inválido ou expirado')).toBeInTheDocument();
  });

  it('deve chamar onBackToLogin quando botão voltar é clicado', () => {
    render(
      <ResetPasswordForm 
        token={testToken}
        onSuccess={mockOnSuccess}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    const backButton = screen.getByRole('button', { name: '← Voltar ao login' });
    fireEvent.click(backButton);

    expect(mockOnBackToLogin).toHaveBeenCalled();
  });

  it('deve ter atributos de acessibilidade corretos', () => {
    render(
      <ResetPasswordForm 
        token={testToken}
        onSuccess={mockOnSuccess}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    const passwordInput = screen.getByLabelText('Nova senha *');
    const confirmPasswordInput = screen.getByLabelText('Confirmar nova senha *');
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('aria-required', 'true');
    expect(passwordInput).toHaveAttribute('aria-describedby', 'password-help');
    
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('aria-required', 'true');

    const submitButton = screen.getByRole('button', { name: 'Redefinir senha' });
    expect(submitButton).toHaveAttribute('type', 'submit');
  });


});