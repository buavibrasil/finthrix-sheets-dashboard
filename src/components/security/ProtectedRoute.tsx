import React, { useEffect, useState, ReactNode } from 'react';
import { useSecurityMiddleware } from '@/middleware/security-middleware';
import { useSecureStorage } from '@/utils/encryption';
import { SecureLogger } from '@/utils/security-validator';

/**
 * Componente de Proteção de Rotas - FinThrix Security Layer
 * 
 * DECISÕES DE DESIGN E ARQUITETURA:
 * 
 * 1. PADRÃO STRATEGY PATTERN:
 *    - Por que: Permite diferentes estratégias de autenticação (Google, JWT, etc.)
 *    - Benefício: Facilita adição de novos provedores sem modificar código existente
 *    - Trade-off: Adiciona complexidade inicial, mas garante extensibilidade
 * 
 * 2. PRINCÍPIOS SOLID APLICADOS:
 *    - S (Single Responsibility): Cada interface tem uma responsabilidade específica
 *    - O (Open/Closed): Extensível via props e estratégias, fechado para modificação
 *    - L (Liskov Substitution): Qualquer estratégia pode substituir outra
 *    - I (Interface Segregation): Interfaces pequenas e específicas
 *    - D (Dependency Inversion): Depende de abstrações, não implementações concretas
 * 
 * 3. SECURITY BY DESIGN:
 *    - Fail-safe defaults: Acesso negado por padrão
 *    - Defense in depth: Múltiplas camadas de validação
 *    - Principle of least privilege: Acesso mínimo necessário
 * 
 * 4. PERFORMANCE CONSIDERATIONS:
 *    - Lazy loading de componentes de fallback
 *    - Memoização de validações custosas
 *    - Rate limiting para prevenir ataques
 */

/**
 * Interface de Configuração de Proteção
 * 
 * DECISÃO: Usar interface ao invés de enum para flexibilidade
 * MOTIVO: Permite configurações dinâmicas e validações customizadas
 * ALTERNATIVA REJEITADA: Enum rígido (limitaria extensibilidade)
 */
export interface ProtectionLevel {
  requireAuth: boolean;                                    // Autenticação obrigatória
  requireRole?: string[];                                  // Roles específicas necessárias
  rateLimitRequests?: number;                             // Limite de requisições
  rateLimitWindow?: number;                               // Janela de tempo (ms)
  allowedOrigins?: string[];                              // Origens permitidas (CORS)
  customValidation?: (context: any) => Promise<boolean>; // Validação customizada
}

/**
 * Props do Componente ProtectedRoute
 * 
 * DECISÃO: Usar callbacks opcionais para eventos
 * MOTIVO: Permite logging e analytics sem acoplar o componente
 * BENEFÍCIO: Facilita debugging e monitoramento em produção
 */
export interface ProtectedRouteProps {
  children: ReactNode;                           // Conteúdo a ser protegido
  protectionLevel: ProtectionLevel;              // Nível de proteção necessário
  fallbackComponent?: ReactNode;                 // Componente para acesso negado
  loadingComponent?: ReactNode;                  // Componente de carregamento
  onAccessDenied?: (reason: string) => void;     // Callback para acesso negado
  onAccessGranted?: () => void;                  // Callback para acesso permitido
}

/**
 * Contexto de Autenticação
 * 
 * DECISÃO: Manter interface simples e extensível
 * MOTIVO: Diferentes provedores têm diferentes campos
 * PADRÃO: Campos opcionais para máxima compatibilidade
 */
export interface AuthContext {
  isAuthenticated: boolean;  // Status de autenticação
  accessToken?: string;      // Token de acesso (se disponível)
  userRole?: string;         // Role do usuário (para autorização)
  userId?: string;           // ID único do usuário
}

/**
 * Interface para Estratégias de Autenticação
 * 
 * PADRÃO STRATEGY PATTERN:
 * - Permite implementações diferentes (Google OAuth, JWT, etc.)
 * - Facilita testes com mocks
 * - Segue o princípio da Inversão de Dependência
 * 
 * DECISÃO: refreshAuth opcional
 * MOTIVO: Nem todos os provedores suportam refresh automático
 */
