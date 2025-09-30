// Script temporário para limpar histórico de movimentações
import { useFinancialStore } from '@/store/useFinancialStore';

export const clearMovimentacoesHistory = () => {
  const store = useFinancialStore.getState();
  
  console.log('Estado antes da limpeza:', {
    totalMovimentacoes: store.movimentacoes.length,
    metrics: store.metrics
  });
  
  // Limpar todos os dados
  store.clearAllData();
  
  console.log('Histórico de movimentações limpo com sucesso!');
  console.log('Estado após limpeza:', {
    totalMovimentacoes: store.movimentacoes.length,
    metrics: store.metrics
  });
  
  return true;
};

// Executar automaticamente se chamado diretamente
if (typeof window !== 'undefined') {
  (window as any).clearMovimentacoesHistory = clearMovimentacoesHistory;
}