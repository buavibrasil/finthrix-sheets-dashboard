/**
 * Utilitário de Segurança e Validação
 * Implementa validações robustas e sanitização de dados
 * Segue princípios SOLID e boas práticas de segurança
 */

import { z } from 'zod';

// Schemas de validação usando Zod para type safety
export const GoogleSheetsRequestSchema = z.object({
  access_token: z.string().min(1, 'Token de acesso é obrigatório').regex(/^[A-Za-z0-9._-]+$/, 'Token inválido'),
  spreadsheet_id: z.string().min(1, 'ID da planilha é obrigatório').regex(/^[A-Za-z0-9_-]+$/, 'ID da planilha inválido'),
  range: z.string().min(1, 'Range é obrigatório').regex(/^[A-Za-z0-9!:]+$/, 'Range inválido')
});

export const EnvironmentVariableSchema = z.object({
  VITE_GOOGLE_CLIENT_ID: z.string().min(1, 'Google Client ID é obrigatório'),
  VITE_GOOGLE_SPREADSHEET_ID: z.string().min(1, 'Google Spreadsheet ID é obrigatório'),
  VITE_SUPABASE_URL: z.string().url('URL do Supabase deve ser válida'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'Chave do Supabase é obrigatória')
});

/**
 * Classe para sanitização de dados
 * Implementa o princípio da responsabilidade única (SRP)
 */
export class DataSanitizer {
  /**
   * Remove caracteres perigosos de strings
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      throw new Error('Input deve ser uma string');
    }
    
    return input
      .replace(/[<>\"'&]/g, '') // Remove caracteres HTML perigosos
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Sanitiza HTML removendo tags perigosas
   */
  static sanitizeHTML(input: string): string {
    const dangerousTags = /<(script|iframe|object|embed|form|input|meta|link)[^>]*>/gi;
    const dangerousAttributes = /(on\w+|javascript:|data:)/gi;
    
    return input
      .replace(dangerousTags, '')
      .replace(dangerousAttributes, '');
  }

  /**
   * Valida e sanitiza URLs
   */
  static sanitizeURL(url: string): string {
    try {
      const parsedURL = new URL(url);
      
      // Apenas permite HTTPS para APIs externas
      if (!['https:', 'http:'].includes(parsedURL.protocol)) {
        throw new Error('Protocolo não permitido');
      }
      
      // Lista de domínios permitidos
      const allowedDomains = [
        'sheets.googleapis.com',
        'accounts.google.com',
        'localhost'
      ];
      
      const isAllowed = allowedDomains.some(domain => 
        parsedURL.hostname === domain || 
        parsedURL.hostname.endsWith(`.${domain}`)
      );
      
      if (!isAllowed) {
        throw new Error('Domínio não permitido');
      }
      
      return parsedURL.toString();
    } catch (error) {
      throw new Error(`URL inválida: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}

/**
 * Classe para validação de entrada
 * Implementa o princípio da responsabilidade única (SRP)
 */
export class InputValidator {
  /**
   * Valida dados da requisição Google Sheets
   */
  static validateGoogleSheetsRequest(data: unknown) {
    try {
      return GoogleSheetsRequestSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        throw new Error(`Dados inválidos: ${messages.join(', ')}`);
      }
      throw error;
    }
  }

  /**
   * Valida variáveis de ambiente
   */
  static validateEnvironmentVariables(env: Record<string, string | undefined>) {
    try {
      return EnvironmentVariableSchema.parse(env);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        throw new Error(`Configuração inválida: ${messages.join(', ')}`);
      }
      throw error;
    }
  }

  /**
   * Valida token de acesso Google
   */
  static validateAccessToken(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // Token deve ter pelo menos 50 caracteres e formato válido
    const tokenRegex = /^[A-Za-z0-9._-]{50,}$/;
    return tokenRegex.test(token);
  }

  /**
   * Valida ID da planilha Google
   */
  static validateSpreadsheetId(id: string): boolean {
    if (!id || typeof id !== 'string') {
      return false;
    }
    
    // ID da planilha Google tem formato específico
    const idRegex = /^[A-Za-z0-9_-]{44}$/;
    return idRegex.test(id);
  }
}

/**
 * Classe para rate limiting
 * Implementa proteção contra ataques DDoS
 */
export class RateLimiter {
  private static requests = new Map<string, { count: number; resetTime: number }>();
  private static readonly MAX_REQUESTS = 100; // Máximo de requisições
  private static readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutos

  /**
   * Verifica se a requisição está dentro do limite
   */
  static checkLimit(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier);

    if (!userRequests || now > userRequests.resetTime) {
      // Primeira requisição ou janela expirou
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.WINDOW_MS
      });
      return true;
    }

    if (userRequests.count >= this.MAX_REQUESTS) {
      return false; // Limite excedido
    }

    // Incrementa contador
    userRequests.count++;
    return true;
  }

  /**
   * Obtém informações do rate limit
   */
  static getLimitInfo(identifier: string) {
    const userRequests = this.requests.get(identifier);
    if (!userRequests) {
      return {
        remaining: this.MAX_REQUESTS,
        resetTime: Date.now() + this.WINDOW_MS
      };
    }

    return {
      remaining: Math.max(0, this.MAX_REQUESTS - userRequests.count),
      resetTime: userRequests.resetTime
    };
  }
}

/**
 * Classe para logging seguro
 * Evita exposição de dados sensíveis em logs
 */
export class SecureLogger {
  private static readonly SENSITIVE_FIELDS = [
    'access_token', 'token', 'password', 'secret', 'key', 'auth',
    'authorization', 'bearer', 'api_key', 'client_secret'
  ];

  /**
   * Remove dados sensíveis de objetos antes do log
   */
  static sanitizeLogData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeLogData(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = this.SENSITIVE_FIELDS.some(field => 
        lowerKey.includes(field)
      );

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeLogData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Log seguro de erro
   */
  static logError(message: string, error: Error, context?: any) {
    const sanitizedContext = context ? this.sanitizeLogData(context) : undefined;
    
    console.error({
      message,
      error: {
        name: error.name,
        message: error.message,
        // Stack trace apenas em desenvolvimento
        ...(import.meta.env.DEV && { stack: error.stack })
      },
      context: sanitizedContext,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log seguro de informação
   */
  static logInfo(message: string, data?: any) {
    const sanitizedData = data ? this.sanitizeLogData(data) : undefined;
    
    console.log({
      message,
      data: sanitizedData,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Classe para validação de CSP (Content Security Policy)
 */
export class CSPValidator {
  /**
   * Gera CSP headers seguros
   */
  static generateCSPHeaders(): Record<string, string> {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://sheets.googleapis.com https://accounts.google.com https://*.supabase.co",
      "frame-src 'self' https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');

    return {
      'Content-Security-Policy': csp,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
  }
}