import { useState, useEffect, useCallback } from 'react';
import { dashboardCache } from '@/services/cacheService';
import { 
  mockKPIs, 
  mockTransactions, 
  mockAccountsPayable,
  mockLineChartData,
  mockPieChartData,
  mockBarChartData,
  mockAreaChartData,
  mockHorizontalBarChartData
} from '@/utils/mockData';

interface DashboardData {
  kpis: typeof mockKPIs;
  transactions: typeof mockTransactions;
  accountsPayable: typeof mockAccountsPayable;
  lineChartData: typeof mockLineChartData;
  pieChartData: typeof mockPieChartData;
  barChartData: typeof mockBarChartData;
  areaChartData: typeof mockAreaChartData;
  horizontalBarChartData: typeof mockHorizontalBarChartData;
}

interface UseDashboardDataOptions {
  enableCache?: boolean;
  cacheKey?: string;
  refreshInterval?: number; // em milissegundos
}

export const useDashboardData = (options: UseDashboardDataOptions = {}) => {
  const {
    enableCache = true,
    cacheKey = 'dashboard-data',
    refreshInterval = 0 // 0 = sem refresh automático
  } = options;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Verifica cache primeiro
      if (enableCache) {
        const cachedData = dashboardCache.get<DashboardData>(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          setLastUpdated(new Date());
          return cachedData;
        }
      }

      // Simula carregamento de dados (em uma aplicação real, seria uma chamada à API)
      await new Promise(resolve => setTimeout(resolve, 500));

      const dashboardData: DashboardData = {
        kpis: mockKPIs,
        transactions: mockTransactions,
        accountsPayable: mockAccountsPayable,
        lineChartData: mockLineChartData,
        pieChartData: mockPieChartData,
        barChartData: mockBarChartData,
        areaChartData: mockAreaChartData,
        horizontalBarChartData: mockHorizontalBarChartData
      };

      // Armazena no cache
      if (enableCache) {
        dashboardCache.set(cacheKey, dashboardData);
      }

      setData(dashboardData);
      setLastUpdated(new Date());
      return dashboardData;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      return null;
    } finally {
      setLoading(false);
    }
  }, [enableCache, cacheKey]);

  const refreshData = useCallback(async () => {
    // Limpa cache e recarrega
    if (enableCache) {
      dashboardCache.delete(cacheKey);
    }
    return await loadData();
  }, [enableCache, cacheKey, loadData]);

  const clearCache = useCallback(() => {
    if (enableCache) {
      dashboardCache.delete(cacheKey);
    }
  }, [enableCache, cacheKey]);

  const getCacheStats = useCallback(() => {
    return dashboardCache.getStats();
  }, []);

  // Carrega dados na inicialização
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh automático (se configurado)
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        refreshData();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, refreshData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refreshData,
    clearCache,
    getCacheStats,
    // Dados individuais para facilitar o uso
    kpis: data?.kpis || mockKPIs,
    transactions: data?.transactions || mockTransactions,
    accountsPayable: data?.accountsPayable || mockAccountsPayable,
    lineChartData: data?.lineChartData || mockLineChartData,
    pieChartData: data?.pieChartData || mockPieChartData,
    barChartData: data?.barChartData || mockBarChartData,
    areaChartData: data?.areaChartData || mockAreaChartData,
    horizontalBarChartData: data?.horizontalBarChartData || mockHorizontalBarChartData
  };
};