import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import authService from './authService';
import api from './api';
import { LoginCredentials, RegisterData, ResetPasswordData, ChangePasswordData } from '../types/auth';

// Mock do módulo api
vi.mock('./api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('deve fazer login com sucesso e salvar tokens', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true
      };

      const mockResponse = {
        data: {
          token: 'mock-token',
          refreshToken: 'mock-refresh-token',
          user: { id: 1, email: 'test@example.com', name: 'Test User' }
        }
      };

      (api.post as any).mockResolvedValue(mockResponse);

      const result = await authService.login(credentials);

      expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'mock-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', 'mock-refresh-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('remember_me', 'true');
      expect(result).toEqual(mockResponse.data);
    });

    it('deve fazer login sem remember me', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false
      };

      const mockResponse = {
        data: {
          token: 'mock-token',
          refreshToken: 'mock-refresh-token',
          user: { id: 1, email: 'test@example.com', name: 'Test User' }
        }
      };

      (api.post as any).mockResolvedValue(mockResponse);

      await authService.login(credentials);

      expect(localStorageMock.setItem).not.toHaveBeenCalledWith('remember_me', 'true');
    });

    it('deve lançar erro quando login falha', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrong-password'
      };

      const mockError = new Error('Credenciais inválidas');
      (api.post as any).mockRejectedValue(mockError);

      await expect(authService.login(credentials)).rejects.toThrow('Credenciais inválidas');
      expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
    });
  });

  describe('register', () => {
    it('deve registrar usuário com sucesso', async () => {
      const userData: RegisterData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const mockResponse = {
        data: {
          token: 'mock-token',
          refreshToken: 'mock-refresh-token',
          user: { id: 1, email: 'test@example.com', name: 'Test User' }
        }
      };

      (api.post as any).mockResolvedValue(mockResponse);

      const result = await authService.register(userData);

      expect(api.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'mock-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', 'mock-refresh-token');
      expect(result).toEqual(mockResponse.data);
    });

    it('deve lançar erro quando registro falha', async () => {
      const userData: RegisterData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const mockError = new Error('Email inválido');
      (api.post as any).mockRejectedValue(mockError);

      await expect(authService.register(userData)).rejects.toThrow('Email inválido');
    });
  });

  describe('logout', () => {
    it('deve fazer logout e limpar tokens', async () => {
      await authService.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('remember_me');
    });
  });

  describe('getCurrentUser', () => {
    it('deve retornar usuário atual quando token existe', async () => {
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' };
      const mockResponse = { data: mockUser };

      localStorageMock.getItem.mockReturnValue('mock-token');
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await authService.getCurrentUser();

      expect(api.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
    });

    it('deve retornar null quando não há token', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
      expect(api.get).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('deve renovar token com sucesso', async () => {
      const mockResponse = {
        data: {
          token: 'new-token',
          refreshToken: 'new-refresh-token'
        }
      };

      localStorageMock.getItem.mockReturnValue('old-refresh-token');
      (api.post as any).mockResolvedValue(mockResponse);

      const result = await authService.refreshToken();

      expect(api.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: 'old-refresh-token'
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'new-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', 'new-refresh-token');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('requestPasswordReset', () => {
    it('deve solicitar reset de senha com sucesso', async () => {
      const resetData: ResetPasswordData = {
        email: 'test@example.com',
        token: 'reset-token',
        newPassword: 'newPassword123'
      };

      const result = await authService.requestPasswordReset(resetData);

      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', resetData);
      expect(result).toBeUndefined();
    });
  });

  describe('changePassword', () => {
    it('deve alterar senha com sucesso', async () => {
      const changeData: ChangePasswordData = {
        currentPassword: 'currentPassword',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123'
      };

      const result = await authService.changePassword(changeData);

      expect(api.post).toHaveBeenCalledWith('/auth/change-password', changeData);
      expect(result).toBeUndefined();
    });
  });

  describe('isAuthenticated', () => {
    it('deve retornar true quando há token', () => {
      localStorageMock.getItem.mockReturnValue('mock-token');

      const result = authService.isAuthenticated();

      expect(result).toBe(true);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token');
    });

    it('deve retornar false quando não há token', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });
});