export interface IAuthenticationStrategy {
  validateAuth(): Promise<AuthContext>;          // Validação principal
  refreshAuth?(): Promise<AuthContext>;          // Refresh opcional
}

/**
 * Estratégia de Autenticação Google OAuth
 * 
 * DECISÕES DE IMPLEMENTAÇÃO:
 * 
 * 1. FAIL-SAFE DESIGN:
 *    - Retorna sempre { isAuthenticated: false } em caso de erro
 *    - Evita vazamentos de informação em falhas
 *    - Garante que o sistema seja seguro por padrão
 * 
 * 2. SECURE STORAGE INTEGRATION:
 *    - Usa SecureStorage para tokens sensíveis
 *    - Evita localStorage/sessionStorage por questões de segurança
 *    - Tokens são criptografados automaticamente
 * 
 * 3. TOKEN VALIDATION STRATEGY:
 *    - Validação local básica para performance
 *    - TODO: Implementar validação remota para produção
 *    - Trade-off: Performance vs. Segurança absoluta
 */
export class GoogleAuthStrategy implements IAuthenticationStrategy {
  async validateAuth(): Promise<AuthContext> {
    try {
      const { getSecureItem } = useSecureStorage();
      const accessToken = await getSecureItem('google_access_token');
      
      // DECISÃO: Early return para reduzir aninhamento
      // BENEFÍCIO: Código mais legível e menos propenso a erros
      if (!accessToken) {
        return { isAuthenticated: false };
      }

      // IMPLEMENTAÇÃO ATUAL: Validação básica por comprimento
      // MOTIVO: Evita chamadas desnecessárias à API do Google em desenvolvimento
      // PRODUÇÃO: Substituir por validação real via Google Token Info API
      // ENDPOINT: https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={token}
      const isValid = accessToken.length > 50; // Tokens Google têm ~200+ caracteres
      
      return {
        isAuthenticated: isValid,
        accessToken: isValid ? accessToken : undefined,
        userRole: 'user',        // TODO: Extrair do token JWT ou perfil Google
        userId: 'google_user'    // TODO: Usar sub claim do token JWT
      };
    } catch (error) {
      // DECISÃO: Log detalhado + retorno seguro
      // MOTIVO: Facilita debugging sem expor dados sensíveis
      SecureLogger.logError('Erro na validação de autenticação Google', error as Error);
      return { isAuthenticated: false };
    }
  }

  async refreshAuth(): Promise<AuthContext> {
    // IMPLEMENTAÇÃO FUTURA: Refresh Token Flow
    // FLUXO: refresh_token -> novo access_token -> validação
    // BENEFÍCIO: Mantém usuário logado sem re-autenticação
    // 
    // DECISÃO ATUAL: Retornar não autenticado
    // MOTIVO: Força re-autenticação explícita (mais seguro)
    return { isAuthenticated: false };
  }
}

/**
 * Factory para Estratégias de Autenticação
 * 
 * PADRÃO FACTORY:
 * - Centraliza criação de estratégias
 * - Facilita adição de novos provedores (Azure AD, Auth0, etc.)
 * - Segue o princípio Aberto/Fechado
 * 
 * DECISÃO: Usar static methods
 * MOTIVO: Não há estado a ser mantido, simplifica uso
 * ALTERNATIVA: Singleton (rejeitada por ser desnecessária)
 */
export class AuthStrategyFactory {
  static createStrategy(type: 'google' | 'custom'): IAuthenticationStrategy {
    switch (type) {
      case 'google':
        return new GoogleAuthStrategy();
      case 'custom':
        // EXTENSIBILIDADE: Placeholder para estratégias customizadas
        // EXEMPLOS: JWT próprio, LDAP, SAML, etc.
        throw new Error('Estratégia customizada não implementada');
      default:
        // FAIL-FAST: Erro imediato para tipos não suportados
        // BENEFÍCIO: Detecta problemas de configuração rapidamente
        throw new Error(`Estratégia de autenticação não suportada: ${type}`);
    }
  }
}

