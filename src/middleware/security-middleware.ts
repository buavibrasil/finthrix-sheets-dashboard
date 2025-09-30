import { InputValidator, SecureLogger, RateLimiter } from '@/utils/security-validator';

/**
 * Middleware de Segurança para Proteção de Rotas e Endpoints
 * 
 * Este middleware implementa várias camadas de segurança:
 * - Rate limiting para prevenir ataques DDoS
 * - Validação de autenticação
 * - Sanitização de parâmetros
 * - Logging seguro de atividades
 */

export interface SecurityContext {
  userId?: string;
  accessToken?: string;
  userAgent?: string;
  ipAddress?: string;
  timestamp: number;
}

export interface SecurityMiddlewareOptions {
  requireAuth?: boolean;
  rateLimitRequests?: number;
  rateLimitWindow?: number;
  allowedOrigins?: string[];
  validateCSRF?: boolean;
}

export class SecurityMiddleware {
  private static rateLimiter = new RateLimiter();
  
  /**
   * Middleware principal de segurança
   */
  static async validateRequest(
    context: SecurityContext,
    options: SecurityMiddlewareOptions = {}
  ): Promise<{ success: boolean; error?: string }> {
    const {
      requireAuth = true,
      rateLimitRequests = 100,
      rateLimitWindow = 15 * 60 * 1000, // 15 minutos
      allowedOrigins = [],
      validateCSRF = false
    } = options;

    try {
      // 1. Rate Limiting
      const clientId = context.ipAddress || context.userId || 'anonymous';
      if (!this.rateLimiter.checkLimit(clientId, rateLimitRequests, rateLimitWindow)) {
        SecureLogger.logError('Rate limit excedido', new Error('Too many requests'), {
          clientId,
          userAgent: context.userAgent
        });
        return { success: false, error: 'Muitas requisições. Tente novamente mais tarde.' };
      }

      // 2. Validação de Autenticação
      if (requireAuth) {
        if (!context.accessToken || !InputValidator.validateAccessToken(context.accessToken)) {
          SecureLogger.logError('Token de acesso inválido ou ausente', new Error('Invalid token'), {
            hasToken: !!context.accessToken,
            clientId
          });
          return { success: false, error: 'Token de acesso inválido ou ausente.' };
        }
      }

      // 3. Validação de Origem (CORS)
      if (allowedOrigins.length > 0 && context.userAgent) {
        // Implementação básica - em produção, usar headers de origem reais
        const isValidOrigin = allowedOrigins.some(origin => 
          context.userAgent?.includes(origin) || origin === '*'
        );
        
        if (!isValidOrigin) {
          SecureLogger.logError('Origem não autorizada', new Error('Invalid origin'), {
            userAgent: context.userAgent,
            clientId
          });
          return { success: false, error: 'Origem não autorizada.' };
        }
      }

      // 4. Validação de User Agent (detecção básica de bots maliciosos)
      if (context.userAgent && this.isSuspiciousUserAgent(context.userAgent)) {
        SecureLogger.logError('User Agent suspeito detectado', new Error('Suspicious user agent'), {
          userAgent: context.userAgent,
          clientId
        });
        return { success: false, error: 'Acesso negado.' };
      }

      // 5. Log de acesso bem-sucedido
      SecureLogger.logInfo('Acesso autorizado', {
        clientId,
        hasAuth: requireAuth,
        timestamp: context.timestamp
      });

      return { success: true };

    } catch (error) {
      SecureLogger.logError('Erro no middleware de segurança', error as Error, {
        clientId: context.ipAddress || context.userId || 'anonymous'
      });
      return { success: false, error: 'Erro interno de segurança.' };
    }
  }

