import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetric {
  componentName: string;
  operation: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceMonitorOptions {
  enabled?: boolean;
  threshold?: number; // ms - só reporta se duração for maior que threshold
  maxMetrics?: number; // máximo de métricas a manter em memória
}

class PerformanceCollector {
  private static instance: PerformanceCollector;
  private metrics: PerformanceMetric[] = [];
  private maxMetrics: number = 100;

  static getInstance(): PerformanceCollector {
    if (!PerformanceCollector.instance) {
      PerformanceCollector.instance = new PerformanceCollector();
    }
    return PerformanceCollector.instance;
  }

  addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Mantém apenas as métricas mais recentes
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${metric.componentName}.${metric.operation}: ${metric.duration}ms`, metric.metadata);
    }

    // Em produção, pode enviar para serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(metric);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getMetricsByComponent(componentName: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.componentName === componentName);
  }

  getAverageTime(componentName: string, operation: string): number {
    const relevantMetrics = this.metrics.filter(
      m => m.componentName === componentName && m.operation === operation
    );
    
    if (relevantMetrics.length === 0) return 0;
    
    const total = relevantMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / relevantMetrics.length;
  }

  private sendToMonitoringService(metric: PerformanceMetric) {
    // Implementar integração com serviço de monitoramento (ex: DataDog, New Relic, etc.)
    // Por enquanto, apenas simula o envio
    if (metric.duration > 100) { // Só reporta operações lentas
      console.warn(`[Performance Alert] Slow operation detected: ${metric.componentName}.${metric.operation} took ${metric.duration}ms`);
    }
  }

  clearMetrics() {
    this.metrics = [];
  }
}

export function usePerformanceMonitor(
  componentName: string,
  options: PerformanceMonitorOptions = {}
) {
  const {
    enabled = true,
    threshold = 0,
    maxMetrics = 100
  } = options;

  const collector = PerformanceCollector.getInstance();
  const timersRef = useRef<Map<string, number>>(new Map());

  // Configura o coletor
  useEffect(() => {
    collector['maxMetrics'] = maxMetrics;
  }, [maxMetrics]);

  const startTimer = useCallback((operation: string) => {
    if (!enabled) return;
    timersRef.current.set(operation, performance.now());
  }, [enabled]);

  const endTimer = useCallback((operation: string, metadata?: Record<string, any>) => {
    if (!enabled) return;

    const startTime = timersRef.current.get(operation);
    if (!startTime) {
      console.warn(`[Performance] Timer not found for operation: ${operation}`);
      return;
    }

    const duration = performance.now() - startTime;
    timersRef.current.delete(operation);

    // Só adiciona métrica se duração for maior que threshold
    if (duration >= threshold) {
      collector.addMetric({
        componentName,
        operation,
        duration,
        timestamp: Date.now(),
        metadata
      });
    }
  }, [enabled, threshold, componentName]);

  const measureAsync = useCallback(async <T>(
    operation: string,
    asyncFn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    if (!enabled) return asyncFn();

    startTimer(operation);
    try {
      const result = await asyncFn();
      endTimer(operation, { ...metadata, success: true });
      return result;
    } catch (error) {
      endTimer(operation, { ...metadata, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }, [enabled, startTimer, endTimer]);

  const measureSync = useCallback(<T>(
    operation: string,
    syncFn: () => T,
    metadata?: Record<string, any>
  ): T => {
    if (!enabled) return syncFn();

    startTimer(operation);
    try {
      const result = syncFn();
      endTimer(operation, { ...metadata, success: true });
      return result;
    } catch (error) {
      endTimer(operation, { ...metadata, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }, [enabled, startTimer, endTimer]);

  const getComponentMetrics = useCallback(() => {
    return collector.getMetricsByComponent(componentName);
  }, [componentName]);

  const getAverageTime = useCallback((operation: string) => {
    return collector.getAverageTime(componentName, operation);
  }, [componentName]);

  return {
    startTimer,
    endTimer,
    measureAsync,
    measureSync,
    getComponentMetrics,
    getAverageTime,
    collector
  };
}

export { PerformanceCollector };
export type { PerformanceMetric, PerformanceMonitorOptions };