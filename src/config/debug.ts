export const DEBUG_CONFIG = {
  // Configurações de logging
  logging: {
    enabled: import.meta.env.DEV,
    level: import.meta.env.DEV ? 'DEBUG' : 'INFO',
    categories: {
      AUTH: true,
      API: true,
      PERFORMANCE: true,
      RENDER: import.meta.env.DEV,
      CACHE: import.meta.env.DEV,
      NETWORK: true,
      ERROR: true
    }
  },

  // Configurações de performance
  performance: {
    enableMonitoring: true,
    memoryTracking: import.meta.env.DEV,
    renderTracking: import.meta.env.DEV,
    apiTimingThreshold: 2000, // ms
    renderCountWarning: 10,
    memoryWarningThreshold: 50 * 1024 * 1024 // 50MB
  },

  // Configurações de cache
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutos
    maxSize: 100,
    debugMode: import.meta.env.DEV
  },

  // Configurações de retry
  retry: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2
  },

  // Configurações de timeout
  timeouts: {
    googleAuth: 30000, // 30 segundos
    apiRequest: 15000, // 15 segundos
    scriptLoad: 10000  // 10 segundos
  },

  // Configurações de monitoramento
  monitoring: {
    systemMonitor: import.meta.env.DEV,
    networkStatus: true,
    errorTracking: true,
    performanceMetrics: true
  },

  // Pontos de debug críticos
  debugPoints: {
    googleAuth: {
      scriptLoad: true,
      tokenRequest: true,
      initialization: true,
      errors: true
    },
    googleSheets: {
      apiCalls: true,
      dataProcessing: true,
      caching: true,
      errors: true
    },
    components: {
      renderCycles: import.meta.env.DEV,
      stateChanges: import.meta.env.DEV,
      effectHooks: import.meta.env.DEV
    }
  }
};

// Utilitários para debugging
export const debugUtils = {
  isDebugEnabled: (category: string): boolean => {
    return DEBUG_CONFIG.logging.enabled && 
           DEBUG_CONFIG.logging.categories[category as keyof typeof DEBUG_CONFIG.logging.categories];
  },

  shouldTrackPerformance: (): boolean => {
    return DEBUG_CONFIG.performance.enableMonitoring;
  },

  getRetryConfig: () => {
    return DEBUG_CONFIG.retry;
  },

  getTimeoutConfig: (type: keyof typeof DEBUG_CONFIG.timeouts): number => {
    return DEBUG_CONFIG.timeouts[type];
  },

  formatMemoryUsage: (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)}MB`;
  },

  formatDuration: (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }
};

export default DEBUG_CONFIG;