# Guia de Implementação de Segurança - FinThrix

## Índice
1. [Setup Inicial](#setup-inicial)
2. [Implementação por Componente](#implementação-por-componente)
3. [Exemplos Práticos](#exemplos-práticos)
4. [Testes de Segurança](#testes-de-segurança)
5. [Troubleshooting](#troubleshooting)

## Setup Inicial

### 1. Configuração do Ambiente

#### Variáveis de Ambiente
Crie o arquivo `.env.local` na raiz do projeto:

```bash
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# Google Sheets Configuration  
VITE_GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Security Configuration (opcional)
VITE_RATE_LIMIT_REQUESTS=100
VITE_RATE_LIMIT_WINDOW_MS=900000
VITE_MAX_ROWS_LIMIT=1000
```

#### Instalação de Dependências
```bash
npm install
npm audit fix
```

### 2. Verificação de Segurança

#### Verificar Vulnerabilidades
```bash
npm audit
npm audit fix --force
```

#### Verificar Configurações
```typescript
// src/utils/config-validator.ts
import { InputValidator } from './security-utils';

export const validateEnvironment = () => {
  const requiredVars = [
    'VITE_GOOGLE_CLIENT_ID',
    'VITE_GOOGLE_SPREADSHEET_ID', 
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias não encontradas: ${missing.join(', ')}`);
  }

  // Validar formato das variáveis
  if (!InputValidator.validateGoogleClientId(import.meta.env.VITE_GOOGLE_CLIENT_ID)) {
    throw new Error('VITE_GOOGLE_CLIENT_ID inválido');
  }

  if (!InputValidator.validateSpreadsheetId(import.meta.env.VITE_GOOGLE_SPREADSHEET_ID)) {
    throw new Error('VITE_GOOGLE_SPREADSHEET_ID inválido');
  }

  console.log('✅ Configuração de ambiente validada com sucesso');
};
```

## Implementação por Componente

### 1. Proteção de Rotas

#### Implementação Básica
```typescript
// src/pages/Dashboard.tsx
import { ProtectedRoute, ProtectionLevels } from '../components/security/ProtectedRoute';
import { DashboardContent } from '../components/DashboardContent';

export const Dashboard = () => {
  return (
    <ProtectedRoute 
      protectionLevel={ProtectionLevels.AUTHENTICATED}
      onAccessDenied={(reason) => {
        console.log('Acesso negado ao dashboard:', reason);
        // Redirecionar para login ou mostrar mensagem
      }}
      onAccessGranted={() => {
        console.log('Acesso autorizado ao dashboard');
      }}
    >
      <DashboardContent />
    </ProtectedRoute>
  );
};
```

#### Proteção Avançada
```typescript
// src/pages/AdminPanel.tsx
import { ProtectedRoute } from '../components/security/ProtectedRoute';

const adminProtection = {
  requiresAuth: true,
  requiredRoles: ['admin', 'super_admin'],
  rateLimitConfig: {
    maxRequests: 50,
    windowMs: 15 * 60 * 1000 // 15 minutos
  },
  allowedOrigins: ['https://admin.finthrix.com'],
  customValidation: async (context) => {
    // Validação customizada para admin
    const hasAdminPermission = await checkAdminPermission(context.user?.id);
    return hasAdminPermission;
  }
};

export const AdminPanel = () => {
  return (
    <ProtectedRoute 
      protectionLevel={adminProtection}
      loadingComponent={<AdminLoadingSpinner />}
      fallbackComponent={<AdminAccessDenied />}
    >
      <AdminPanelContent />
    </ProtectedRoute>
  );
};
```

### 2. Middleware de Segurança

#### Uso em Componentes
```typescript
// src/components/DataFetcher.tsx
import { useSecurityMiddleware } from '../middleware/security-middleware';
import { useEffect, useState } from 'react';

export const DataFetcher = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const securityMiddleware = useSecurityMiddleware();

  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Aplicar middleware de segurança
      const securityCheck = await securityMiddleware.validateRequest({
        endpoint: '/api/sheets/data',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!securityCheck.isValid) {
        throw new Error(`Falha na validação de segurança: ${securityCheck.reason}`);
      }

      // Prosseguir com a requisição
      const response = await fetch('/api/sheets/data', {
        headers: securityCheck.secureHeaders
      });

      const result = await response.json();
      setData(result);
      
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={fetchData} disabled={loading}>
        {loading ? 'Carregando...' : 'Buscar Dados'}
      </button>
      {data && <DataDisplay data={data} />}
    </div>
  );
};
```

### 3. Armazenamento Seguro

#### Uso do SecureStorage
```typescript
// src/hooks/useSecureAuth.ts
import { useSecureStorage } from '../utils/encryption';
import { useEffect, useState } from 'react';

export const useSecureAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const { getItem, setItem, removeItem } = useSecureStorage();

  // Carregar dados de autenticação
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const authData = await getItem('auth_data');
        if (authData && authData.token && authData.expiresAt > Date.now()) {
          setUser(authData.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erro ao carregar dados de autenticação:', error);
      }
    };

    loadAuthData();
  }, []);

  const login = async (authResult) => {
    try {
      const authData = {
        token: authResult.access_token,
        user: authResult.user,
        expiresAt: Date.now() + (authResult.expires_in * 1000)
      };

      // Armazenar de forma criptografada
      await setItem('auth_data', authData, true, {
        expirationTime: authResult.expires_in * 1000
      });

      setUser(authData.user);
      setIsAuthenticated(true);
      
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await removeItem('auth_data');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return {
    isAuthenticated,
    user,
    login,
    logout
  };
};
```

### 4. Validação de Formulários

#### Implementação com Validação Segura
```typescript
// src/components/forms/SecureForm.tsx
import { useState } from 'react';
import { InputValidator, DataSanitizer } from '../utils/security-utils';
import { SecurityMiddleware } from '../middleware/security-middleware';

interface FormData {
  spreadsheetId: string;
  range: string;
  description: string;
}

export const SecureForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    spreadsheetId: '',
    range: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (data: FormData): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    // Validar Spreadsheet ID
    if (!InputValidator.validateSpreadsheetId(data.spreadsheetId)) {
      newErrors.spreadsheetId = 'ID da planilha inválido';
    }

    // Validar Range
    if (!InputValidator.validateRange(data.range)) {
      newErrors.range = 'Range inválido (ex: A1:Z100)';
    }

    // Validar Description
    if (!data.description || data.description.length < 3) {
      newErrors.description = 'Descrição deve ter pelo menos 3 caracteres';
    }

    if (data.description.length > 500) {
      newErrors.description = 'Descrição muito longa (máximo 500 caracteres)';
    }

    return newErrors;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    // Sanitizar entrada
    const sanitizedValue = DataSanitizer.sanitizeString(value);
    
    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));

    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar formulário
      const formErrors = validateForm(formData);
      if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors);
        return;
      }

      // Validar dados do formulário com middleware
      const isValid = SecurityMiddleware.validateFormData(formData, {
        maxFields: 10,
        maxFieldSize: 1000
      });

      if (!isValid) {
        throw new Error('Dados do formulário inválidos');
      }

      // Sanitizar dados finais
      const sanitizedData = {
        spreadsheetId: DataSanitizer.sanitizeString(formData.spreadsheetId),
        range: DataSanitizer.sanitizeString(formData.range),
        description: DataSanitizer.sanitizeString(formData.description)
      };

      await onSubmit(sanitizedData);
      
      // Limpar formulário após sucesso
      setFormData({
        spreadsheetId: '',
        range: '',
        description: ''
      });

    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      setErrors({ submit: 'Erro ao enviar formulário. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="spreadsheetId" className="block text-sm font-medium">
          ID da Planilha
        </label>
        <input
          id="spreadsheetId"
          type="text"
          value={formData.spreadsheetId}
          onChange={(e) => handleInputChange('spreadsheetId', e.target.value)}
          className={`mt-1 block w-full rounded-md border ${
            errors.spreadsheetId ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
        />
        {errors.spreadsheetId && (
          <p className="mt-1 text-sm text-red-600">{errors.spreadsheetId}</p>
        )}
      </div>

      <div>
        <label htmlFor="range" className="block text-sm font-medium">
          Range
        </label>
        <input
          id="range"
          type="text"
          value={formData.range}
          onChange={(e) => handleInputChange('range', e.target.value)}
          className={`mt-1 block w-full rounded-md border ${
            errors.range ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="A1:Z100"
        />
        {errors.range && (
          <p className="mt-1 text-sm text-red-600">{errors.range}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Descrição
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className={`mt-1 block w-full rounded-md border ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          rows={3}
          placeholder="Descrição da operação..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {errors.submit && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.submit}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar'}
      </button>
    </form>
  );
};
```

## Exemplos Práticos

### 1. Integração Completa com Google Sheets

```typescript
// src/services/secure-sheets-service.ts
import { GoogleSheetsService } from '../lib/google-sheets';
import { SecurityMiddleware } from '../middleware/security-middleware';
import { SecureLogger } from '../utils/security-utils';

export class SecureSheetsService {
  private sheetsService: GoogleSheetsService;
  private securityMiddleware: SecurityMiddleware;

  constructor() {
    this.sheetsService = new GoogleSheetsService();
    this.securityMiddleware = new SecurityMiddleware();
  }

  async fetchSecureData(accessToken: string, range: string) {
    try {
      // 1. Validar requisição
      const securityCheck = await this.securityMiddleware.validateRequest({
        endpoint: '/api/sheets/data',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!securityCheck.isValid) {
        throw new Error(`Falha na validação: ${securityCheck.reason}`);
      }

      // 2. Log da operação
      SecureLogger.logInfo('Iniciando busca de dados', {
        range,
        timestamp: Date.now()
      });

      // 3. Buscar dados com validações
      const data = await this.sheetsService.fetchMovimentacoes(accessToken, range);

      // 4. Log de sucesso
      SecureLogger.logInfo('Dados buscados com sucesso', {
        range,
        rowCount: data.length,
        timestamp: Date.now()
      });

      return data;

    } catch (error) {
      // 5. Log de erro seguro
      SecureLogger.logError('Erro ao buscar dados', error, {
        range,
        timestamp: Date.now()
      });
      
      throw error;
    }
  }
}
```

### 2. Hook de Autenticação Segura

```typescript
// src/hooks/useSecureGoogleAuth.ts
import { useState, useEffect } from 'react';
import { GoogleAuthService } from '../lib/google-auth';
import { useSecureStorage } from '../utils/encryption';
import { SecureLogger } from '../utils/security-utils';

export const useSecureGoogleAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { getItem, setItem, removeItem } = useSecureStorage();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authData = await getItem('google_auth');
      
      if (authData && authData.expiresAt > Date.now()) {
        setUser(authData.user);
        setIsAuthenticated(true);
        
        SecureLogger.logInfo('Usuário autenticado encontrado', {
          userId: authData.user?.id,
          expiresAt: authData.expiresAt
        });
      }
    } catch (error) {
      SecureLogger.logError('Erro ao verificar autenticação', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async () => {
    try {
      setIsLoading(true);
      
      const authService = new GoogleAuthService();
      const result = await authService.requestAccess();

      const authData = {
        accessToken: result.access_token,
        user: result.user,
        expiresAt: Date.now() + (result.expires_in * 1000)
      };

      // Armazenar de forma criptografada
      await setItem('google_auth', authData, true, {
        expirationTime: result.expires_in * 1000
      });

      setUser(authData.user);
      setIsAuthenticated(true);

      SecureLogger.logInfo('Login realizado com sucesso', {
        userId: authData.user?.id
      });

      return result;

    } catch (error) {
      SecureLogger.logError('Erro no login', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await removeItem('google_auth');
      setUser(null);
      setIsAuthenticated(false);

      SecureLogger.logInfo('Logout realizado com sucesso');

    } catch (error) {
      SecureLogger.logError('Erro no logout', error);
    }
  };

  const getAccessToken = async () => {
    try {
      const authData = await getItem('google_auth');
      
      if (!authData || authData.expiresAt <= Date.now()) {
        throw new Error('Token expirado ou não encontrado');
      }

      return authData.accessToken;
    } catch (error) {
      SecureLogger.logError('Erro ao obter token de acesso', error);
      throw error;
    }
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    signIn,
    signOut,
    getAccessToken
  };
};
```

## Testes de Segurança

### 1. Testes de Validação

```typescript
// src/__tests__/security/validation.test.ts
import { InputValidator, DataSanitizer } from '../../utils/security-utils';

describe('InputValidator', () => {
  describe('validateSpreadsheetId', () => {
    test('deve aceitar IDs válidos', () => {
      const validIds = [
        '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
      ];

      validIds.forEach(id => {
        expect(InputValidator.validateSpreadsheetId(id)).toBe(true);
      });
    });

    test('deve rejeitar IDs inválidos', () => {
      const invalidIds = [
        '',
        'abc',
        '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms!',
        'javascript:alert(1)',
        '<script>alert(1)</script>'
      ];

      invalidIds.forEach(id => {
        expect(InputValidator.validateSpreadsheetId(id)).toBe(false);
      });
    });
  });

  describe('validateRange', () => {
    test('deve aceitar ranges válidos', () => {
      const validRanges = [
        'A1:Z100',
        'Sheet1!A1:Z100',
        'A:Z',
        'A1:A1000'
      ];

      validRanges.forEach(range => {
        expect(InputValidator.validateRange(range)).toBe(true);
      });
    });

    test('deve rejeitar ranges inválidos', () => {
      const invalidRanges = [
        '',
        'A1:',
        ':Z100',
        'A1:Z100; DROP TABLE users;',
        '<script>alert(1)</script>'
      ];

      invalidRanges.forEach(range => {
        expect(InputValidator.validateRange(range)).toBe(false);
      });
    });
  });
});

describe('DataSanitizer', () => {
  test('deve sanitizar strings maliciosas', () => {
    const maliciousInputs = [
      '<script>alert(1)</script>',
      'javascript:alert(1)',
      '"><script>alert(1)</script>',
      'onload="alert(1)"'
    ];

    maliciousInputs.forEach(input => {
      const sanitized = DataSanitizer.sanitizeString(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).not.toContain('onload=');
    });
  });

  test('deve preservar conteúdo legítimo', () => {
    const legitimateInputs = [
      'Receita de vendas',
      'Conta 123.456.789-0',
      'R$ 1.234,56',
      'Data: 01/01/2024'
    ];

    legitimateInputs.forEach(input => {
      const sanitized = DataSanitizer.sanitizeString(input);
      expect(sanitized).toBe(input);
    });
  });
});
```

### 2. Testes de Middleware

```typescript
// src/__tests__/security/middleware.test.ts
import { SecurityMiddleware } from '../../middleware/security-middleware';

describe('SecurityMiddleware', () => {
  let middleware: SecurityMiddleware;

  beforeEach(() => {
    middleware = new SecurityMiddleware();
  });

  test('deve bloquear requisições sem token', async () => {
    const result = await middleware.validateRequest({
      endpoint: '/api/data',
      method: 'GET',
      headers: {}
    });

    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('token');
  });

  test('deve aceitar requisições válidas', async () => {
    const result = await middleware.validateRequest({
      endpoint: '/api/data',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer valid_token_here'
      }
    });

    expect(result.isValid).toBe(true);
  });

  test('deve aplicar rate limiting', async () => {
    const clientId = 'test_client';
    
    // Fazer muitas requisições rapidamente
    const promises = Array(150).fill(null).map(() => 
      middleware.validateRequest({
        endpoint: '/api/data',
        method: 'GET',
        headers: { 'Authorization': 'Bearer token' },
        clientId
      })
    );

    const results = await Promise.all(promises);
    const blocked = results.filter(r => !r.isValid && r.reason?.includes('rate limit'));
    
    expect(blocked.length).toBeGreaterThan(0);
  });
});
```

### 3. Testes de Criptografia

```typescript
// src/__tests__/security/encryption.test.ts
import { CryptoUtils, SecureStorage } from '../../utils/encryption';

describe('CryptoUtils', () => {
  test('deve criptografar e descriptografar dados', async () => {
    const originalData = { sensitive: 'data', token: 'abc123' };
    const password = 'test_password';

    const encrypted = await CryptoUtils.encrypt(JSON.stringify(originalData), password);
    expect(encrypted).not.toContain('sensitive');
    expect(encrypted).not.toContain('abc123');

    const decrypted = await CryptoUtils.decrypt(encrypted, password);
    const parsedData = JSON.parse(decrypted);
    
    expect(parsedData).toEqual(originalData);
  });

  test('deve falhar com senha incorreta', async () => {
    const data = 'sensitive data';
    const correctPassword = 'correct_password';
    const wrongPassword = 'wrong_password';

    const encrypted = await CryptoUtils.encrypt(data, correctPassword);
    
    await expect(
      CryptoUtils.decrypt(encrypted, wrongPassword)
    ).rejects.toThrow();
  });
});

describe('SecureStorage', () => {
  let storage: SecureStorage;

  beforeEach(() => {
    storage = new SecureStorage();
    localStorage.clear();
  });

  test('deve armazenar e recuperar dados criptografados', async () => {
    const testData = { user: 'john', token: 'secret123' };
    
    await storage.setItem('test_key', testData, true);
    const retrieved = await storage.getItem('test_key');
    
    expect(retrieved).toEqual(testData);
  });

  test('deve respeitar expiração', async () => {
    const testData = { temp: 'data' };
    
    await storage.setItem('temp_key', testData, true, {
      expirationTime: 100 // 100ms
    });

    // Aguardar expiração
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const retrieved = await storage.getItem('temp_key');
    expect(retrieved).toBeNull();
  });
});
```

## Troubleshooting

### 1. Problemas Comuns

#### Erro: "Variáveis de ambiente não encontradas"
```bash
# Verificar se o arquivo .env.local existe
ls -la .env.local

# Verificar conteúdo
cat .env.local

# Reiniciar servidor de desenvolvimento
npm run dev
```

#### Erro: "Token de acesso inválido"
```typescript
// Verificar validade do token
const token = await getAccessToken();
console.log('Token válido:', InputValidator.validateAccessToken(token));

// Forçar renovação
await signOut();
await signIn();
```

#### Erro: "Rate limit excedido"
```typescript
// Verificar configuração de rate limiting
const rateLimiter = new RateLimiter();
console.log('Limite atual:', rateLimiter.getCurrentLimit(clientId));

// Aguardar reset do limite
setTimeout(() => {
  // Tentar novamente
}, 15 * 60 * 1000); // 15 minutos
```

### 2. Debug de Segurança

#### Habilitar Logs Detalhados
```typescript
// src/utils/debug-security.ts
export const enableSecurityDebug = () => {
  // Habilitar logs detalhados
  localStorage.setItem('security_debug', 'true');
  
  // Interceptar logs
  const originalLog = console.log;
  console.log = (...args) => {
    if (args[0]?.includes?.('SECURITY')) {
      originalLog('🔒 SECURITY DEBUG:', ...args);
    } else {
      originalLog(...args);
    }
  };
};

// Usar no desenvolvimento
if (import.meta.env.DEV) {
  enableSecurityDebug();
}
```

#### Verificar Headers de Segurança
```typescript
// src/utils/security-checker.ts
export const checkSecurityHeaders = async (url: string) => {
  try {
    const response = await fetch(url);
    const headers = response.headers;
    
    const securityHeaders = {
      'strict-transport-security': headers.get('strict-transport-security'),
      'x-content-type-options': headers.get('x-content-type-options'),
      'x-frame-options': headers.get('x-frame-options'),
      'content-security-policy': headers.get('content-security-policy')
    };
    
    console.table(securityHeaders);
    return securityHeaders;
  } catch (error) {
    console.error('Erro ao verificar headers:', error);
  }
};
```

### 3. Monitoramento em Produção

#### Setup de Alertas
```typescript
// src/utils/security-monitoring.ts
export class SecurityMonitor {
  private static instance: SecurityMonitor;
  private alertThresholds = {
    failedLogins: 5,
    rateLimitHits: 10,
    validationErrors: 20
  };

  static getInstance() {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  trackSecurityEvent(event: string, metadata?: any) {
    const eventData = {
      event,
      timestamp: Date.now(),
      metadata,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Enviar para serviço de monitoramento
    this.sendToMonitoring(eventData);
    
    // Verificar se precisa alertar
    this.checkAlertThresholds(event);
  }

  private sendToMonitoring(eventData: any) {
    // Implementar envio para serviço de monitoramento
    // Ex: Sentry, LogRocket, etc.
    console.log('Security Event:', eventData);
  }

  private checkAlertThresholds(event: string) {
    // Implementar lógica de alertas
    // Ex: se muitos eventos de falha, enviar alerta
  }
}
```

---

Este guia fornece uma implementação prática e completa das funcionalidades de segurança do FinThrix Dashboard. Siga as instruções passo a passo para garantir que sua aplicação esteja adequadamente protegida contra as principais ameaças de segurança.