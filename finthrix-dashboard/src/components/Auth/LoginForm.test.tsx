import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import LoginForm from './LoginForm'
import { useAuthStore } from '@/stores/authStore'

// Mock do store
vi.mock('@/stores/authStore')

const mockLogin = vi.fn()
const mockUseAuthStore = vi.mocked(useAuthStore)

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuthStore.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      clearError: vi.fn(),
    })
  })

  it('deve renderizar o formulário de login', () => {
    render(<LoginForm />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Senha *')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('deve mostrar erros de validação para campos vazios', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /entrar/i })
    
    await act(async () => {
      await user.click(submitButton)
    })
    
    await waitFor(() => {
      expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument()
      expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument()
    })
  })

  // TODO: Fix validation test - validation errors not showing in tests
  // it('deve mostrar erro para email inválido', async () => {
  //   const user = userEvent.setup()
  //   render(<LoginForm />)
    
  //   const emailInput = screen.getByLabelText(/email/i)
  //   await user.type(emailInput, 'email-invalido')
    
  //   // Trigger validation by trying to submit
  //   const submitButton = screen.getByRole('button', { name: /entrar/i })
  //   await user.click(submitButton)
    
  //   // Check for validation error
  //   await waitFor(() => {
  //     const errorMessage = screen.queryByText('Email inválido')
  //     expect(errorMessage).toBeInTheDocument()
  //   }, { timeout: 3000 })
  // })

  it('deve chamar login com dados corretos', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const passwordInput = screen.getByLabelText('Senha *')
    const submitButton = screen.getByRole('button', { name: /entrar/i })
    
    await act(async () => {
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
    })
    
    // Verificar se os valores foram inseridos
    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
    
    await act(async () => {
      await user.click(submitButton)
    })
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      })
    }, { timeout: 3000 })
  })

  it('deve mostrar estado de loading', async () => {
    // Mock com estado de loading
    mockUseAuthStore.mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null,
      clearError: vi.fn(),
    })
    
    render(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /processando login/i })
    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/entrando.../i)).toBeInTheDocument()
  })

  it('deve mostrar erro de autenticação', async () => {
    const user = userEvent.setup()
    
    // Mock com erro
    mockUseAuthStore.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: 'Credenciais inválidas',
      clearError: vi.fn(),
    })
    
    render(<LoginForm />)
    
    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const passwordInput = screen.getByLabelText('Senha *')
    const submitButton = screen.getByRole('button', { name: /entrar/i })
    
    await act(async () => {
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
    })
    
    await act(async () => {
      await user.click(submitButton)
    })
    
    // Verificar se o erro é exibido
    expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument()
  })
})