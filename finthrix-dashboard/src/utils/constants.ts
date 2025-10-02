export const PERIOD_OPTIONS = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
  { value: 'quarter', label: 'Este trimestre' },
  { value: 'year', label: 'Este ano' },
  { value: 'custom', label: 'Período personalizado' },
] as const

export const TRANSACTION_TYPE_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'income', label: 'Receitas' },
  { value: 'expense', label: 'Despesas' },
] as const

export const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Todas as categorias' },
  { value: 'food', label: 'Alimentação' },
  { value: 'transport', label: 'Transporte' },
  { value: 'health', label: 'Saúde' },
  { value: 'education', label: 'Educação' },
  { value: 'entertainment', label: 'Entretenimento' },
  { value: 'shopping', label: 'Compras' },
  { value: 'bills', label: 'Contas' },
  { value: 'salary', label: 'Salário' },
  { value: 'investment', label: 'Investimentos' },
  { value: 'other', label: 'Outros' },
] as const

export const PAGINATION_OPTIONS = [
  { value: 10, label: '10 por página' },
  { value: 15, label: '15 por página' },
  { value: 25, label: '25 por página' },
  { value: 50, label: '50 por página' },
] as const

export const CHART_COLORS = {
  primary: '#0ea5e9',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1',
} as const

export const SYNC_INTERVALS = {
  KPI: 30000, // 30 seconds
  CHARTS: 120000, // 2 minutes
  TABLES: 60000, // 1 minute
} as const