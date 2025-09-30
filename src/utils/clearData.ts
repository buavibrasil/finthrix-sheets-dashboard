/**
 * Utilitário para limpeza de dados da aplicação
 * Este arquivo contém funções para limpar todos os dados de lançamentos, contas e faturas
 */

import { useFinancialStore } from '@/store/useFinancialStore';

/**
 * Limpa todos os dados do store da aplicação
 * Remove todas as movimentações, reseta filtros e métricas
 */
export const clearAllFinancialData = () => {
  const store = useFinancialStore.getState();
  
  console.log('🧹 Iniciando limpeza de todos os dados financeiros...');
  console.log(`📊 Dados antes da limpeza: ${store.movimentacoes.length} movimentações`);
  
  // Limpar todos os dados usando a função do store
  store.clearAllData();
  
  console.log('✅ Limpeza concluída! Todos os dados foram removidos.');
  console.log('📊 Dados após limpeza: 0 movimentações');
  
  return {
    success: true,
    message: 'Todos os dados de lançamentos, contas e faturas foram limpos com sucesso.',
    clearedItems: store.movimentacoes.length
  };
};

/**
 * Verifica se existem dados no store
 */
export const checkDataExists = () => {
  const store = useFinancialStore.getState();
  
  return {
    hasMovimentacoes: store.movimentacoes.length > 0,
    totalMovimentacoes: store.movimentacoes.length,
    lastSync: store.lastSync,
    hasMetrics: store.metrics.totalReceitas > 0 || store.metrics.totalDespesas > 0
  };
};

/**
 * Função para limpar dados específicos (se necessário no futuro)
 */
export const clearSpecificData = (type: 'movimentacoes' | 'metrics' | 'filters') => {
  const store = useFinancialStore.getState();
  
  switch (type) {
    case 'movimentacoes':
      store.setMovimentacoes([]);
      console.log('✅ Movimentações limpas');
      break;
    case 'metrics':
      store.calculateMetrics();
      console.log('✅ Métricas recalculadas');
      break;
    case 'filters':
      store.resetFilters();
      console.log('✅ Filtros resetados');
      break;
    default:
      console.log('❌ Tipo de dados não reconhecido');
  }
};