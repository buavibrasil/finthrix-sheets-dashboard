# 🔌 Interfaces e Contratos de API - FinThrix Dashboard

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Interfaces de Autenticação](#interfaces-de-autenticação)
- [Interfaces de Dados Financeiros](#interfaces-de-dados-financeiros)
- [Interfaces de Segurança](#interfaces-de-segurança)
- [Interfaces de Logging](#interfaces-de-logging)
- [Contratos de API Externa](#contratos-de-api-externa)
- [Padrões de Resposta](#padrões-de-resposta)
- [Versionamento](#versionamento)
- [Guia de Manutenção](#guia-de-manutenção)

---

## 🎯 Visão Geral

Este documento define todas as interfaces, tipos e contratos de API utilizados no FinThrix Dashboard. O objetivo é facilitar a manutenção por diferentes equipes, garantindo consistência e clareza na comunicação entre módulos.

### 🏗️ Princípios de Design

1. **Tipagem Forte**: Todas as interfaces são fortemente tipadas
2. **Extensibilidade**: Interfaces projetadas para evolução
3. **Compatibilidade**: Versionamento para mudanças breaking
4. **Documentação**: Cada interface documentada com exemplos
5. **Validação**: Schemas de validação para runtime

---

## 🔐 Interfaces de Autenticação

### `AuthContext`
**Localização**: `src/components/security/ProtectedRoute.tsx`

```typescript
interface AuthContext {
  isAuthenticated: boolean;  // Status de autenticação
  accessToken?: string;      // Token de acesso (se disponível)
  userRole?: string;         // Role do usuário (para autorização)
  userId?: string;           // ID único do usuário
}
```

**Uso**: Contexto compartilhado de autenticação em toda a aplicação.

**Exemplo**:
```typescript
const authContext: AuthContext = {
  isAuthenticated: true,
  accessToken: "ya29.a0AfH6SMC...",
  userRole: "admin",
  userId: "google_123456789"
};
```

### `IAuthenticationStrategy`
**Localização**: `src/components/security/ProtectedRoute.tsx`

```typescript
interface IAuthenticationStrategy {
  validateAuth(): Promise<AuthContext>;          // Validação principal
  refreshAuth?(): Promise<AuthContext>;          // Refresh opcional
}
```

**Implementações**:
- `GoogleAuthStrategy`: Autenticação via Google OAuth
- `CustomAuthStrategy`: Placeholder para estratégias customizadas

**Exemplo de Implementação**:
```typescript
class CustomJWTStrategy implements IAuthenticationStrategy {
  async validateAuth(): Promise<AuthContext> {
    const token = localStorage.getItem('jwt_token');
    if (!token) return { isAuthenticated: false };
    
    // Validar JWT...
    return {
      isAuthenticated: true,
      accessToken: token,
      userRole: 'user',
      userId: 'jwt_user_123'
    };
  }
}
```

### `ProtectionLevel`
**Localização**: `src/components/security/ProtectedRoute.tsx`

```typescript
interface ProtectionLevel {
  requireAuth: boolean;                                    // Autenticação obrigatória
  requireRole?: string[];                                  // Roles específicas necessárias
  rateLimitRequests?: number;                             // Limite de requisições
  rateLimitWindow?: number;                               // Janela de tempo (ms)
  allowedOrigins?: string[];                              // Origens permitidas (CORS)
  customValidation?: (context: any) => Promise<boolean>; // Validação customizada
}
```

**Casos de Uso**:
```typescript
// Rota pública
const publicRoute: ProtectionLevel = {
  requireAuth: false
};

// Rota administrativa
const adminRoute: ProtectionLevel = {
  requireAuth: true,
  requireRole: ['admin', 'super_admin'],
  rateLimitRequests: 100,
  rateLimitWindow: 60000 // 1 minuto
};
```

---

## 💰 Interfaces de Dados Financeiros

### `FinancialTransaction`
**Localização**: `src/store/useFinancialStore.ts`

```typescript
interface FinancialTransaction {
  id: string;                    // ID único da transação
  date: string;                  // Data no formato ISO 8601
  description: string;           // Descrição da transação
  amount: number;                // Valor (positivo = receita, negativo = despesa)
  category: string;              // Categoria da transação
  type: 'receita' | 'despesa';   // Tipo da transação
  status: 'pendente' | 'confirmada' | 'cancelada'; // Status
  tags?: string[];               // Tags opcionais
  metadata?: Record<string, any>; // Dados adicionais
}
```

**Validação**:
```typescript
const transactionSchema = {
  id: { type: 'string', required: true },
  date: { type: 'string', format: 'date-time', required: true },
  description: { type: 'string', minLength: 1, required: true },
  amount: { type: 'number', required: true },
  category: { type: 'string', required: true },
  type: { type: 'string', enum: ['receita', 'despesa'], required: true },
  status: { type: 'string', enum: ['pendente', 'confirmada', 'cancelada'], required: true }
};
```

### `FinancialMetrics`
**Localização**: `src/store/useFinancialStore.ts`

```typescript
interface FinancialMetrics {
  totalReceitas: number;         // Total de receitas
  totalDespesas: number;         // Total de despesas
  saldoAtual: number;           // Saldo atual (receitas - despesas)
  transacoesPendentes: number;   // Número de transações pendentes
  maiorReceita: number;         // Maior receita individual
  maiorDespesa: number;         // Maior despesa individual
  mediaReceitas: number;        // Média das receitas
  mediaDespesas: number;        // Média das despesas
  crescimentoMensal: number;    // % de crescimento mensal
}
```

### `FilterOptions`
**Localização**: `src/store/useFinancialStore.ts`

```typescript
interface FilterOptions {
  dateRange: {
    start: string;               // Data início (ISO 8601)
    end: string;                 // Data fim (ISO 8601)
  };
  categories: string[];          // Categorias selecionadas
  types: ('receita' | 'despesa')[]; // Tipos selecionados
  status: ('pendente' | 'confirmada' | 'cancelada')[]; // Status selecionados
  amountRange?: {
    min: number;                 // Valor mínimo
    max: number;                 // Valor máximo
  };
  searchTerm?: string;           // Termo de busca
}
```

---

## 🛡️ Interfaces de Segurança

### `SecurityValidationRequest`
**Localização**: `src/utils/security-middleware.ts`

```typescript
interface SecurityValidationRequest {
  accessToken?: string;          // Token de acesso
  userId?: string;               // ID do usuário
  userAgent: string;             // User agent do navegador
  timestamp: number;             // Timestamp da requisição
  ipAddress?: string;            // IP do cliente (se disponível)
  sessionId?: string;            // ID da sessão
}
```

### `SecurityValidationOptions`
**Localização**: `src/utils/security-middleware.ts`

```typescript
interface SecurityValidationOptions {
  requireAuth: boolean;          // Autenticação obrigatória
  rateLimitRequests?: number;    // Limite de requisições
  rateLimitWindow?: number;      // Janela de tempo (ms)
  allowedOrigins?: string[];     // Origens permitidas
  validateCSRF?: boolean;        // Validar token CSRF
  requireHTTPS?: boolean;        // Exigir HTTPS
}
```

### `SecurityValidationResult`
**Localização**: `src/utils/security-middleware.ts`

```typescript
interface SecurityValidationResult {
  success: boolean;              // Resultado da validação
  error?: string;                // Mensagem de erro (se houver)
  warnings?: string[];           // Avisos de segurança
  metadata?: {
    rateLimitRemaining?: number; // Requisições restantes
    rateLimitReset?: number;     // Timestamp do reset
    securityLevel: 'low' | 'medium' | 'high'; // Nível de segurança
  };
}
```

---

## 📊 Interfaces de Logging

### `LogContext`
**Localização**: `src/utils/internal-logger.ts`

```typescript
interface LogContext {
  component?: string;            // Nome do componente/módulo
  function?: string;             // Nome da função
  userId?: string;              // ID do usuário (se disponível)
  sessionId?: string;           // ID da sessão
  requestId?: string;           // ID da requisição
  performance?: {               // Métricas de performance
    startTime?: number;
    duration?: number;
    memoryUsage?: number;
  };
  metadata?: Record<string, any>; // Dados adicionais
}
```

### `LogEntry`
**Localização**: `src/utils/internal-logger.ts`

```typescript
interface LogEntry {
  timestamp: string;             // Timestamp ISO 8601
  level: LogLevel;               // Nível do log
  message: string;               // Mensagem do log
  context: LogContext;           // Contexto adicional
  error?: Error;                 // Erro (se houver)
  stackTrace?: string;           // Stack trace (se houver)
}
```

---

## 🌐 Contratos de API Externa

### Google Sheets API

#### `SheetsReadRequest`
```typescript
interface SheetsReadRequest {
  spreadsheetId: string;         // ID da planilha
  range: string;                 // Range a ser lido (ex: "A1:Z100")
  valueRenderOption?: 'FORMATTED_VALUE' | 'UNFORMATTED_VALUE' | 'FORMULA';
  dateTimeRenderOption?: 'SERIAL_NUMBER' | 'FORMATTED_STRING';
}
```

#### `SheetsWriteRequest`
```typescript
interface SheetsWriteRequest {
  spreadsheetId: string;         // ID da planilha
  range: string;                 // Range a ser escrito
  values: any[][];               // Valores a serem escritos
  valueInputOption: 'RAW' | 'USER_ENTERED';
  includeValuesInResponse?: boolean;
}
```

#### `SheetsResponse`
```typescript
interface SheetsResponse<T = any> {
  success: boolean;              // Sucesso da operação
  data?: T;                      // Dados retornados
  error?: {
    code: number;                // Código do erro
    message: string;             // Mensagem do erro
    details?: any;               // Detalhes adicionais
  };
  metadata?: {
    range?: string;              // Range processado
    updatedRows?: number;        // Linhas atualizadas
    updatedColumns?: number;     // Colunas atualizadas
    updatedCells?: number;       // Células atualizadas
  };
}
```

### Google OAuth API

#### `OAuthTokenResponse`
```typescript
interface OAuthTokenResponse {
  access_token: string;          // Token de acesso
  expires_in: number;            // Tempo de expiração (segundos)
  refresh_token?: string;        // Token de refresh (se disponível)
  scope: string;                 // Escopos concedidos
  token_type: 'Bearer';          // Tipo do token
}
```

#### `OAuthUserInfo`
```typescript
interface OAuthUserInfo {
  id: string;                    // ID único do usuário
  email: string;                 // Email do usuário
  verified_email: boolean;       // Email verificado
  name: string;                  // Nome completo
  given_name: string;            // Primeiro nome
  family_name: string;           // Sobrenome
  picture: string;               // URL da foto de perfil
  locale: string;                // Localização
}
```

---

## 📋 Padrões de Resposta

### Resposta de Sucesso
```typescript
interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}
```

### Resposta de Erro
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;                // Código do erro (ex: "AUTH_FAILED")
    message: string;             // Mensagem legível
    details?: any;               // Detalhes técnicos
    timestamp: string;           // Timestamp do erro
    requestId: string;           // ID da requisição
  };
  metadata?: {
    retryAfter?: number;         // Tempo para retry (segundos)
    supportContact?: string;     // Contato para suporte
  };
}
```

### Resposta Paginada
```typescript
interface PaginatedResponse<T = any> {
  success: true;
  data: T[];
  pagination: {
    page: number;                // Página atual
    limit: number;               // Itens por página
    total: number;               // Total de itens
    totalPages: number;          // Total de páginas
    hasNext: boolean;            // Tem próxima página
    hasPrev: boolean;            // Tem página anterior
  };
}
```

---

## 🔄 Versionamento

### Estratégia de Versionamento

1. **Semantic Versioning**: MAJOR.MINOR.PATCH
2. **Breaking Changes**: Incrementa MAJOR
3. **Novas Features**: Incrementa MINOR
4. **Bug Fixes**: Incrementa PATCH

### Compatibilidade

```typescript
interface VersionedInterface {
  version: string;               // Versão da interface
  deprecated?: boolean;          // Interface depreciada
  deprecationDate?: string;      // Data de depreciação
  migrationGuide?: string;       // Guia de migração
}
```

### Exemplo de Migração

```typescript
// v1.0.0 (DEPRECATED)
interface OldFinancialTransaction {
  id: string;
  date: string;
  description: string;
  value: number; // ❌ Renomeado para 'amount'
}

// v2.0.0 (CURRENT)
interface FinancialTransaction {
  id: string;
  date: string;
  description: string;
  amount: number; // ✅ Novo nome
  category: string; // ✅ Novo campo obrigatório
  type: 'receita' | 'despesa'; // ✅ Novo campo obrigatório
}

// Migration Helper
function migrateTransaction(old: OldFinancialTransaction): FinancialTransaction {
  return {
    ...old,
    amount: old.value,
    category: 'outros', // Default
    type: old.value > 0 ? 'receita' : 'despesa'
  };
}
```

---

## 🛠️ Guia de Manutenção

### ✅ Checklist para Novas Interfaces

- [ ] **Tipagem Forte**: Todos os campos tipados
- [ ] **Documentação**: JSDoc completo
- [ ] **Exemplos**: Pelo menos 2 exemplos de uso
- [ ] **Validação**: Schema de validação definido
- [ ] **Testes**: Testes unitários criados
- [ ] **Versionamento**: Versão documentada
- [ ] **Migração**: Guia de migração (se breaking change)

### 🔄 Processo de Mudança

1. **Análise de Impacto**: Identificar dependências
2. **Backward Compatibility**: Manter compatibilidade quando possível
3. **Deprecation Notice**: Avisar sobre depreciações
4. **Migration Guide**: Criar guia de migração
5. **Testing**: Testar todas as integrações
6. **Documentation**: Atualizar documentação

### 📊 Métricas de Qualidade

```typescript
interface InterfaceQualityMetrics {
  coverage: number;              // % de cobertura de testes
  usage: number;                 // Número de usos na codebase
  complexity: 'low' | 'medium' | 'high'; // Complexidade
  maintainability: number;       // Score de manutenibilidade (1-10)
  lastUpdated: string;           // Data da última atualização
}
```

### 🚨 Alertas de Manutenção

- **Interface não usada há 6+ meses**: Candidata à remoção
- **Muitas implementações**: Considerar abstração
- **Alta complexidade**: Refatorar em interfaces menores
- **Baixa cobertura de testes**: Adicionar testes

### 📝 Template para Nova Interface

```typescript
/**
 * [Nome da Interface]
 * 
 * @description [Descrição do propósito]
 * @version 1.0.0
 * @since [Data de criação]
 * @author [Nome do autor]
 * 
 * @example
 * ```typescript
 * const example: InterfaceName = {
 *   // exemplo de uso
 * };
 * ```
 */
interface InterfaceName {
  // campos da interface
}
```

---

## 📞 Suporte e Contato

- **Documentação**: Este arquivo
- **Issues**: GitHub Issues
- **Discussões**: GitHub Discussions
- **Code Review**: Pull Request obrigatório

---

**Última atualização**: Janeiro 2025  
**Versão do documento**: 1.0.0  
**Próxima revisão**: Março 2025