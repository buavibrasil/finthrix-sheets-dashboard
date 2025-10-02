import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { render, mockUser } from '@/test/utils'
import ProtectedRoute from './ProtectedRoute'
import { useAuthStore } from '@/stores/authStore'

// Mock do store
vi.mock('@/stores/authStore')

// Mock do react-router-dom Navigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom') as any
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate-to">{to}</div>,
  }
})

const mockUseAuthStore = vi.mocked(useAuthStore)

const TestComponent = () => <div data-testid="protected-content">Conteúdo Protegido</div>

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve mostrar loading quando isLoading é true', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: true,
      getCurrentUser: vi.fn(),
    })

    const { container } = render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    // Procurar pelo spinner de loading
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('deve redirecionar para login quando não autenticado', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      getCurrentUser: vi.fn(),
    })

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByTestId('navigate-to')).toHaveTextContent('/login')
  })

  it('deve renderizar children quando autenticado', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      isLoading: false,
      getCurrentUser: vi.fn(),
    })

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  it('deve mostrar acesso negado quando usuário não tem permissões necessárias', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { ...mockUser, permissions: ['read'] },
      isLoading: false,
      getCurrentUser: vi.fn(),
    })

    render(
      <ProtectedRoute requiredPermissions={['admin']}>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Acesso Negado')).toBeInTheDocument()
    expect(screen.getByText('Você não tem permissão para acessar esta página.')).toBeInTheDocument()
  })

  it('deve renderizar quando usuário tem permissões necessárias', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { ...mockUser, permissions: ['read', 'admin'] },
      isLoading: false,
      getCurrentUser: vi.fn(),
    })

    render(
      <ProtectedRoute requiredPermissions={['admin']}>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })
})