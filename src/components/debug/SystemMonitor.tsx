import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PerformanceMonitor, SimpleCache } from "@/utils/performance";
import { GoogleSheetsEnhancedService } from "@/lib/google-sheets-enhanced";
import { Activity, Database, Wifi, Zap, Trash2, RefreshCw } from "lucide-react";

interface SystemStats {
  memory?: {
    used: string;
    total: string;
    limit: string;
  };
  cache: {
    size: number;
    keys: string[];
  };
  network: {
    online: boolean;
    effectiveType?: string;
  };
  performance: {
    renderCount: number;
    lastUpdate: string;
  };
}

export const SystemMonitor: React.FC = () => {
  const [stats, setStats] = useState<SystemStats>({
    cache: { size: 0, keys: [] },
    network: { online: navigator.onLine },
    performance: { renderCount: 0, lastUpdate: new Date().toISOString() }
  });
  
  const [isVisible, setIsVisible] = useState(false);
  const renderCount = React.useRef(0);

  const updateStats = () => {
    renderCount.current += 1;
    
    const newStats: SystemStats = {
      cache: GoogleSheetsEnhancedService.getCacheStatus(),
      network: {
        online: navigator.onLine,
        effectiveType: (navigator as any).connection?.effectiveType || 'unknown'
      },
      performance: {
        renderCount: renderCount.current,
        lastUpdate: new Date().toISOString()
      }
    };

    // Verificar memória se disponível
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      newStats.memory = {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
      };
    }

    setStats(newStats);
    PerformanceMonitor.measureMemory();
  };

  const clearCache = () => {
    GoogleSheetsEnhancedService.clearCache();
    updateStats();
  };

  const runPerformanceTest = () => {
    PerformanceMonitor.startTimer('performance-test');
    
    // Simular operação custosa
    const start = performance.now();
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.random();
    }
    const duration = performance.now() - start;
    
    PerformanceMonitor.endTimer('performance-test');
    console.log(`🧪 Teste de performance concluído: ${duration.toFixed(2)}ms`);
  };

  useEffect(() => {
    updateStats();
    
    const interval = setInterval(updateStats, 5000); // Atualizar a cada 5 segundos
    
    const handleOnline = () => updateStats();
    const handleOffline = () => updateStats();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Mostrar apenas em desenvolvimento
  if (import.meta.env.PROD && !isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Activity className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitor do Sistema
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 text-xs">
        {/* Status da Rede */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="h-3 w-3" />
            <span>Rede:</span>
          </div>
          <Badge variant={stats.network.online ? "default" : "destructive"}>
            {stats.network.online ? "Online" : "Offline"}
            {stats.network.effectiveType && ` (${stats.network.effectiveType})`}
          </Badge>
        </div>

        {/* Cache */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-3 w-3" />
            <span>Cache:</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{stats.cache.size} itens</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCache}
              className="h-6 w-6 p-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Performance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3" />
            <span>Renders:</span>
          </div>
          <Badge variant={renderCount.current > 10 ? "destructive" : "default"}>
            {stats.performance.renderCount}
          </Badge>
        </div>

        {/* Memória */}
        {stats.memory && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span>Memória:</span>
              <span>{stats.memory.used} / {stats.memory.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-600 h-1 rounded-full" 
                style={{ 
                  width: `${(parseFloat(stats.memory.used) / parseFloat(stats.memory.total)) * 100}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={updateStats}
            className="flex-1"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Atualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={runPerformanceTest}
            className="flex-1"
          >
            <Zap className="h-3 w-3 mr-1" />
            Teste
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Última atualização: {new Date(stats.performance.lastUpdate).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};