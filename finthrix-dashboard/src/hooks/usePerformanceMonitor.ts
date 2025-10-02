import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  chunkCount: number;
}

// Usando tipos nativos do DOM para PerformanceNavigationTiming

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    bundleSize: 0,
    chunkCount: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const measurePerformance = () => {
      try {
        // Timing de navegação
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        const renderTime = navigation.domContentLoadedEventEnd - navigation.fetchStart;

        // Memória (se disponível)
        const memory = (performance as any).memory;
        const memoryUsage = memory ? memory.usedJSHeapSize / 1024 / 1024 : 0; // MB

        // Recursos carregados (aproximação do bundle size)
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const jsResources = resources.filter(resource => 
          resource.name.includes('.js') || resource.name.includes('.tsx') || resource.name.includes('.ts')
        );
        
        const bundleSize = jsResources.reduce((total, resource) => {
          return total + (resource.transferSize || 0);
        }, 0) / 1024; // KB

        const chunkCount = jsResources.length;

        setMetrics({
          loadTime: Math.round(loadTime),
          renderTime: Math.round(renderTime),
          memoryUsage: Math.round(memoryUsage * 100) / 100,
          bundleSize: Math.round(bundleSize * 100) / 100,
          chunkCount
        });

        setIsLoading(false);
      } catch (error) {
        console.warn('Performance monitoring não disponível:', error);
        setIsLoading(false);
      }
    };

    // Aguardar o carregamento completo
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  const getPerformanceGrade = (): 'excellent' | 'good' | 'fair' | 'poor' => {
    const { loadTime, bundleSize } = metrics;
    
    if (loadTime < 1000 && bundleSize < 500) return 'excellent';
    if (loadTime < 2000 && bundleSize < 1000) return 'good';
    if (loadTime < 3000 && bundleSize < 1500) return 'fair';
    return 'poor';
  };

  const getOptimizationSuggestions = (): string[] => {
    const suggestions: string[] = [];
    const { loadTime, bundleSize, chunkCount } = metrics;

    if (loadTime > 2000) {
      suggestions.push('Considere implementar mais lazy loading');
    }
    
    if (bundleSize > 1000) {
      suggestions.push('Bundle size alto - considere code splitting adicional');
    }
    
    if (chunkCount < 3) {
      suggestions.push('Poucos chunks - considere dividir o código em mais partes');
    }
    
    if (metrics.memoryUsage > 50) {
      suggestions.push('Alto uso de memória - verifique vazamentos');
    }

    return suggestions;
  };

  return {
    metrics,
    isLoading,
    grade: getPerformanceGrade(),
    suggestions: getOptimizationSuggestions()
  };
};