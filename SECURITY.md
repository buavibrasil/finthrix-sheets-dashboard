# Documentação de Segurança - FinThrix Dashboard

## Índice
1. [Visão Geral de Segurança](#visão-geral-de-segurança)
2. [Arquitetura de Segurança](#arquitetura-de-segurança)
3. [Implementações de Segurança](#implementações-de-segurança)
4. [Boas Práticas](#boas-práticas)
5. [Configuração Segura](#configuração-segura)
6. [Monitoramento e Logs](#monitoramento-e-logs)
7. [Resposta a Incidentes](#resposta-a-incidentes)
8. [Checklist de Segurança](#checklist-de-segurança)

## Visão Geral de Segurança

O FinThrix Dashboard implementa múltiplas camadas de segurança para proteger dados financeiros sensíveis:

### Princípios de Segurança Aplicados
- **Defesa em Profundidade**: Múltiplas camadas de proteção
- **Princípio do Menor Privilégio**: Acesso mínimo necessário
- **Fail-Safe Defaults**: Configurações seguras por padrão
- **Separação de Responsabilidades**: Componentes isolados
- **Validação Completa**: Todas as entradas são validadas

### Classificação de Dados
- **Críticos**: Tokens de acesso, dados financeiros
- **Sensíveis**: Informações de usuário, logs de auditoria
- **Internos**: Configurações, metadados
- **Públicos**: Documentação, interfaces

## Arquitetura de Segurança

### Componentes de Segurança

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│ • ProtectedRoute (Proteção de Rotas)                       │
│ • SecurityMiddleware (Validação de Requisições)            │
│ • InputValidator (Sanitização de Entrada)                  │
│ • SecureStorage (Armazenamento Criptografado)              │
│ • SecureLogger (Logs Seguros)                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Edge Functions (Supabase)                   │
├─────────────────────────────────────────────────────────────┤
│ • Rate Limiting (Proteção DDoS)                            │
│ • CORS Restritivo                                          │
│ • Validação de Entrada                                     │
│ • Sanitização de Dados                                     │
│ • Timeout de Requisições                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 APIs Externas                               │
├─────────────────────────────────────────────────────────────┤
│ • Google Sheets API (OAuth 2.0)                            │
│ • Supabase (RLS + JWT)                                     │
└─────────────────────────────────────────────────────────────┘
```

## Implementações de Segurança

### 1. Autenticação e Autorização

#### Google OAuth 2.0
```typescript
// Configuração segura do Google Auth
const googleAuth = new GoogleAuthService({
  clientId: VITE_GOOGLE_CLIENT_ID, // Validado
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  redirectUri: window.location.origin
});
```

**Características:**
- Validação rigorosa do Client ID
- Escopos mínimos necessários
- Tokens com expiração automática
- Refresh automático quando possível

#### Proteção de Rotas
```typescript
// Exemplo de uso do ProtectedRoute
<ProtectedRoute 
  protectionLevel={ProtectionLevels.AUTHENTICATED}
  onAccessDenied={(reason) => console.log('Acesso negado:', reason)}
>
  <DashboardComponent />
</ProtectedRoute>
```

### 2. Validação e Sanitização

#### Validação de Entrada
```typescript
// Todas as entradas são validadas
const validationResult = InputValidator.validateSpreadsheetId(spreadsheetId);
if (!validationResult) {
  throw new Error('ID de planilha inválido');
}
```

#### Sanitização de Dados
```typescript
// Dados são sanitizados antes do processamento
const sanitizedData = DataSanitizer.sanitizeString(userInput);
const sanitizedNumber = DataSanitizer.sanitizeNumber(numericInput);
```

### 3. Criptografia

#### Dados em Trânsito
- **HTTPS obrigatório** em produção
- **TLS 1.3** para todas as comunicações
- **Certificate Pinning** para APIs críticas

#### Dados em Repouso
```typescript
// Armazenamento criptografado
await SecureStorage.setItem('sensitive_data', data, true, {
  expirationTime: 24 * 60 * 60 * 1000 // 24 horas
});
```

**Características:**
- **AES-GCM** para criptografia simétrica
- **PBKDF2** para derivação de chaves
- **Salt aleatório** para cada operação
- **IV único** para cada criptografia

### 4. Rate Limiting e DDoS Protection

#### Frontend Rate Limiting
```typescript
const rateLimiter = new RateLimiter();
if (!rateLimiter.checkLimit(clientId, 100, 15 * 60 * 1000)) {
  throw new Error('Muitas requisições');
}
```

#### Edge Function Protection
```typescript
// Proteção no servidor
const MAX_REQUESTS = 100;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
```

### 5. Content Security Policy (CSP)

```typescript
const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://apis.google.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "connect-src 'self' https://sheets.googleapis.com https://*.supabase.co",
  "img-src 'self' data: https:",
  "object-src 'none'",
  "base-uri 'self'"
].join('; ');
```

### 6. Logging Seguro

```typescript
// Logs que não expõem dados sensíveis
SecureLogger.logInfo('Operação realizada', {
  userId: 'user_123',
  operation: 'fetch_data',
  timestamp: Date.now()
});

// Dados sensíveis são automaticamente redigidos
SecureLogger.logError('Erro de autenticação', error, {
  token: 'ya29.a0...' // Será redigido como '[REDACTED]'
});
```

## Boas Práticas

### 1. Desenvolvimento Seguro

#### Validação de Entrada
- ✅ **Sempre validar** todas as entradas do usuário
- ✅ **Sanitizar dados** antes do processamento
- ✅ **Usar whitelist** ao invés de blacklist
- ✅ **Validar no frontend E backend**

#### Gerenciamento de Segredos
- ✅ **Nunca commitar** tokens ou chaves
- ✅ **Usar variáveis de ambiente** para configurações
- ✅ **Rotacionar chaves** regularmente
- ✅ **Princípio do menor privilégio**

#### Tratamento de Erros
- ✅ **Não expor** detalhes internos
- ✅ **Logar erros** de forma segura
- ✅ **Mensagens genéricas** para usuários
- ✅ **Fail-safe** em caso de erro

### 2. Configuração de Produção

#### Variáveis de Ambiente Obrigatórias
```bash
# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Google Sheets
VITE_GOOGLE_SPREADSHEET_ID=your_spreadsheet_id

# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Headers de Segurança
```typescript
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
```

### 3. Monitoramento

#### Métricas de Segurança
- **Taxa de tentativas de autenticação falhadas**
- **Requisições bloqueadas por rate limiting**
- **Tentativas de acesso não autorizado**
- **Erros de validação de entrada**

#### Alertas Automáticos
- **Múltiplas tentativas de login falhadas**
- **Padrões de tráfego suspeitos**
- **Erros de segurança críticos**
- **Tentativas de injeção de código**

## Configuração Segura

### 1. Ambiente de Desenvolvimento

```bash
# .env.local (nunca commitar)
VITE_GOOGLE_CLIENT_ID=your_dev_client_id
VITE_GOOGLE_SPREADSHEET_ID=your_dev_spreadsheet_id
VITE_SUPABASE_URL=your_dev_supabase_url
VITE_SUPABASE_ANON_KEY=your_dev_supabase_key
```

### 2. Ambiente de Produção

#### Vercel Configuration
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

#### Supabase Edge Function
```typescript
// Configuração CORS restritiva
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-domain.vercel.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
```

## Monitoramento e Logs

### 1. Estrutura de Logs

```typescript
interface SecurityLogEntry {
  timestamp: number;
  level: 'INFO' | 'WARN' | 'ERROR';
  category: 'AUTH' | 'API' | 'VALIDATION' | 'SECURITY';
  message: string;
  metadata?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}
```

### 2. Eventos Monitorados

#### Autenticação
- Login bem-sucedido
- Falha de autenticação
- Token expirado
- Refresh de token

#### API
- Requisições bem-sucedidas
- Erros de API
- Rate limiting ativado
- Timeouts

#### Segurança
- Tentativas de injeção
- Acesso não autorizado
- Validação falhada
- Dados suspeitos

### 3. Retenção de Logs

- **Logs de segurança**: 1 ano
- **Logs de auditoria**: 6 meses
- **Logs de erro**: 3 meses
- **Logs de debug**: 1 mês

## Resposta a Incidentes

### 1. Classificação de Incidentes

#### Crítico (P0)
- Vazamento de dados
- Acesso não autorizado a dados financeiros
- Comprometimento de tokens de acesso

#### Alto (P1)
- Tentativas de ataque em massa
- Falhas de autenticação sistemáticas
- Indisponibilidade de serviços críticos

#### Médio (P2)
- Rate limiting frequente
- Erros de validação em massa
- Performance degradada

#### Baixo (P3)
- Logs de erro isolados
- Tentativas de acesso inválidas pontuais

### 2. Procedimentos de Resposta

#### Detecção
1. **Monitoramento automático** detecta anomalia
2. **Alerta** é enviado para equipe de segurança
3. **Triagem inicial** determina severidade

#### Contenção
1. **Isolar** sistemas afetados
2. **Bloquear** IPs suspeitos
3. **Revogar** tokens comprometidos
4. **Ativar** modo de emergência se necessário

#### Erradicação
1. **Identificar** causa raiz
2. **Corrigir** vulnerabilidades
3. **Atualizar** sistemas de segurança
4. **Testar** correções

#### Recuperação
1. **Restaurar** serviços normais
2. **Monitorar** atividade suspeita
3. **Validar** integridade dos dados
4. **Comunicar** status para stakeholders

#### Lições Aprendidas
1. **Documentar** incidente
2. **Analisar** resposta
3. **Melhorar** processos
4. **Treinar** equipe

## Checklist de Segurança

### ✅ Desenvolvimento

- [ ] Todas as entradas são validadas
- [ ] Dados são sanitizados antes do processamento
- [ ] Erros não expõem informações sensíveis
- [ ] Logs não contêm dados sensíveis
- [ ] Tokens são armazenados de forma segura
- [ ] Rate limiting está implementado
- [ ] HTTPS é obrigatório
- [ ] CSP está configurado
- [ ] Headers de segurança estão definidos

### ✅ Configuração

- [ ] Variáveis de ambiente estão configuradas
- [ ] Segredos não estão no código
- [ ] CORS está restritivo
- [ ] Timeouts estão definidos
- [ ] Logs estão configurados
- [ ] Monitoramento está ativo
- [ ] Alertas estão funcionando

### ✅ Deploy

- [ ] Build de produção está otimizado
- [ ] Dependências estão atualizadas
- [ ] Vulnerabilidades foram verificadas
- [ ] Testes de segurança passaram
- [ ] Configurações de produção aplicadas
- [ ] Monitoramento está funcionando
- [ ] Backup está configurado

### ✅ Operação

- [ ] Logs estão sendo coletados
- [ ] Métricas estão sendo monitoradas
- [ ] Alertas estão funcionando
- [ ] Incidentes são tratados rapidamente
- [ ] Atualizações de segurança são aplicadas
- [ ] Auditorias são realizadas regularmente
- [ ] Treinamento da equipe está atualizado

## Contato de Segurança

Para reportar vulnerabilidades de segurança:

- **Email**: security@finthrix.com
- **Processo**: Responsible Disclosure
- **Tempo de Resposta**: 24-48 horas
- **Reconhecimento**: Hall of Fame para pesquisadores

## Atualizações

Este documento é atualizado regularmente. Última atualização: **Dezembro 2024**

### Histórico de Versões

- **v1.0** (Dez 2024): Versão inicial com implementações de segurança completas
- **v1.1** (Planejado): Adição de autenticação multi-fator
- **v1.2** (Planejado): Implementação de Zero Trust Architecture

---

**Nota**: Esta documentação deve ser revisada e atualizada regularmente conforme novas ameaças e tecnologias emergem.