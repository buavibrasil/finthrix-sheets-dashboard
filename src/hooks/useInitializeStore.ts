import { useEffect } from 'react';
import { useFinancialStore } from '@/store/useFinancialStore';

// Dados mock para inicializar o store - LIMPOS
const mockMovimentacoes: Array<{
  id: string;
  data: string;
  transacao: string;
  categoria: string;
  entrada: number;
  saida: number;
  mes: string;
}> = [];

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

  const syncData = async (accessToken?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Se não tiver token de acesso, usar dados mock como fallback
      if (!accessToken) {
        console.log('⚠️ Sem token de acesso, usando dados mock');
        setMovimentacoes(mockMovimentacoes);
        calculateMetrics();
        setLastSync(new Date().toISOString());
        return;
      }

      console.log('🔄 Carregando dados reais do Google Sheets...');
      
      // Importar o GoogleSheetsService dinamicamente para evitar problemas de dependência circular
      const { GoogleSheetsService } = await import('@/lib/google-sheets');
      
      // Buscar dados reais do Google Sheets
      const movimentacoes = await GoogleSheetsService.fetchMovimentacoes(accessToken);
      
      if (movimentacoes && movimentacoes.length > 0) {
        setMovimentacoes(movimentacoes);
        console.log(`✅ ${movimentacoes.length} movimentações carregadas do Google Sheets`);
      } else {
        console.log('⚠️ Nenhuma movimentação encontrada, usando dados mock como fallback');
        setMovimentacoes(mockMovimentacoes);
      }
      
      calculateMetrics();
      setLastSync(new Date().toISOString());

      console.log('✅ Sincronização concluída com sucesso');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro na sincronização:', errorMessage);
      
      // Em caso de erro, usar dados mock como fallback
      console.log('⚠️ Erro ao carregar dados reais, usando dados mock como fallback');
      setMovimentacoes(mockMovimentacoes);
      calculateMetrics();
      setLastSync(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  };

  const forceSync = (accessToken?: string) => {
    console.log('🔄 Forçando sincronização...');
    syncData(accessToken);
  };

  // Auto-sync baseado nas configurações
  useEffect(() => {
    if (settings.autoSync && settings.syncInterval > 0) {
      const interval = setInterval(() => {
        console.log('🔄 Auto-sync executado');
        // Auto-sync sem token usará dados mock como fallback
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