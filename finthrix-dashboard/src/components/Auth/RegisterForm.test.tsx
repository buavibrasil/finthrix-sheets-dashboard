import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RegisterForm from './RegisterForm';
import { useAuthStore } from '../../stores/authStore';

// Mock do store
vi.mock('../../stores/authStore');

const mockUseAuthStore = vi.mocked(useAuthStore);

describe('RegisterForm', () => {
  const mockRegister = vi.fn();
  const mockClearError = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnLoginClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockReturnValue({
      register: mockRegister,
      isLoading: false,
      error: null,
      clearError: mockClearError,
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
      resetPassword: vi.fn(),
      changePassword: vi.fn(),
    });
  });

  it('deve renderizar todos os campos obrigatórios', () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText('Nome completo *')).toBeInTheDocument();
    expect(screen.getByLabelText('Email *')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha *')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar senha *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
  });

  it('deve exibir o título e subtítulo corretos', () => {
    render(<RegisterForm />);

    expect(screen.getByRole('heading', { name: 'FinThrix' })).toBeInTheDocument();
    expect(screen.getByText('Crie sua conta')).toBeInTheDocument();
  });

  it('deve validar campos obrigatórios', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const submitButton = screen.getByRole('button', { name: /criar conta/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();
      expect(screen.getByText('Confirmação de senha é obrigatória')).toBeInTheDocument();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('deve validar formato de email', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const emailInput = screen.getByLabelText('Email *');
    await user.type(emailInput, 'email-invalido');

    const submitButton = screen.getByRole('button', { name: /criar conta/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
    });
  });

  it('deve validar tamanho mínimo da senha', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const passwordInput = screen.getByLabelText('Senha *');
    await user.type(passwordInput, '123');

    const submitButton = screen.getByRole('button', { name: /criar conta/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Senha deve ter pelo menos 6 caracteres')).toBeInTheDocument();
    });
  });

  it('deve validar confirmação de senha', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const passwordInput = screen.getByLabelText('Senha *');
    const confirmPasswordInput = screen.getByLabelText('Confirmar senha *');

    await user.type(passwordInput, 'senha123');
    await user.type(confirmPasswordInput, 'senha456');

    const submitButton = screen.getByRole('button', { name: /criar conta/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('As senhas não coincidem')).toBeInTheDocument();
    });
  });

  it('deve validar tamanho do nome', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const nameInput = screen.getByLabelText('Nome completo *');
    await user.type(nameInput, 'A');

    const submitButton = screen.getByRole('button', { name: /criar conta/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Nome deve ter pelo menos 2 caracteres')).toBeInTheDocument();
    });
  });

  it('deve submeter formulário com dados válidos', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue(undefined);

    render(<RegisterForm onSuccess={mockOnSuccess} />);

    await user.type(screen.getByLabelText('Nome completo *'), 'João Silva');
    await user.type(screen.getByLabelText('Email *'), 'joao@exemplo.com');
    await user.type(screen.getByLabelText('Senha *'), 'senha123');
    await user.type(screen.getByLabelText('Confirmar senha *'), 'senha123');

    const submitButton = screen.getByRole('button', { name: /criar conta/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockClearError).toHaveBeenCalled();
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'João Silva',
        email: 'joao@exemplo.com',
        password: 'senha123',
        confirmPassword: 'senha123',
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('deve exibir estado de carregamento', () => {
    mockUseAuthStore.mockReturnValue({
      register: mockRegister,
      isLoading: true,
      error: null,
      clearError: mockClearError,
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
      resetPassword: vi.fn(),
      changePassword: vi.fn(),
    });

    render(<RegisterForm />);

    const submitButton = screen.getByRole('button', { name: /processando cadastro/i });
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Criando conta...')).toBeInTheDocument();
  });

  it('deve exibir mensagem de erro', () => {
    const errorMessage = 'Email já está em uso';
    mockUseAuthStore.mockReturnValue({
      register: mockRegister,
      isLoading: false,
      error: errorMessage,
      clearError: mockClearError,
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
      resetPassword: vi.fn(),
      changePassword: vi.fn(),
    });

    render(<RegisterForm />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('deve exibir link para login quando onLoginClick é fornecido', () => {
    render(<RegisterForm onLoginClick={mockOnLoginClick} />);

    expect(screen.getByText('Já tem uma conta?')).toBeInTheDocument();
    
    const loginLink = screen.getByRole('button', { name: /fazer login/i });
    expect(loginLink).toBeInTheDocument();
  });

  it('deve chamar onLoginClick quando link é clicado', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onLoginClick={mockOnLoginClick} />);

    const loginLink = screen.getByRole('button', { name: /fazer login/i });
    await user.click(loginLink);

    expect(mockOnLoginClick).toHaveBeenCalled();
  });

  it('não deve exibir link para login quando onLoginClick não é fornecido', () => {
    render(<RegisterForm />);

    expect(screen.queryByText('Já tem uma conta?')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /fazer login/i })).not.toBeInTheDocument();
  });

  it('deve limpar formulário após sucesso', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue(undefined);

    render(<RegisterForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText('Nome completo *') as HTMLInputElement;
    const emailInput = screen.getByLabelText('Email *') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Senha *') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirmar senha *') as HTMLInputElement;

    await user.type(nameInput, 'João Silva');
    await user.type(emailInput, 'joao@exemplo.com');
    await user.type(passwordInput, 'senha123');
    await user.type(confirmPasswordInput, 'senha123');

    const submitButton = screen.getByRole('button', { name: /criar conta/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(nameInput.value).toBe('');
      expect(emailInput.value).toBe('');
      expect(passwordInput.value).toBe('');
      expect(confirmPasswordInput.value).toBe('');
    });
  });

  it('deve ter atributos de acessibilidade corretos', () => {
    render(<RegisterForm />);

    const nameInput = screen.getByLabelText('Nome completo *');
    const emailInput = screen.getByLabelText('Email *');
    const passwordInput = screen.getByLabelText('Senha *');
    const confirmPasswordInput = screen.getByLabelText('Confirmar senha *');

    expect(nameInput).toHaveAttribute('aria-required', 'true');
    expect(emailInput).toHaveAttribute('aria-required', 'true');
    expect(passwordInput).toHaveAttribute('aria-required', 'true');
    expect(confirmPasswordInput).toHaveAttribute('aria-required', 'true');

    expect(passwordInput).toHaveAttribute('aria-describedby', 'password-help');
    expect(screen.getByText('Mínimo de 6 caracteres')).toHaveAttribute('id', 'password-help');
  });

  it('deve ter atributos de acessibilidade para erros', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const submitButton = screen.getByRole('button', { name: /criar conta/i });
    await user.click(submitButton);

    await waitFor(() => {
      const nameInput = screen.getByLabelText('Nome completo *');
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');

      const errorElement = screen.getByText('Nome é obrigatório');
      expect(errorElement).toHaveAttribute('role', 'alert');
      expect(errorElement).toHaveAttribute('aria-live', 'polite');
    });
  });
});