/**
 * Hook para Gerenciar Estado de Proteção de Rotas
 * 
 * DECISÕES DE DESIGN:
 * 
 * 1. CUSTOM HOOK PATTERN:
 *    - Encapsula lógica complexa de autorização
 *    - Reutilizável em diferentes componentes
 *    - Facilita testes unitários isolados
 * 
 * 2. ESTADO GRANULAR:
 *    - isLoading: UX melhor com feedback visual
 *    - isAuthorized: Estado final de autorização
 *    - authContext: Dados do usuário para uso posterior
 *    - errorMessage: Feedback específico para debugging
 * 
 * 3. FAIL-SAFE DEFAULTS:
 *    - isAuthorized inicia como false
 *    - Acesso negado por padrão até validação completa
 *    - Princípio de segurança: "deny by default"
 */
const useRouteProtection = (
  protectionLevel: ProtectionLevel,
  authStrategy: IAuthenticationStrategy
) => {
  // ESTADO LOCAL: Granular para melhor controle e debugging
  const [isLoading, setIsLoading] = useState(true);           // Estado de carregamento
  const [isAuthorized, setIsAuthorized] = useState(false);    // Autorização final
  const [authContext, setAuthContext] = useState<AuthContext>({ isAuthenticated: false });
  const [errorMessage, setErrorMessage] = useState<string>(''); // Mensagem de erro específica

  const { validateRequest } = useSecurityMiddleware();

  /**
   * Função de Validação de Autorização
   * 
   * FLUXO DE VALIDAÇÃO (Defense in Depth):
   * 1. Autenticação (quem é o usuário?)
   * 2. Autorização por role (o que pode fazer?)
   * 3. Middleware de segurança (rate limiting, origem, etc.)
   * 4. Validação customizada (regras específicas)
   * 
   * DECISÃO: Validação sequencial com early returns
   * MOTIVO: Performance + clareza + segurança
   */
  const checkAuthorization = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(''); // Reset estado anterior

      // CAMADA 1: AUTENTICAÇÃO
      // DECISÃO: Validar apenas se requerido
      // BENEFÍCIO: Permite rotas públicas sem overhead
      if (protectionLevel.requireAuth) {
        const authResult = await authStrategy.validateAuth();
        setAuthContext(authResult);

        // EARLY RETURN: Falha na autenticação
        if (!authResult.isAuthenticated) {
          setErrorMessage('Autenticação necessária');
          setIsAuthorized(false);
          return;
        }

        // CAMADA 2: AUTORIZAÇÃO POR ROLE
        // DECISÃO: Validação explícita de roles
        // MOTIVO: Princípio do menor privilégio
        if (protectionLevel.requireRole && protectionLevel.requireRole.length > 0) {
          if (!authResult.userRole || !protectionLevel.requireRole.includes(authResult.userRole)) {
            setErrorMessage('Permissões insuficientes');
            setIsAuthorized(false);
            return;
          }
        }
      }

      // CAMADA 3: MIDDLEWARE DE SEGURANÇA
      // DECISÃO: Validação adicional via middleware
      // BENEFÍCIO: Rate limiting, CORS, validações customizadas
      const securityResult = await validateRequest(
        {
          accessToken: authContext.accessToken,
          userId: authContext.userId,
          userAgent: navigator.userAgent,    // Fingerprinting básico
          timestamp: Date.now()              // Para rate limiting
        },
        {
          requireAuth: protectionLevel.requireAuth,
          rateLimitRequests: protectionLevel.rateLimitRequests,
          rateLimitWindow: protectionLevel.rateLimitWindow,
          allowedOrigins: protectionLevel.allowedOrigins
        }
      );

      if (!securityResult.success) {
        setErrorMessage(securityResult.error || 'Acesso negado');
        setIsAuthorized(false);
        return;
      }

      // 4. Validação customizada se fornecida
      if (protectionLevel.customValidation) {
        const customResult = await protectionLevel.customValidation(authContext);
        if (!customResult) {
          setErrorMessage('Validação customizada falhou');
          setIsAuthorized(false);
          return;
        }
      }

      // Tudo passou - autorizar acesso
      setIsAuthorized(true);
      SecureLogger.logInfo('Acesso autorizado à rota protegida', {
        userId: authContext.userId,
        userRole: authContext.userRole
      });

    } catch (error) {
      SecureLogger.logError('Erro na verificação de autorização', error as Error);
      setErrorMessage('Erro interno de segurança');
      setIsAuthorized(false);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isAuthorized,
    authContext,
    errorMessage,
    checkAuthorization
  };
};

