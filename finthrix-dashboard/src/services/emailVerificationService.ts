import { 
  EmailVerificationData, 
  EmailVerificationResponse, 
  ResendVerificationData, 
  ResendVerificationResponse 
} from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class EmailVerificationService {
  /**
   * Verifica o email do usuário usando o token recebido
   */
  async verifyEmail(data: EmailVerificationData): Promise<EmailVerificationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || 'Erro ao verificar email'
        };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro na verificação de email:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro de conexão. Tente novamente.'
      };
    }
  }

  /**
   * Reenvia o email de verificação para o usuário
   */
  async resendVerificationEmail(data: ResendVerificationData): Promise<ResendVerificationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || 'Erro ao reenviar email de verificação'
        };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro ao reenviar email de verificação:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro de conexão. Tente novamente.'
      };
    }
  }

  /**
   * Verifica se um email precisa de verificação
   */
  async checkEmailVerificationStatus(email: string): Promise<{ success: boolean; emailVerified: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/email-verification-status?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          emailVerified: false,
          message: errorData.message || 'Erro ao verificar status do email'
        };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro ao verificar status do email:', error);
      return {
        success: false,
        emailVerified: false,
        message: error instanceof Error ? error.message : 'Erro de conexão. Tente novamente.'
      };
    }
  }
}

export const emailVerificationService = new EmailVerificationService();
export default emailVerificationService;