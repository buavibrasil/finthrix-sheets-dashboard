import { describe, it, expect, vi, beforeEach } from 'vitest';
import { emailVerificationService } from './emailVerificationService';

// Mock do fetch global
const mockFetch = vi.fn();

describe('EmailVerificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
  });

  describe('verifyEmail', () => {
    it('deve verificar email com sucesso', async () => {
      const mockResponseData = {
        success: true,
        message: 'Email verificado com sucesso!',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          emailVerified: true,
          emailVerifiedAt: '2024-01-01T00:00:00Z'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponseData)
      } as Response);

      const result = await emailVerificationService.verifyEmail({
        email: 'test@example.com',
        token: 'valid-token'
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/verify-email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            token: 'valid-token'
          })
        }
      );

      expect(result).toEqual({
        success: true,
        message: 'Email verificado com sucesso!',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          emailVerified: true,
          emailVerifiedAt: '2024-01-01T00:00:00Z'
        }
      });
    });

    it('deve retornar erro quando token é inválido', async () => {
      const mockErrorData = {
        success: false,
        message: 'Token inválido ou expirado'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve(mockErrorData)
      } as Response);

      const result = await emailVerificationService.verifyEmail({
        email: 'test@example.com',
        token: 'invalid-token'
      });

      expect(result).toEqual({
        success: false,
        message: 'Token inválido ou expirado'
      });
    });

    it('deve tratar erro de rede', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'));

      const result = await emailVerificationService.verifyEmail({
        email: 'test@example.com',
        token: 'valid-token'
      });

      expect(result).toEqual({
        success: false,
        message: 'Network Error'
      });
    });
  });

  describe('resendVerificationEmail', () => {
    it('deve reenviar email com sucesso', async () => {
      const mockResponseData = {
        success: true,
        message: 'Email de verificação reenviado!'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponseData)
      } as Response);

      const result = await emailVerificationService.resendVerificationEmail({
        email: 'test@example.com'
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/resend-verification',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com'
          })
        }
      );

      expect(result).toEqual({
        success: true,
        message: 'Email de verificação reenviado!'
      });
    });

    it('deve retornar erro quando email não existe', async () => {
      const mockErrorData = {
        success: false,
        message: 'Email não encontrado'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve(mockErrorData)
      } as Response);

      const result = await emailVerificationService.resendVerificationEmail({
        email: 'nonexistent@example.com'
      });

      expect(result).toEqual({
        success: false,
        message: 'Email não encontrado'
      });
    });

    it('deve retornar erro quando email já foi verificado', async () => {
      const mockErrorData = {
        success: false,
        message: 'Email já foi verificado'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve(mockErrorData)
      } as Response);

      const result = await emailVerificationService.resendVerificationEmail({
        email: 'verified@example.com'
      });

      expect(result).toEqual({
        success: false,
        message: 'Email já foi verificado'
      });
    });
  });

  describe('checkEmailVerificationStatus', () => {
    it('deve verificar status com sucesso', async () => {
      const mockResponseData = {
        success: true,
        emailVerified: true,
        message: 'Email verificado'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponseData)
      } as Response);

      const result = await emailVerificationService.checkEmailVerificationStatus('test@example.com');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/email-verification-status?email=test%40example.com',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      expect(result).toEqual({
        success: true,
        emailVerified: true,
        message: 'Email verificado'
      });
    });

    it('deve retornar erro quando usuário não é encontrado', async () => {
      const mockErrorData = {
        success: false,
        message: 'Usuário não encontrado'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve(mockErrorData)
      } as Response);

      const result = await emailVerificationService.checkEmailVerificationStatus('nonexistent@example.com');

      expect(result).toEqual({
        success: false,
        emailVerified: false,
        message: 'Usuário não encontrado'
      });
    });

    it('deve tratar erro de rede', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'));

      const result = await emailVerificationService.checkEmailVerificationStatus('test@example.com');

      expect(result).toEqual({
        success: false,
        emailVerified: false,
        message: 'Network Error'
      });
    });
  });
});