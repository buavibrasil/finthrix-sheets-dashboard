export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  stack?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private currentLevel = import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO;

  private formatMessage(level: LogLevel, category: string, message: string, data?: any): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data
    };

    if (level === LogLevel.ERROR && data instanceof Error) {
      entry.stack = data.stack;
    }

    return entry;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel;
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    
    // Manter apenas os últimos logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log no console também
    const emoji = {
      [LogLevel.DEBUG]: '🔍',
      [LogLevel.INFO]: 'ℹ️',
      [LogLevel.WARN]: '⚠️',
      [LogLevel.ERROR]: '❌'
    };

    const color = {
      [LogLevel.DEBUG]: 'color: #6b7280',
      [LogLevel.INFO]: 'color: #3b82f6',
      [LogLevel.WARN]: 'color: #f59e0b',
      [LogLevel.ERROR]: 'color: #ef4444'
    };

    console.log(
      `%c${emoji[entry.level]} [${entry.category}] ${entry.message}`,
      color[entry.level],
      entry.data || ''
    );
  }

  debug(category: string, message: string, data?: any) {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    this.addLog(this.formatMessage(LogLevel.DEBUG, category, message, data));
  }

  info(category: string, message: string, data?: any) {
    if (!this.shouldLog(LogLevel.INFO)) return;
    this.addLog(this.formatMessage(LogLevel.INFO, category, message, data));
  }

  warn(category: string, message: string, data?: any) {
    if (!this.shouldLog(LogLevel.WARN)) return;
    this.addLog(this.formatMessage(LogLevel.WARN, category, message, data));
  }

  error(category: string, message: string, data?: any) {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    this.addLog(this.formatMessage(LogLevel.ERROR, category, message, data));
  }

  // Métodos específicos para categorias comuns
  performance(message: string, data?: any) {
    this.info('PERFORMANCE', message, data);
  }

  api(message: string, data?: any) {
    this.info('API', message, data);
  }

  auth(message: string, data?: any) {
    this.info('AUTH', message, data);
  }

  render(message: string, data?: any) {
    this.debug('RENDER', message, data);
  }

  cache(message: string, data?: any) {
    this.debug('CACHE', message, data);
  }

  // Utilitários
  getLogs(level?: LogLevel, category?: string): LogEntry[] {
    return this.logs.filter(log => {
      if (level !== undefined && log.level !== level) return false;
      if (category && log.category !== category) return false;
      return true;
    });
  }

  getRecentLogs(count = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  clearLogs() {
    this.logs = [];
    console.clear();
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  setLevel(level: LogLevel) {
    this.currentLevel = level;
  }

  // Wrapper para medir tempo de execução
  async measureTime<T>(
    category: string, 
    operation: string, 
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    this.debug(category, `Iniciando: ${operation}`);
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.performance(`${operation} concluído em ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(category, `${operation} falhou após ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  }

  // Wrapper para capturar erros
  catchError<T>(category: string, operation: string, fn: () => T): T | null {
    try {
      return fn();
    } catch (error) {
      this.error(category, `Erro em ${operation}`, error);
      return null;
    }
  }
}

// Instância singleton
export const logger = new Logger();

// Hook para React
export const useLogger = () => {
  return {
    debug: logger.debug.bind(logger),
    info: logger.info.bind(logger),
    warn: logger.warn.bind(logger),
    error: logger.error.bind(logger),
    performance: logger.performance.bind(logger),
    api: logger.api.bind(logger),
    auth: logger.auth.bind(logger),
    render: logger.render.bind(logger),
    cache: logger.cache.bind(logger),
    measureTime: logger.measureTime.bind(logger),
    catchError: logger.catchError.bind(logger)
  };
};

// Interceptador global de erros
window.addEventListener('error', (event) => {
  logger.error('GLOBAL', 'Erro JavaScript não capturado', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('GLOBAL', 'Promise rejeitada não capturada', {
    reason: event.reason
  });
});

export default logger;