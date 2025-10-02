import api from './api';
import { mockApi } from './mockApi';
import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  User, 
  ResetPasswordData, 
  ChangePasswordData 
} from '../types/auth';

class AuthService {
  // Login do usuário
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', credentials);
      const authData = response.data;
      
      // Salvar token no localStorage
      localStorage.setItem('auth_token', authData.token);
      localStorage.setItem('refresh_token', authData.refreshToken);
      
      if (credentials.rememberMe) {
        localStorage.setItem('remember_me', 'true');
      }
      
      return authData;
    } catch (error) {
      console.error('Erro no login (API real):', error);
      
      // Fallback para mock se a API real não estiver disponível
      if (this.isNetworkError(error)) {
        console.log('API real não disponível, usando mock...');
        try {
          const authData = await mockApi.login(credentials);
          
          // Salvar token no localStorage
          localStorage.setItem('auth_token', authData.token);
          localStorage.setItem('refresh_token', authData.refreshToken);
          
          if (credentials.rememberMe) {
            localStorage.setItem('remember_me', 'true');
          }
          
          return authData;
        } catch (mockError) {
          console.error('Erro no login (mock):', mockError);
          throw mockError;
        }
      }
      
      throw error;
    }
  }

  // Registro de novo usuário
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', userData);
      const authData = response.data;
      
      // Salvar token no localStorage
      localStorage.setItem('auth_token', authData.token);
      localStorage.setItem('refresh_token', authData.refreshToken);
      
      return authData;
    } catch (error) {
      console.error('Erro no registro (API real):', error);
      
      // Fallback para mock se a API real não estiver disponível
      if (this.isNetworkError(error)) {
        console.log('API real não disponível, usando mock...');
        try {
          const authData = await mockApi.register(userData);
          
          // Salvar token no localStorage
          localStorage.setItem('auth_token', authData.token);
          localStorage.setItem('refresh_token', authData.refreshToken);
          
          return authData;
        } catch (mockError) {
          console.error('Erro no registro (mock):', mockError);
          throw mockError;
        }
      }
      
      throw error;
    }
  }

  // Logout do usuário
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      // Limpar dados locais independentemente do resultado da API
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('remember_me');
    }
  }

  // Renovar token
  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('Refresh token não encontrado');
      }

      const response = await api.post('/auth/refresh', { refreshToken });
      const authData = response.data;
      
      // Atualizar tokens
      localStorage.setItem('auth_token', authData.token);
      localStorage.setItem('refresh_token', authData.refreshToken);
      
      return authData;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      // Se falhar, fazer logout
      this.logout();
      throw error;
    }
  }

  // Buscar dados do usuário atual
  async getCurrentUser(): Promise<User | null> {
    // Verificar se há token antes de fazer a chamada
    if (!this.isAuthenticated()) {
      return null;
    }

    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuário atual (API real):', error);
      
      // Fallback para mock se a API real não estiver disponível
      if (this.isNetworkError(error)) {
        console.log('API real não disponível, usando mock...');
        try {
          const token = this.getToken();
          if (token) {
            return await mockApi.getCurrentUser(token);
          }
        } catch (mockError) {
          console.error('Erro ao buscar usuário atual (mock):', mockError);
          throw mockError;
        }
      }
      
      throw error;
    }
  }

  // Solicitar reset de senha
  async requestPasswordReset(data: ResetPasswordData): Promise<void> {
    try {
      await api.post('/auth/forgot-password', data);
    } catch (error) {
      console.error('Erro ao solicitar reset de senha:', error);
      throw error;
    }
  }

  // Alterar senha
  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      await api.post('/auth/change-password', data);
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      throw error;
    }
  }

  // Verificar se o usuário está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  // Obter token atual
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Verificar se deve lembrar do usuário
  shouldRememberUser(): boolean {
    return localStorage.getItem('remember_me') === 'true';
  }

  // Método auxiliar para detectar erros de rede
  private isNetworkError(error: any): boolean {
    return (
      error.code === 'ECONNREFUSED' ||
      error.code === 'NETWORK_ERROR' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('ECONNREFUSED') ||
      !error.response // Axios não conseguiu fazer a requisição
    );
  }
}

export default new AuthService();