import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, LoginCredentials, RegisterData, EmailVerificationData, ResendVerificationData } from '../types/auth';
import authService from '../services/authService';
import { emailVerificationService } from '../services/emailVerificationService';

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: { token: string; password: string; confirmPassword: string }) => Promise<void>;
  verifyEmail: (data: EmailVerificationData) => Promise<void>;
  resendVerificationEmail: (data: ResendVerificationData) => Promise<void>;
  setUser: (user: any) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Estado inicial
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const authData = await authService.login(credentials);
          set({
            user: authData.user,
            token: authData.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.response?.data?.message || 'Erro ao fazer login',
          });
          throw error;
        }
      },

      // Registro
      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const authData = await authService.register(userData);
          set({
            user: authData.user,
            token: authData.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.response?.data?.message || 'Erro ao criar conta',
          });
          throw error;
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } catch (error) {
          console.error('Erro no logout:', error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Renovar token
      refreshToken: async () => {
        try {
          const authData = await authService.refreshToken();
          set({
            user: authData.user,
            token: authData.token,
            isAuthenticated: true,
            error: null,
          });
        } catch (error: any) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: error.response?.data?.message || 'Sessão expirada',
          });
          throw error;
        }
      },

      // Buscar usuário atual
      getCurrentUser: async () => {
        set({ isLoading: true });
        try {
          const user = await authService.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.response?.data?.message || 'Erro ao buscar usuário',
          });
          throw error;
        }
      },

      // Esqueci minha senha
      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await authService.requestPasswordReset({ email });
          set({ isLoading: false, error: null });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Erro ao enviar email de recuperação',
          });
          throw error;
        }
      },

      // Redefinir senha
      resetPassword: async (data: { token: string; password: string; confirmPassword: string }) => {
        set({ isLoading: true, error: null });
        try {
          await authService.changePassword({
            newPassword: data.password,
            confirmPassword: data.confirmPassword,
            token: data.token,
          });
          set({ isLoading: false, error: null });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Erro ao redefinir senha',
          });
          throw error;
        }
      },

      // Limpar erro
      clearError: () => {
        set({ error: null });
      },

      // Verificar email
      verifyEmail: async (data: EmailVerificationData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await emailVerificationService.verifyEmail(data);
          if (response.success && response.user) {
            set({
              user: response.user,
              isLoading: false,
              error: null,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Erro ao verificar email',
          });
          throw error;
        }
      },

      // Reenviar email de verificação
      resendVerificationEmail: async (data: ResendVerificationData) => {
        set({ isLoading: true, error: null });
        try {
          await emailVerificationService.resendVerificationEmail(data);
          set({ isLoading: false, error: null });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Erro ao reenviar email de verificação',
          });
          throw error;
        }
      },

      // Definir usuário
      setUser: (user: any) => {
        set({ user });
      },

      // Definir loading
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);