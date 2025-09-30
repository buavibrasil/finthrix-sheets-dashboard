/**
 * Sistema de Logs Internos - FinThrix Dashboard
 * 
 * PROPÓSITO:
 * - Facilitar debugging durante desenvolvimento
 * - Ajudar futuros mantenedores a entender o comportamento do código
 * - Fornecer insights sobre performance e fluxo de dados
 * - Separar logs de desenvolvimento dos logs de segurança
 * 
 * DECISÕES DE DESIGN:
 * 
 * 1. SEPARAÇÃO DE RESPONSABILIDADES:
 *    - InternalLogger: Logs para desenvolvedores (debugging, performance)
 *    - SecureLogger: Logs de segurança (auditoria, compliance)
 * 
 * 2. NÍVEIS DE LOG GRANULARES:
 *    - TRACE: Fluxo detalhado de execução
 *    - DEBUG: Informações de debugging
 *    - INFO: Informações gerais do sistema
 *    - WARN: Situações que merecem atenção
 *    - ERROR: Erros que não quebram o sistema
 * 
 * 3. CONTEXTO RICO:
 *    - Timestamp automático
 *    - Componente/módulo de origem
 *    - Dados estruturados para análise
 *    - Stack trace quando relevante
 */

export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4
}

export interface LogContext {
  component?: string;        // Nome do componente/módulo
  function?: string;         // Nome da função
  userId?: string;          // ID do usuário (se disponível)
  sessionId?: string;       // ID da sessão
  requestId?: string;       // ID da requisição
  performance?: {           // Métricas de performance
    startTime?: number;
    duration?: number;
    memoryUsage?: number;
  };
  metadata?: Record<string, any>; // Dados adicionais
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
  error?: Error;
  stackTrace?: string;
}

/**
 * Classe Principal do Sistema de Logs Internos
 * 
 * PADRÃO SINGLETON:
 * - Garante configuração consistente em toda a aplicação
 * - Centraliza controle de níveis de log
 * - Facilita configuração por ambiente
 */
class InternalLoggerClass {
  private static instance: InternalLoggerClass;
  private currentLevel: LogLevel = LogLevel.INFO;
  private isEnabled: boolean = true;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize: number = 1000;

  private constructor() {
    // CONFIGURAÇÃO POR AMBIENTE
    // Desenvolvimento: Logs mais verbosos
    // Produção: Apenas logs importantes
    if (import.meta.env.DEV) {
      this.currentLevel = LogLevel.DEBUG;
      this.isEnabled = true;
    } else {
      this.currentLevel = LogLevel.WARN;
      this.isEnabled = import.meta.env.VITE_ENABLE_INTERNAL_LOGS === 'true';
    }
  }

  public static getInstance(): InternalLoggerClass {
    if (!InternalLoggerClass.instance) {
      InternalLoggerClass.instance = new InternalLoggerClass();
    }
    return InternalLoggerClass.instance;
  }

  /**
   * Configuração do Logger
   */
  public configure(level: LogLevel, enabled: boolean = true): void {
    this.currentLevel = level;
    this.isEnabled = enabled;
  }

  /**
   * Método Principal de Log
   * 
   * DECISÃO: Método privado centralizado
   * BENEFÍCIO: Consistência na formatação e filtragem
   */
  private log(level: LogLevel, message: string, context: LogContext = {}, error?: Error): void {
    // FILTRO POR NÍVEL: Evita logs desnecessários
    if (!this.isEnabled || level < this.currentLevel) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
     context: {
  // CONTEXTO AUTOMÁTICO: Informações úteis para debugging
  userAgent: navigator.userAgent,
  url: window.location.href,
  // CONTEXTO CUSTOMIZADO: Sobrescreve valores automáticos se fornecido
  ...context
},
      error,
      stackTrace: error?.stack
    };

    // BUFFER DE LOGS: Mantém histórico para análise
    this.addToBuffer(logEntry);

