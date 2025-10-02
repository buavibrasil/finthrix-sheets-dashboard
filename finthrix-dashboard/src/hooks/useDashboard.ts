import { useQuery, useQueryClient } from '@tanstack/react-query';
import dashboardService from '../services/dashboardService';
import { useDashboardStore } from '../stores/dashboardStore';

export const useDashboard = () => {
  const { filters } = useDashboardStore();
  const queryClient = useQueryClient();

  // Query para dados completos do dashboard
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: ['dashboard', filters],
    queryFn: () => dashboardService.getDashboardData(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Query para KPIs
  const {
    data: kpis,
    isLoading: isKPIsLoading,
    error: kpisError,
  } = useQuery({
    queryKey: ['kpis', filters],
    queryFn: () => dashboardService.getKPIs(filters),
    staleTime: 5 * 60 * 1000,
  });

  // Query para transações
  const {
    data: transactions,
    isLoading: isTransactionsLoading,
    error: transactionsError,
  } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => dashboardService.getTransactions(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos (dados mais dinâmicos)
  });

  // Query para contas a pagar
  const {
    data: accountsPayable,
    isLoading: isAccountsPayableLoading,
    error: accountsPayableError,
  } = useQuery({
    queryKey: ['accountsPayable', filters],
    queryFn: () => dashboardService.getAccountsPayable(filters),
    staleTime: 5 * 60 * 1000,
  });

  // Query para dados do gráfico de linha
  const {
    data: lineChartData,
    isLoading: isLineChartLoading,
    error: lineChartError,
  } = useQuery({
    queryKey: ['lineChart', filters],
    queryFn: () => dashboardService.getLineChartData(filters),
    staleTime: 5 * 60 * 1000,
  });

  // Query para dados do gráfico de pizza
  const {
    data: pieChartData,
    isLoading: isPieChartLoading,
    error: pieChartError,
  } = useQuery({
    queryKey: ['pieChart', filters],
    queryFn: () => dashboardService.getPieChartData(filters),
    staleTime: 5 * 60 * 1000,
  });

  // Função para invalidar e recarregar dados
  const refreshDashboard = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['kpis'] });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['accountsPayable'] });
    queryClient.invalidateQueries({ queryKey: ['lineChart'] });
    queryClient.invalidateQueries({ queryKey: ['pieChart'] });
  };

  // Estados de loading consolidados
  const isLoading = isDashboardLoading || isKPIsLoading || isTransactionsLoading || 
                   isAccountsPayableLoading || isLineChartLoading || isPieChartLoading;

  // Erros consolidados
  const hasError = dashboardError || kpisError || transactionsError || 
                  accountsPayableError || lineChartError || pieChartError;

  return {
    // Dados
    dashboardData,
    kpis,
    transactions,
    accountsPayable,
    lineChartData,
    pieChartData,
    
    // Estados
    isLoading,
    hasError,
    
    // Funções
    refreshDashboard,
    refetchDashboard,
    
    // Estados individuais (para controle granular)
    loading: {
      dashboard: isDashboardLoading,
      kpis: isKPIsLoading,
      transactions: isTransactionsLoading,
      accountsPayable: isAccountsPayableLoading,
      lineChart: isLineChartLoading,
      pieChart: isPieChartLoading,
    },
    
    // Erros individuais
    errors: {
      dashboard: dashboardError,
      kpis: kpisError,
      transactions: transactionsError,
      accountsPayable: accountsPayableError,
      lineChart: lineChartError,
      pieChart: pieChartError,
    },
  };
};