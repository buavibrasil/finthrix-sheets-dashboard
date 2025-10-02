import React, { useState, useEffect } from 'react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { Activity, ChevronDown, ChevronUp } from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  chunkCount: number;
}

type PerformanceGrade = 'excellent' | 'good' | 'fair' | 'poor';

export const PerformanceDebug: React.FC = () => {
  const { getComponentMetrics, collector } = usePerformanceMonitor('PerformanceDebug');
  const [isExpanded, setIsExpanded] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    bundleSize: 0,
    chunkCount: 0
  });
  const [grade, setGrade] = useState<PerformanceGrade>('good');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // Simular coleta de métricas de performance
    const collectMetrics = () => {
      const allMetrics = collector.getMetrics();
      const avgLoadTime = allMetrics.length > 0 
        ? allMetrics.reduce((sum, m) => sum + m.duration, 0) / allMetrics.length 
        : 0;

      // Simular outras métricas
      const newMetrics: PerformanceMetrics = {
        loadTime: Math.round(avgLoadTime),
        renderTime: Math.round(performance.now() % 100),
        memoryUsage: Math.round((performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0),
        bundleSize: 250, // Valor simulado
        chunkCount: 3 // Valor simulado
      };

      setMetrics(newMetrics);

      // Calcular grade baseada nas métricas
      const calculateGrade = (metrics: PerformanceMetrics): PerformanceGrade => {
        const score = 
          (metrics.loadTime < 100 ? 25 : metrics.loadTime < 300 ? 15 : metrics.loadTime < 500 ? 10 : 0) +
          (metrics.renderTime < 50 ? 25 : metrics.renderTime < 100 ? 15 : metrics.renderTime < 200 ? 10 : 0) +
          (metrics.memoryUsage < 50 ? 25 : metrics.memoryUsage < 100 ? 15 : metrics.memoryUsage < 200 ? 10 : 0) +
          (metrics.bundleSize < 200 ? 25 : metrics.bundleSize < 500 ? 15 : metrics.bundleSize < 1000 ? 10 : 0);

        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'fair';
        return 'poor';
      };

      const newGrade = calculateGrade(newMetrics);
      setGrade(newGrade);

      // Gerar sugestões baseadas nas métricas
      const newSuggestions: string[] = [];
      if (newMetrics.loadTime > 300) {
        newSuggestions.push('Considere otimizar o tempo de carregamento');
      }
      if (newMetrics.renderTime > 100) {
        newSuggestions.push('Renderização pode ser otimizada');
      }
      if (newMetrics.memoryUsage > 100) {
        newSuggestions.push('Alto uso de memória detectado');
      }
      if (newMetrics.bundleSize > 500) {
        newSuggestions.push('Bundle muito grande, considere code splitting');
      }

      setSuggestions(newSuggestions);
    };

    collectMetrics();
    const interval = setInterval(collectMetrics, 5000); // Atualizar a cada 5 segundos

    return () => clearInterval(interval);
  }, [collector]);

  // Só mostrar em desenvolvimento
  if (import.meta.env.PROD) {
    return null;
  }

  const gradeColors = {
    excellent: 'text-green-600 bg-green-100',
    good: 'text-blue-600 bg-blue-100',
    fair: 'text-yellow-600 bg-yellow-100',
    poor: 'text-red-600 bg-red-100'
  };

  const gradeLabels = {
    excellent: 'Excelente',
    good: 'Bom',
    fair: 'Regular',
    poor: 'Ruim'
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-w-sm">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4" />
          <span className="text-sm font-medium">Performance</span>
          <span className={`text-xs px-2 py-1 rounded-full ${gradeColors[grade]}`}>
            {gradeLabels[grade]}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-3 space-y-3">
          {/* Métricas */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Load Time:</span>
              <div className="font-mono">{metrics.loadTime}ms</div>
            </div>
            <div>
              <span className="text-gray-500">Render Time:</span>
              <div className="font-mono">{metrics.renderTime}ms</div>
            </div>
            <div>
              <span className="text-gray-500">Memory:</span>
              <div className="font-mono">{metrics.memoryUsage}MB</div>
            </div>
            <div>
              <span className="text-gray-500">Bundle:</span>
              <div className="font-mono">{metrics.bundleSize}KB</div>
            </div>
          </div>

          {/* Chunks */}
          <div className="text-xs">
            <span className="text-gray-500">Chunks carregados:</span>
            <div className="font-mono">{metrics.chunkCount}</div>
          </div>

          {/* Sugestões */}
          {suggestions.length > 0 && (
            <div className="text-xs">
              <div className="text-gray-500 mb-1">Sugestões:</div>
              <ul className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="text-gray-700">
                    • {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PerformanceDebug;