  /**
   * Validar parâmetros de entrada de forma segura
   */
  static validateParameters(params: Record<string, any>): { 
    success: boolean; 
    sanitizedParams?: Record<string, any>; 
    error?: string 
  } {
    try {
      const sanitizedParams: Record<string, any> = {};

      for (const [key, value] of Object.entries(params)) {
        // Sanitizar chave
        const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '');
        if (sanitizedKey !== key) {
          SecureLogger.logError('Chave de parâmetro inválida detectada', new Error('Invalid parameter key'), {
            originalKey: key,
            sanitizedKey
          });
          return { success: false, error: `Parâmetro inválido: ${key}` };
        }

        // Sanitizar valor baseado no tipo
        if (typeof value === 'string') {
          sanitizedParams[key] = InputValidator.sanitizeInput(value);
        } else if (typeof value === 'number') {
          sanitizedParams[key] = isNaN(value) ? 0 : value;
        } else if (typeof value === 'boolean') {
          sanitizedParams[key] = Boolean(value);
        } else if (Array.isArray(value)) {
          sanitizedParams[key] = value.map(item => 
            typeof item === 'string' ? InputValidator.sanitizeInput(item) : item
          );
        } else {
          // Para objetos complexos, converter para string e sanitizar
          sanitizedParams[key] = InputValidator.sanitizeInput(JSON.stringify(value));
        }
      }

      return { success: true, sanitizedParams };

    } catch (error) {
      SecureLogger.logError('Erro na validação de parâmetros', error as Error);
      return { success: false, error: 'Erro na validação de parâmetros.' };
    }
  }

  /**
   * Detectar User Agents suspeitos
   */
  private static isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
      /perl/i,
      /php/i,
      /ruby/i,
      /go-http-client/i,
      /libwww/i,
      /lwp/i,
      /winhttp/i,
      /httpclient/i,
      /okhttp/i,
      /apache-httpclient/i
    ];

    // Lista de bots legítimos que devem ser permitidos
    const allowedBots = [
      /googlebot/i,
      /bingbot/i,
      /slurp/i,
      /duckduckbot/i,
      /baiduspider/i,
      /yandexbot/i,
      /facebookexternalhit/i,
      /twitterbot/i,
      /linkedinbot/i,
      /whatsapp/i,
      /telegrambot/i
    ];

    // Verificar se é um bot permitido
    const isAllowedBot = allowedBots.some(pattern => pattern.test(userAgent));
    if (isAllowedBot) {
      return false;
    }

    // Verificar se é um bot suspeito
    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Gerar cabeçalhos de segurança para respostas HTTP
   */
  static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://apis.google.com https://accounts.google.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://sheets.googleapis.com https://*.supabase.co",
        "frame-src https://accounts.google.com",
        "object-src 'none'",
        "base-uri 'self'"
      ].join('; '),
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
  }

  /**
   * Validar e sanitizar dados de formulário
   */
  static validateFormData(formData: FormData): {
    success: boolean;
    sanitizedData?: Record<string, string>;
    error?: string;
  } {
    try {
      const sanitizedData: Record<string, string> = {};
      const maxFieldSize = 10000; // 10KB por campo
      const maxFields = 50; // Máximo de 50 campos

      let fieldCount = 0;
      for (const [key, value] of formData.entries()) {
        fieldCount++;
        
        if (fieldCount > maxFields) {
          return { success: false, error: 'Muitos campos no formulário.' };
        }

        if (typeof value === 'string') {
          if (value.length > maxFieldSize) {
            return { success: false, error: `Campo '${key}' muito grande.` };
          }
          
          sanitizedData[key] = InputValidator.sanitizeInput(value);
        } else {
          // Para arquivos ou outros tipos, converter para string
          sanitizedData[key] = '[FILE_OR_BINARY_DATA]';
        }
      }

      return { success: true, sanitizedData };

    } catch (error) {
      SecureLogger.logError('Erro na validação de dados de formulário', error as Error);
      return { success: false, error: 'Erro na validação do formulário.' };
    }
  }
}

/**
 * Hook React para usar o middleware de segurança
 */
export const useSecurityMiddleware = () => {
  const validateRequest = async (
    context: Partial<SecurityContext>,
    options?: SecurityMiddlewareOptions
  ) => {
    const fullContext: SecurityContext = {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      ...context
    };

    return SecurityMiddleware.validateRequest(fullContext, options);
  };

  const validateParameters = (params: Record<string, any>) => {
    return SecurityMiddleware.validateParameters(params);
  };

  const getSecurityHeaders = () => {
    return SecurityMiddleware.getSecurityHeaders();
  };

  return {
    validateRequest,
    validateParameters,
    getSecurityHeaders
  };
};