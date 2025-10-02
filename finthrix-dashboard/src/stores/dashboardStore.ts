import { create } from 'zustand'
import { DashboardState, FilterOptions } from '@/types'

interface DashboardStore extends DashboardState {
  setFilters: (filters: Partial<FilterOptions>) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setLastSync: (lastSync: string) => void
  resetFilters: () => void
}

const defaultFilters: FilterOptions = {
  period: 'month',
  transactionType: 'all',
  category: 'all',
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  filters: defaultFilters,
  isLoading: false,
  lastSync: null,
  error: null,

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setLastSync: (lastSync) => set({ lastSync }),

  resetFilters: () => set({ filters: defaultFilters }),
}))