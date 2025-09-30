/**
 * Configuração Centralizada de Segurança - FinThrix Dashboard
 * 
 * Este arquivo centraliza todas as configurações de segurança da aplicação,
 * seguindo os princípios de segurança por design e configuração segura por padrão.
 */

// Configurações de Rate Limiting
export const RATE_LIMIT_CONFIG = {
  // Limite padrão para requisições gerais
  DEFAULT: {
    maxRequests: parseInt(import.meta.env.VITE_RATE_LIMIT_REQUESTS || '100'),
    windowMs: parseInt(import.meta.env.VITE_RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  },
  
  // Limite para autenticação (mais restritivo)
  AUTH: {
    maxRequests: 10,
    windowMs: 15 * 60 * 1000, // 15 minutos
  },
  
  // Limite para APIs críticas
  CRITICAL_API: {
    maxRequests: 50,
    windowMs: 15 * 60 * 1000, // 15 minutos
  },
  
  // Limite para usuários admin
  ADMIN: {
    maxRequests: 200,
    windowMs: 15 * 60 * 1000, // 15 minutos
  }
} as const;

// Configurações de Validação
export const VALIDATION_CONFIG = {
  // Tamanhos máximos
  MAX_STRING_LENGTH: 1000,
  MAX_TEXTAREA_LENGTH: 5000,
  MAX_FILENAME_LENGTH: 255,
  MAX_URL_LENGTH: 2048,
  
  // Limites de dados
  MAX_ROWS_LIMIT: parseInt(import.meta.env.VITE_MAX_ROWS_LIMIT || '1000'),
  MAX_FORM_FIELDS: 20,
  MAX_FIELD_SIZE: 10000, // 10KB por campo
  
  // Padrões de validação
  PATTERNS: {
    SPREADSHEET_ID: /^[a-zA-Z0-9-_]{44}$/,
    RANGE: /^[A-Z]+[0-9]*:[A-Z]+[0-9]*$|^[A-Z]+:[A-Z]+$|^[^!]+![A-Z]+[0-9]*:[A-Z]+[0-9]*$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    GOOGLE_CLIENT_ID: /^[0-9]+-[a-zA-Z0-9_]+\.apps\.googleusercontent\.com$/,
    ACCESS_TOKEN: /^ya29\.[a-zA-Z0-9_-]+$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  },
  
  // Ranges permitidos para Google Sheets
  ALLOWED_RANGES: [
    'A:Z',
    'A1:Z1000',
    'A1:Z100',
    'Movimentacoes!A:Z',
    'Contas!A:Z',
    'Dashboard!A:Z'
  ]
} as const;

// Configurações de Criptografia
export const CRYPTO_CONFIG = {
  // Algoritmos
  ENCRYPTION_ALGORITHM: 'AES-GCM',
  KEY_DERIVATION_ALGORITHM: 'PBKDF2',
  HASH_ALGORITHM: 'SHA-256',
  
  // Parâmetros de segurança
  KEY_LENGTH: 256, // bits
  IV_LENGTH: 12, // bytes para AES-GCM
  SALT_LENGTH: 16, // bytes
  TAG_LENGTH: 16, // bytes para AES-GCM
  
  // Iterações para PBKDF2
  PBKDF2_ITERATIONS: 100000,
  
  // Configurações de armazenamento
  STORAGE: {
    DEFAULT_EXPIRATION: 24 * 60 * 60 * 1000, // 24 horas
    MAX_STORAGE_SIZE: 5 * 1024 * 1024, // 5MB
    ENCRYPTION_KEY_PREFIX: 'finthrix_secure_',
  }
} as const;

// Headers de Segurança
export const SECURITY_HEADERS = {
  // Content Security Policy
  CSP: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://apis.google.com https://accounts.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://sheets.googleapis.com https://*.supabase.co https://accounts.google.com",
    "img-src 'self' data: https: blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),
  
  // Outros headers de segurança
  HEADERS: {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin'
  }
} as const;

// Configurações de Logging
export const LOGGING_CONFIG = {
  // Níveis de log
  LEVELS: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  },
  
  // Configurações por ambiente
  PRODUCTION: {
    level: 1, // WARN e ERROR apenas
    enableConsole: false,
    enableRemote: true,
    sanitizeData: true
  },
  
  DEVELOPMENT: {
    level: 3, // Todos os níveis
    enableConsole: true,
    enableRemote: false,
    sanitizeData: false
  },
  
  // Dados sensíveis que devem ser redigidos
  SENSITIVE_PATTERNS: [
    /ya29\.[a-zA-Z0-9_-]+/g, // Google Access Tokens
    /sk_[a-zA-Z0-9_-]+/g, // Stripe Secret Keys
    /pk_[a-zA-Z0-9_-]+/g, // Stripe Public Keys
    /[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}/g, // Credit Card Numbers
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Email addresses
    /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
    /password["\s]*[:=]["\s]*[^"\s,}]+/gi, // Passwords
    /token["\s]*[:=]["\s]*[^"\s,}]+/gi, // Tokens
    /key["\s]*[:=]["\s]*[^"\s,}]+/gi, // Keys
    /secret["\s]*[:=]["\s]*[^"\s,}]+/gi // Secrets
  ],
  
  // Replacement para dados sensíveis
  REDACTION_TEXT: '[REDACTED]'
} as const;

// Configurações de Autenticação
export const AUTH_CONFIG = {
  // Google OAuth
  GOOGLE: {
    SCOPES: [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    DISCOVERY_DOC: 'https://sheets.googleapis.com/$discovery/rest?version=v4',
    
    // Timeouts
    INIT_TIMEOUT: 10000, // 10 segundos
    AUTH_TIMEOUT: 30000, // 30 segundos
    
    // Retry configuration
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000 // 1 segundo
  },
  
  // Configurações de sessão
  SESSION: {
    TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas
    REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutos antes da expiração
    MAX_CONCURRENT_SESSIONS: 3
  },
  
  // Configurações de token
  TOKEN: {
    MIN_LENGTH: 20,
    MAX_AGE: 3600 * 1000, // 1 hora
    REFRESH_BUFFER: 5 * 60 * 1000 // 5 minutos
  }
} as const;

// Configurações de Rede
export const NETWORK_CONFIG = {
  // Timeouts
  TIMEOUTS: {
    DEFAULT: 10000, // 10 segundos
    UPLOAD: 30000, // 30 segundos
    DOWNLOAD: 60000, // 60 segundos
    AUTH: 15000 // 15 segundos
  },
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    INITIAL_DELAY: 1000, // 1 segundo
    MAX_DELAY: 10000, // 10 segundos
    BACKOFF_FACTOR: 2
  },
  
  // Origens permitidas
  ALLOWED_ORIGINS: [
    'https://finthrix.vercel.app',
    'https://finthrix-dashboard.vercel.app',
    ...(import.meta.env.DEV ? ['http://localhost:8080', 'http://localhost:5173'] : [])
  ],
  
  // User Agents suspeitos (bots maliciosos)
  SUSPICIOUS_USER_AGENTS: [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /go-http-client/i,
    /okhttp/i
  ],
  
  // User Agents permitidos (bots legítimos)
  ALLOWED_BOTS: [
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
  ]
} as const;

// Configurações de Monitoramento
export const MONITORING_CONFIG = {
  // Métricas de segurança
  SECURITY_METRICS: {
    FAILED_AUTH_THRESHOLD: 5,
    RATE_LIMIT_THRESHOLD: 10,
    VALIDATION_ERROR_THRESHOLD: 20,
    SUSPICIOUS_ACTIVITY_THRESHOLD: 3
  },
  
  // Alertas
  ALERTS: {
    CRITICAL: {
      MULTIPLE_FAILED_LOGINS: 5,
      POTENTIAL_ATTACK: 10,
      SYSTEM_COMPROMISE: 1
    },
    WARNING: {
      HIGH_ERROR_RATE: 50,
      UNUSUAL_TRAFFIC: 100,
      PERFORMANCE_DEGRADATION: 5000 // ms
    }
  },
  
  // Retenção de dados
  DATA_RETENTION: {
    SECURITY_LOGS: 365 * 24 * 60 * 60 * 1000, // 1 ano
    AUDIT_LOGS: 180 * 24 * 60 * 60 * 1000, // 6 meses
    ERROR_LOGS: 90 * 24 * 60 * 60 * 1000, // 3 meses
    DEBUG_LOGS: 30 * 24 * 60 * 60 * 1000 // 1 mês
  }
} as const;

// Configurações de Ambiente
export const ENVIRONMENT_CONFIG = {
  // Detectar ambiente
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_TEST: import.meta.env.MODE === 'test',
  
  // URLs base
  BASE_URLS: {
    PRODUCTION: 'https://finthrix.vercel.app',
    DEVELOPMENT: 'http://localhost:8080',
    API: import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
  },
  
  // Feature flags de segurança
  SECURITY_FEATURES: {
    ENABLE_CSP: true,
    ENABLE_RATE_LIMITING: true,
    ENABLE_REQUEST_VALIDATION: true,
    ENABLE_ENCRYPTION: true,
    ENABLE_AUDIT_LOGGING: true,
    ENABLE_SECURITY_HEADERS: true,
    ENABLE_CORS_VALIDATION: true
  }
} as const;

// Configurações de Backup e Recuperação
export const BACKUP_CONFIG = {
  // Configurações de backup
  BACKUP: {
    ENABLED: true,
    INTERVAL: 24 * 60 * 60 * 1000, // 24 horas
    RETENTION_DAYS: 30,
    ENCRYPTION_ENABLED: true
  },
  
  // Configurações de recuperação
  RECOVERY: {
    MAX_RECOVERY_TIME: 4 * 60 * 60 * 1000, // 4 horas
    BACKUP_VERIFICATION: true,
    AUTO_RECOVERY: false
  }
} as const;

// Exportar configuração consolidada
export const SECURITY_CONFIG = {
  RATE_LIMIT: RATE_LIMIT_CONFIG,
  VALIDATION: VALIDATION_CONFIG,
  CRYPTO: CRYPTO_CONFIG,
  HEADERS: SECURITY_HEADERS,
  LOGGING: LOGGING_CONFIG,
  AUTH: AUTH_CONFIG,
  NETWORK: NETWORK_CONFIG,
  MONITORING: MONITORING_CONFIG,
  ENVIRONMENT: ENVIRONMENT_CONFIG,
  BACKUP: BACKUP_CONFIG
} as const;

// Tipo para configuração de segurança
export type SecurityConfig = typeof SECURITY_CONFIG;

// Função para validar configuração
export const validateSecurityConfig = (): boolean => {
  try {
    // Verificar variáveis de ambiente obrigatórias
    const requiredEnvVars = [
      'VITE_GOOGLE_CLIENT_ID',
      'VITE_GOOGLE_SPREADSHEET_ID',
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];

    const missingVars = requiredEnvVars.filter(
      varName => !import.meta.env[varName]
    );

    if (missingVars.length > 0) {
      console.error('❌ Variáveis de ambiente obrigatórias não encontradas:', missingVars);
      return false;
    }

    // Verificar formato das variáveis críticas
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!VALIDATION_CONFIG.PATTERNS.GOOGLE_CLIENT_ID.test(googleClientId)) {
      console.error('❌ VITE_GOOGLE_CLIENT_ID tem formato inválido');
      return false;
    }

    const spreadsheetId = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID;
    if (!VALIDATION_CONFIG.PATTERNS.SPREADSHEET_ID.test(spreadsheetId)) {
      console.error('❌ VITE_GOOGLE_SPREADSHEET_ID tem formato inválido');
      return false;
    }

    console.log('✅ Configuração de segurança validada com sucesso');
    return true;

  } catch (error) {
    console.error('❌ Erro ao validar configuração de segurança:', error);
    return false;
  }
};

// Função para obter configuração baseada no ambiente
export const getEnvironmentConfig = () => {
  const env = ENVIRONMENT_CONFIG;
  
  return {
    ...SECURITY_CONFIG,
    // Ajustar configurações baseadas no ambiente
    LOGGING: {
      ...SECURITY_CONFIG.LOGGING,
      ...(env.IS_PRODUCTION 
        ? SECURITY_CONFIG.LOGGING.PRODUCTION 
        : SECURITY_CONFIG.LOGGING.DEVELOPMENT
      )
    },
    RATE_LIMIT: {
      ...SECURITY_CONFIG.RATE_LIMIT,
      // Em desenvolvimento, ser mais permissivo
      ...(env.IS_DEVELOPMENT && {
        DEFAULT: {
          maxRequests: 1000,
          windowMs: 15 * 60 * 1000
        }
      })
    }
  };
};

// Exportar configuração baseada no ambiente
export const ENV_SECURITY_CONFIG = getEnvironmentConfig();

export default SECURITY_CONFIG;