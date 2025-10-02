import React, { useState } from 'react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { Activity, ChevronDown, ChevronUp } from 'lucide-react';

export const PerformanceDebug: React.FC = () => {
  const { metrics, isLoading, grade, suggestions } = usePerformanceMonitor();
  const [isExpanded, setIsExpanded] = useState(false);

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

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-50">
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 animate-pulse" />
          <span className="text-sm">Medindo performance...</span>
        </div>
      </div>
    );
  }

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