    // OUTPUT FORMATADO: Facilita leitura no console
    this.outputToConsole(logEntry);
  }

  /**
   * Métodos Públicos por Nível de Log
   */
  public trace(message: string, context?: LogContext): void {
    this.log(LogLevel.TRACE, `🔍 ${message}`, context);
  }

  public debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, `🐛 ${message}`, context);
  }

  public info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, `ℹ️ ${message}`, context);
  }

  public warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, `⚠️ ${message}`, context);
  }

  public error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, `❌ ${message}`, context, error);
  }

  /**
   * Logs Especializados para Casos Comuns
   */
  
  // PERFORMANCE TRACKING
  public performance(operation: string, duration: number, context?: LogContext): void {
    this.info(`⚡ Performance: ${operation} took ${duration}ms`, {
      ...context,
      performance: { duration }
    });
  }

  // FLUXO DE DADOS
  public dataFlow(stage: string, data: any, context?: LogContext): void {
    this.debug(`📊 Data Flow: ${stage}`, {
      ...context,
      metadata: { data: this.sanitizeData(data) }
    });
  }

  // INTERAÇÕES DO USUÁRIO
  public userAction(action: string, context?: LogContext): void {
    this.info(`👤 User Action: ${action}`, context);
  }

  // CHAMADAS DE API
  public apiCall(method: string, url: string, status?: number, context?: LogContext): void {
    const statusEmoji = status && status >= 400 ? '❌' : '✅';
    this.info(`${statusEmoji} API: ${method} ${url} (${status || 'pending'})`, context);
  }

  // MUDANÇAS DE ESTADO
  public stateChange(component: string, oldState: any, newState: any, context?: LogContext): void {
    this.debug(`🔄 State Change in ${component}`, {
      ...context,
      metadata: {
        oldState: this.sanitizeData(oldState),
        newState: this.sanitizeData(newState)
      }
    });
  }

  /**
   * Utilitários Internos
   */
  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    
    // LIMPEZA AUTOMÁTICA: Evita vazamentos de memória
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize / 2);
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const { timestamp, level, message, context, error } = entry;
    const contextStr = Object.keys(context).length > 0 ? JSON.stringify(context, null, 2) : '';
    
    // FORMATAÇÃO POR NÍVEL: Facilita identificação visual
    switch (level) {
      case LogLevel.TRACE:
        console.trace(`[${timestamp}] ${message}`, contextStr);
        break;
      case LogLevel.DEBUG:
        console.debug(`[${timestamp}] ${message}`, contextStr);
        break;
      case LogLevel.INFO:
        console.info(`[${timestamp}] ${message}`, contextStr);
        break;
      case LogLevel.WARN:
        console.warn(`[${timestamp}] ${message}`, contextStr);
        break;
      case LogLevel.ERROR:
        console.error(`[${timestamp}] ${message}`, contextStr, error);
        break;
    }
  }

  private sanitizeData(data: any): any {
    // SANITIZAÇÃO: Remove dados sensíveis dos logs
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth'];
    const sanitized = { ...data };

    for (const key in sanitized) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Métodos de Análise e Debugging
   */
  public getLogHistory(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logBuffer.filter(entry => entry.level >= level);
    }
    return [...this.logBuffer];
  }

  public exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }

  public clearLogs(): void {
    this.logBuffer = [];
    this.info('Log buffer cleared');
  }

  // MÉTRICAS ÚTEIS PARA DEBUGGING
  public getLogStats(): { total: number; byLevel: Record<string, number> } {
    const stats = {
      total: this.logBuffer.length,
      byLevel: {} as Record<string, number>
    };

    this.logBuffer.forEach(entry => {
      const levelName = LogLevel[entry.level];
      stats.byLevel[levelName] = (stats.byLevel[levelName] || 0) + 1;
    });

    return stats;
  }
}

// EXPORTAÇÃO SINGLETON
export const InternalLogger = InternalLoggerClass.getInstance();

/**
 * Decorators Úteis para Logging Automático
 */

// DECORATOR PARA PERFORMANCE
export function logPerformance(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const startTime = performance.now();
    const result = method.apply(this, args);

    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - startTime;
        InternalLogger.performance(`${target.constructor.name}.${propertyName}`, duration);
      });
    } else {
      const duration = performance.now() - startTime;
      InternalLogger.performance(`${target.constructor.name}.${propertyName}`, duration);
      return result;
    }
  };

  return descriptor;
}

// DECORATOR PARA RASTREAMENTO DE MÉTODOS
export function logMethodCall(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = function (...args: any[]) {
    InternalLogger.trace(`Calling ${target.constructor.name}.${propertyName}`, {
      component: target.constructor.name,
      function: propertyName,
      metadata: { arguments: args.length }
    });

    return method.apply(this, args);
  };

  return descriptor;
}

/**
 * Utilitários para Casos Específicos
 */

// HELPER PARA COMPONENTES REACT
export const useInternalLogger = (componentName: string) => {
  return {
    trace: (message: string, context?: Partial<LogContext>) => 
      InternalLogger.trace(message, { component: componentName, ...context }),
    debug: (message: string, context?: Partial<LogContext>) => 
      InternalLogger.debug(message, { component: componentName, ...context }),
    info: (message: string, context?: Partial<LogContext>) => 
      InternalLogger.info(message, { component: componentName, ...context }),
    warn: (message: string, context?: Partial<LogContext>) => 
      InternalLogger.warn(message, { component: componentName, ...context }),
    error: (message: string, context?: Partial<LogContext>, error?: Error) => 
      InternalLogger.error(message, { component: componentName, ...context }, error),
    userAction: (action: string, context?: Partial<LogContext>) => 
      InternalLogger.userAction(action, { component: componentName, ...context }),
    stateChange: (oldState: any, newState: any, context?: Partial<LogContext>) => 
      InternalLogger.stateChange(componentName, oldState, newState, context)
  };
};

// CONFIGURAÇÃO GLOBAL PARA DESENVOLVIMENTO
if (import.meta.env.DEV) {
  // Expor logger globalmente para debugging no console
  (window as any).InternalLogger = InternalLogger;
  
  InternalLogger.info('🚀 Internal Logger initialized for development', {
    component: 'InternalLogger',
    metadata: {
      level: LogLevel[InternalLogger['currentLevel']],
      bufferSize: InternalLogger['maxBufferSize']
    }
  });
}