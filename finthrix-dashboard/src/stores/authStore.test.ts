import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'
import * as authService from '@/services/authService'

// Mock do authService
vi.mock('@/services/authService', () => ({
  default: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    refreshToken: vi.fn(),
  }
}))

const mockAuthService = vi.mocked(authService.default)

describe('AuthStore', () => {
  beforeEach(() => {
    // Limpar o store antes de cada teste
    useAuthStore.getState().logout()
    vi.clearAllMocks()
  })

  it('deve ter estado inicial correto', () => {
    const state = useAuthStore.getState()
    
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('deve fazer login com sucesso', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user' as const,
      permissions: ['read'],
      createdAt: '2024-01-01T00:00:00Z',
    }
    
    const mockResponse = {
      user: mockUser,
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600,
    }

    mockAuthService.login.mockResolvedValue(mockResponse)

    const store = useAuthStore.getState()
    await store.login({ email: 'test@example.com', password: 'password' })

    const newState = useAuthStore.getState()
    expect(newState.user).toEqual(mockUser)
    expect(newState.token).toBe('mock-token')
    expect(newState.isAuthenticated).toBe(true)
    expect(newState.isLoading).toBe(false)
    expect(newState.error).toBeNull()
  })

  it('deve lidar com erro de login', async () => {
    const errorMessage = 'Credenciais inválidas'
    mockAuthService.login.mockRejectedValue(new Error(errorMessage))

    const store = useAuthStore.getState()
    
    // Capturar o erro lançado
    await expect(
      store.login({ email: 'test@example.com', password: 'wrong-password' })
    ).rejects.toThrow(errorMessage)

    const newState = useAuthStore.getState()
    expect(newState.user).toBeNull()
    expect(newState.token).toBeNull()
    expect(newState.isAuthenticated).toBe(false)
    expect(newState.isLoading).toBe(false)
    expect(newState.error).toBe('Erro ao fazer login')
  })

  it('deve fazer logout corretamente', async () => {
    // Primeiro fazer login
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user' as const,
      permissions: ['read'],
      createdAt: '2024-01-01T00:00:00Z',
    }

    mockAuthService.login.mockResolvedValue({
      user: mockUser,
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600,
    })

    const store = useAuthStore.getState()
    await store.login({ email: 'test@example.com', password: 'password' })

    // Agora fazer logout
    mockAuthService.logout.mockResolvedValue(undefined)
    await store.logout()

    const newState = useAuthStore.getState()
    expect(newState.user).toBeNull()
    expect(newState.token).toBeNull()
    expect(newState.isAuthenticated).toBe(false)
    expect(newState.error).toBeNull()
  })

  it('deve definir loading durante operações assíncronas', async () => {
    let resolveLogin: (value: any) => void
    const loginPromise = new Promise(resolve => {
      resolveLogin = resolve
    })
    
    mockAuthService.login.mockReturnValue(loginPromise as any)

    const store = useAuthStore.getState()
    const loginCall = store.login({ email: 'test@example.com', password: 'password' })

    // Verificar que loading está true durante a operação
    expect(useAuthStore.getState().isLoading).toBe(true)

    // Resolver o promise
    resolveLogin!({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user' as const,
        permissions: ['read'],
        createdAt: '2024-01-01T00:00:00Z',
      },
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600,
    })

    await loginCall

    // Verificar que loading voltou para false
    expect(useAuthStore.getState().isLoading).toBe(false)
  })
})