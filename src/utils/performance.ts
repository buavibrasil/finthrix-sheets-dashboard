// Utilitários para monitoramento de performance
export class PerformanceMonitor {
  private static timers = new Map<string, number>();

  static startTimer(label: string): void {
    this.timers.set(label, performance.now());
    console.log(`⏱️ [${label}] Iniciado`);
  }

  static endTimer(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      console.warn(`⚠️ Timer '${label}' não encontrado`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(label);
    
    console.log(`✅ [${label}] Concluído em ${duration.toFixed(2)}ms`);
    
    // Alertar se operação demorar mais que 100ms
    if (duration > 100) {
      console.warn(`🐌 [${label}] Operação lenta: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  static measureMemory(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log('📊 Memória:', {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
      });
    }
  }

  static logAPICall(endpoint: string, method: string, duration?: number): void {
    console.log(`🌐 API Call: ${method} ${endpoint}`, {
      timestamp: new Date().toISOString(),
      duration: duration ? `${duration.toFixed(2)}ms` : 'pending'
    });
  }

  static logError(context: string, error: Error): void {
    console.error(`❌ [${context}] Erro:`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}

// Hook para monitorar re-renders
export const useRenderCount = (componentName: string) => {
  const renderCount = React.useRef(0);
  
  React.useEffect(() => {
    renderCount.current += 1;
    console.log(`🔄 [${componentName}] Render #${renderCount.current}`);
    
    if (renderCount.current > 10) {
      console.warn(`⚠️ [${componentName}] Muitos re-renders: ${renderCount.current}`);
    }
  });
  
  return renderCount.current;
};

// Cache simples para dados
export class SimpleCache {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  static set(key: string, data: any, ttlMs: number = 300000): void { // 5 min default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  static get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  static clear(): void {
    this.cache.clear();
  }

  static size(): number {
    return this.cache.size;
  }
}