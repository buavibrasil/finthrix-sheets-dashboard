import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { useMemo } from 'react';

// Tipos para o estado financeiro
export interface Movimentacao {
  id?: string;
  data: string;
  transacao: string;
  categoria: string;
  entrada: number;
  saida: number;
  mes: string;
  observacoes?: string;
}

export interface FilterState {
  selectedMonth: string;
  selectedCategory: string;
  searchTerm: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface FinancialMetrics {
  totalReceitas: number;
  totalDespesas: number;
  saldoTotal: number;
  receitasMes: number;
  despesasMes: number;
  saldoMes: number;
}

export interface FinancialState {
  // Dados
  movimentacoes: Movimentacao[];
  isLoading: boolean;
  error: string | null;
  lastSync: string | null;
  
  // Filtros
  filters: FilterState;
  
  // Métricas calculadas
  metrics: FinancialMetrics;
  
  // Configurações
  settings: {
    autoSync: boolean;
    syncInterval: number; // em minutos
    currency: string;
    dateFormat: string;
  };
  
  // Actions
  setMovimentacoes: (movimentacoes: Movimentacao[]) => void;
  addMovimentacao: (movimentacao: Movimentacao) => void;
  updateMovimentacao: (id: string, movimentacao: Partial<Movimentacao>) => void;
  removeMovimentacao: (id: string) => void;
  
  // Filtros
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  
  // Métricas
  calculateMetrics: () => void;
  
  // Sync
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastSync: (timestamp: string) => void;
  
  // Settings
  updateSettings: (settings: Partial<FinancialState['settings']>) => void;
  
  // Computed getters
  getFilteredMovimentacoes: () => Movimentacao[];
  getMonthlyData: () => Record<string, Movimentacao[]>;
  getCategoryData: () => Record<string, Movimentacao[]>;
  getAvailableMonths: () => string[];
  getAvailableCategories: () => string[];
}

// Estado inicial
const initialState = {
  movimentacoes: [],
  isLoading: false,
  error: null,
  lastSync: null,
  filters: {
    selectedMonth: 'all',
    selectedCategory: 'all',
    searchTerm: '',
  },
  metrics: {
    totalReceitas: 0,
    totalDespesas: 0,
    saldoTotal: 0,
    receitasMes: 0,
    despesasMes: 0,
    saldoMes: 0,
  },
  settings: {
    autoSync: true,
    syncInterval: 5,
    currency: 'BRL',
    dateFormat: 'DD/MM/YYYY',
  },
};

// Store principal
export const useFinancialStore = create<FinancialState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Actions para movimentações
        setMovimentacoes: (movimentacoes) =>
          set((state) => ({
            ...state,
            movimentacoes,
            lastSync: new Date().toISOString(),
          })),
          
