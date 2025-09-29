import { useEffect } from 'react';
import { useFinancialStore } from '@/store/useFinancialStore';

// Dados mock para inicializar o store
const mockMovimentacoes = [
  { id: '1', data: "2024-01-15", transacao: "Salário", categoria: "Renda", entrada: 5000, saida: 0, mes: "Janeiro" },
  { id: '2', data: "2024-01-20", transacao: "Aluguel", categoria: "Moradia", entrada: 0, saida: 1200, mes: "Janeiro" },
  { id: '3', data: "2024-01-25", transacao: "Supermercado", categoria: "Alimentação", entrada: 0, saida: 800, mes: "Janeiro" },
  { id: '4', data: "2024-01-30", transacao: "Transporte", categoria: "Transporte", entrada: 0, saida: 300, mes: "Janeiro" },
  { id: '5', data: "2024-02-15", transacao: "Salário", categoria: "Renda", entrada: 5000, saida: 0, mes: "Fevereiro" },
  { id: '6', data: "2024-02-20", transacao: "Aluguel", categoria: "Moradia", entrada: 0, saida: 1200, mes: "Fevereiro" },
  { id: '7', data: "2024-02-25", transacao: "Supermercado", categoria: "Alimentação", entrada: 0, saida: 600, mes: "Fevereiro" },
  { id: '8', data: "2024-02-28", transacao: "Freelance", categoria: "Renda", entrada: 1500, saida: 0, mes: "Fevereiro" },
  { id: '9', data: "2024-03-15", transacao: "Salário", categoria: "Renda", entrada: 5200, saida: 0, mes: "Março" },
  { id: '10', data: "2024-03-20", transacao: "Aluguel", categoria: "Moradia", entrada: 0, saida: 1200, mes: "Março" },
  { id: '11', data: "2024-03-25", transacao: "Supermercado", categoria: "Alimentação", entrada: 0, saida: 750, mes: "Março" },
  { id: '12', data: "2024-03-28", transacao: "Academia", categoria: "Saúde", entrada: 0, saida: 150, mes: "Março" },
  { id: '13', data: "2024-04-15", transacao: "Salário", categoria: "Renda", entrada: 5200, saida: 0, mes: "Abril" },
  { id: '14', data: "2024-04-20", transacao: "Aluguel", categoria: "Moradia", entrada: 0, saida: 1200, mes: "Abril" },
  { id: '15', data: "2024-04-25", transacao: "Supermercado", categoria: "Alimentação", entrada: 0, saida: 680, mes: "Abril" },
  { id: '16', data: "2024-04-30", transacao: "Investimento", categoria: "Investimentos", entrada: 0, saida: 1000, mes: "Abril" },
];

/**
 * Hook para inicializar o store com dados mock
 * Em produção, este hook seria responsável por carregar dados do Google Sheets
 */
export const useInitializeStore = () => {
  const { movimentacoes, setMovimentacoes, calculateMetrics } = useFinancialStore();

  useEffect(() => {
    // Inicializar apenas se não há dados no store
    if (movimentacoes.length === 0) {
      console.log('🔄 Inicializando store com dados mock...');
      setMovimentacoes(mockMovimentacoes);
      
      // Calcular métricas após carregar os dados
      setTimeout(() => {
        calculateMetrics();
      }, 100);
    }
  }, [movimentacoes.length, setMovimentacoes, calculateMetrics]);

  return {
    isInitialized: movimentacoes.length > 0,
    dataCount: movimentacoes.length,
  };
};

/**
 * Hook para simular carregamento de dados do Google Sheets
 * Em produção, este seria o hook principal para sincronização
 */
export const useDataSync = () => {
  const { 
    isLoading, 
    error, 
    lastSync, 
    setLoading, 
    setError, 
    setLastSync,
    setMovimentacoes,
    calculateMetrics,
    settings 
  } = useFinancialStore();

  const syncData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simular chamada para Google Sheets API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Em produção, aqui seria a chamada real para o Google Sheets
      // const data = await GoogleSheetsService.fetchData();
      
      // Por enquanto, usar dados mock
      setMovimentacoes(mockMovimentacoes);
      calculateMetrics();
      setLastSync(new Date().toISOString());

      console.log('✅ Sincronização concluída com sucesso');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro na sincronização:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const forceSync = () => {
    console.log('🔄 Forçando sincronização...');
    syncData();
  };

  // Auto-sync baseado nas configurações
  useEffect(() => {
    if (settings.autoSync && settings.syncInterval > 0) {
      const interval = setInterval(() => {
        console.log('🔄 Auto-sync executado');
        syncData();
      }, settings.syncInterval * 60 * 1000); // Converter minutos para ms

      return () => clearInterval(interval);
    }
  }, [settings.autoSync, settings.syncInterval]);

  return {
    isLoading,
    error,
    lastSync,
    syncData,
    forceSync,
  };
};