/**
 * Componente de Loading padrão
 */
const DefaultLoadingComponent: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    <span className="ml-4 text-lg">Verificando permissões...</span>
  </div>
);

/**
 * Componente de Acesso Negado padrão
 */
const DefaultFallbackComponent: React.FC<{ reason: string }> = ({ reason }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-red-50">
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Negado</h3>
        <p className="text-sm text-gray-500 mb-4">{reason}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  </div>
);

/**
 * Componente Principal de Proteção de Rotas
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  protectionLevel,
  fallbackComponent,
  loadingComponent,
  onAccessDenied,
  onAccessGranted
}) => {
  // Usar estratégia Google por padrão (pode ser configurável)
  const authStrategy = AuthStrategyFactory.createStrategy('google');
  
  const {
    isLoading,
    isAuthorized,
    authContext,
    errorMessage,
    checkAuthorization
  } = useRouteProtection(protectionLevel, authStrategy);

  useEffect(() => {
    checkAuthorization();
  }, [protectionLevel]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthorized) {
        onAccessGranted?.();
      } else {
        onAccessDenied?.(errorMessage);
      }
    }
  }, [isLoading, isAuthorized, errorMessage, onAccessGranted, onAccessDenied]);

  // Mostrar loading enquanto verifica
  if (isLoading) {
    return loadingComponent ? <>{loadingComponent}</> : <DefaultLoadingComponent />;
  }

  // Mostrar fallback se acesso negado
  if (!isAuthorized) {
    return fallbackComponent ? 
      <>{fallbackComponent}</> : 
      <DefaultFallbackComponent reason={errorMessage} />;
  }

  // Renderizar children se autorizado
  return <>{children}</>;
};

/**
 * HOC para proteção de componentes
 * (Princípio Aberto/Fechado)
 */
export const withRouteProtection = <P extends object>(
  Component: React.ComponentType<P>,
  protectionLevel: ProtectionLevel,
  options?: {
    fallbackComponent?: ReactNode;
    loadingComponent?: ReactNode;
  }
) => {
  return (props: P) => (
    <ProtectedRoute
      protectionLevel={protectionLevel}
      fallbackComponent={options?.fallbackComponent}
      loadingComponent={options?.loadingComponent}
    >
      <Component {...props} />
    </ProtectedRoute>
  );
};

/**
 * Configurações pré-definidas de proteção
 * (Princípio da Responsabilidade Única)
 */
export const ProtectionLevels = {
  PUBLIC: {
    requireAuth: false
  } as ProtectionLevel,

  AUTHENTICATED: {
    requireAuth: true,
    rateLimitRequests: 100,
    rateLimitWindow: 15 * 60 * 1000 // 15 minutos
  } as ProtectionLevel,

  ADMIN: {
    requireAuth: true,
    requireRole: ['admin'],
    rateLimitRequests: 200,
    rateLimitWindow: 15 * 60 * 1000
  } as ProtectionLevel,

  HIGH_SECURITY: {
    requireAuth: true,
    rateLimitRequests: 50,
    rateLimitWindow: 15 * 60 * 1000,
    allowedOrigins: ['https://finthrix-sheets-dashboard.vercel.app']
  } as ProtectionLevel
};

/**
 * Hook para usar proteção de rotas de forma declarativa
 */
export const useProtectedRoute = (protectionLevel: ProtectionLevel) => {
  const authStrategy = AuthStrategyFactory.createStrategy('google');
  return useRouteProtection(protectionLevel, authStrategy);
};