        addMovimentacao: (movimentacao) =>
          set((state) => {
            const newMovimentacao = {
              ...movimentacao,
              id: movimentacao.id || `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            };
            return {
              ...state,
              movimentacoes: [...state.movimentacoes, newMovimentacao],
            };
          }),
          
        updateMovimentacao: (id, updates) =>
          set((state) => ({
            ...state,
            movimentacoes: state.movimentacoes.map(mov => 
              mov.id === id ? { ...mov, ...updates } : mov
            ),
          })),
          
        removeMovimentacao: (id) =>
          set((state) => ({
            ...state,
            movimentacoes: state.movimentacoes.filter(mov => mov.id !== id),
          })),
          
        // Actions para filtros
        setFilters: (newFilters) =>
          set((state) => ({
            ...state,
            filters: { ...state.filters, ...newFilters },
          })),
          
        resetFilters: () =>
          set((state) => ({
            ...state,
            filters: { ...initialState.filters },
          })),
          
        // Cálculo de métricas
        calculateMetrics: () =>
          set((state) => {
            const { movimentacoes } = state;
            const filteredMovs = get().getFilteredMovimentacoes();
            
            // Métricas totais
            const totalReceitas = movimentacoes.reduce((sum, mov) => sum + mov.entrada, 0);
            const totalDespesas = movimentacoes.reduce((sum, mov) => sum + mov.saida, 0);
            const saldoTotal = totalReceitas - totalDespesas;
            
            // Métricas do mês selecionado
            const receitasMes = filteredMovs.reduce((sum, mov) => sum + mov.entrada, 0);
            const despesasMes = filteredMovs.reduce((sum, mov) => sum + mov.saida, 0);
            const saldoMes = receitasMes - despesasMes;
            
            return {
              ...state,
              metrics: {
                totalReceitas,
                totalDespesas,
                saldoTotal,
                receitasMes,
                despesasMes,
                saldoMes,
              },
            };
          }),
          
        // Actions para sync
        setLoading: (loading) =>
          set((state) => ({
            ...state,
            isLoading: loading,
          })),
          
        setError: (error) =>
          set((state) => ({
            ...state,
            error,
          })),
          
        setLastSync: (timestamp) =>
          set((state) => ({
            ...state,
            lastSync: timestamp,
          })),
          
        // Settings
        updateSettings: (newSettings) =>
          set((state) => ({
            ...state,
            settings: { ...state.settings, ...newSettings },
          })),
          
        // Computed getters
        getFilteredMovimentacoes: () => {
          const { movimentacoes, filters } = get();
          
          return movimentacoes.filter(mov => {
            const monthMatch = filters.selectedMonth === 'all' || mov.mes === filters.selectedMonth;
            const categoryMatch = filters.selectedCategory === 'all' || mov.categoria === filters.selectedCategory;
            const searchMatch = filters.searchTerm === '' || 
              mov.transacao.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
              mov.categoria.toLowerCase().includes(filters.searchTerm.toLowerCase());
            
            let dateMatch = true;
            if (filters.dateRange) {
              const movDate = new Date(mov.data);
              const startDate = new Date(filters.dateRange.start);
              const endDate = new Date(filters.dateRange.end);
              dateMatch = movDate >= startDate && movDate <= endDate;
            }
            
            return monthMatch && categoryMatch && searchMatch && dateMatch;
          });
        },
        
        getMonthlyData: () => {
          const { movimentacoes } = get();
          return movimentacoes.reduce((acc, mov) => {
            if (!acc[mov.mes]) {
              acc[mov.mes] = [];
            }
            acc[mov.mes].push(mov);
            return acc;
          }, {} as Record<string, Movimentacao[]>);
        },
        
        getCategoryData: () => {
          const { movimentacoes } = get();
          return movimentacoes.reduce((acc, mov) => {
            if (!acc[mov.categoria]) {
              acc[mov.categoria] = [];
            }
            acc[mov.categoria].push(mov);
            return acc;
          }, {} as Record<string, Movimentacao[]>);
        },
        
        getAvailableMonths: () => {
          const { movimentacoes } = get();
          return Array.from(new Set(movimentacoes.map(mov => mov.mes)));
        },
        
        getAvailableCategories: () => {
          const { movimentacoes } = get();
          return Array.from(new Set(movimentacoes.map(mov => mov.categoria)));
        },
      }),
      {
        name: 'financial-store',
        partialize: (state) => ({
          movimentacoes: state.movimentacoes,
          filters: state.filters,
          settings: state.settings,
          lastSync: state.lastSync,
        }),
      }
    )
  )
);

// Hooks especializados para diferentes partes do estado
export const useMovimentacoes = () => useFinancialStore(state => state.movimentacoes);
export const useFilters = () => useFinancialStore(state => state.filters);
export const useMetrics = () => useFinancialStore(state => state.metrics);
export const useSettings = () => useFinancialStore(state => state.settings);
export const useLoadingState = () => useFinancialStore(state => ({ 
  isLoading: state.isLoading, 
  error: state.error 
}));

// Hook para ações do store
export const useFinancialActions = () => {
  const store = useFinancialStore();
  return useMemo(() => ({
    setMovimentacoes: store.setMovimentacoes,
    addMovimentacao: store.addMovimentacao,
    updateMovimentacao: store.updateMovimentacao,
    removeMovimentacao: store.removeMovimentacao,
    setFilters: store.setFilters,
    resetFilters: store.resetFilters,
    calculateMetrics: store.calculateMetrics,
    setLoading: store.setLoading,
    setError: store.setError,
    updateSettings: store.updateSettings,
  }), [store]);
};

// Hook para dados computados
export const useComputedData = () => {
  const movimentacoes = useFinancialStore(state => state.movimentacoes);
  const filters = useFinancialStore(state => state.filters);
  
  return useMemo(() => {
    const filteredMovimentacoes = movimentacoes.filter(mov => {
      const monthMatch = filters.selectedMonth === 'all' || mov.mes === filters.selectedMonth;
      const categoryMatch = filters.selectedCategory === 'all' || mov.categoria === filters.selectedCategory;
      const searchMatch = filters.searchTerm === '' || 
        mov.transacao.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        mov.categoria.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      let dateMatch = true;
      if (filters.dateRange) {
        const movDate = new Date(mov.data);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        dateMatch = movDate >= startDate && movDate <= endDate;
      }
      
      return monthMatch && categoryMatch && searchMatch && dateMatch;
    });

    const monthlyData = movimentacoes.reduce((acc, mov) => {
      if (!acc[mov.mes]) {
        acc[mov.mes] = [];
      }
      acc[mov.mes].push(mov);
      return acc;
    }, {} as Record<string, Movimentacao[]>);

    const categoryData = movimentacoes.reduce((acc, mov) => {
      if (!acc[mov.categoria]) {
        acc[mov.categoria] = [];
      }
      acc[mov.categoria].push(mov);
      return acc;
    }, {} as Record<string, Movimentacao[]>);

    const availableMonths = Array.from(new Set(movimentacoes.map(mov => mov.mes)));
    const availableCategories = Array.from(new Set(movimentacoes.map(mov => mov.categoria)));

    return {
      filteredMovimentacoes,
      monthlyData,
      categoryData,
      availableMonths,
      availableCategories,
    };
  }, [movimentacoes, filters]);
};