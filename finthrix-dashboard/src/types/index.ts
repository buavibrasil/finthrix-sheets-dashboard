export interface Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
  status: 'completed' | 'pending' | 'cancelled'
}

export interface Account {
  id: string
  name: string
  balance: number
  type: 'checking' | 'savings' | 'credit'
}

export interface AccountPayable {
  id: string
  description: string
  amount: number
  dueDate: string
  status: 'pending' | 'paid' | 'overdue'
  category: string
}

export interface KPI {
  id: string
  title: string
  value: number
  change: number
  trend: 'up' | 'down' | 'neutral'
  icon: string
}

export interface KPIData {
  currentBalance: number
  totalIncome: number
  totalExpenses: number
  accountsPayable: number
  overdueAccounts: number
  netProfit: number
  totalRevenue: number
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }[]
}

export interface FilterOptions {
  period: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
  transactionType: 'all' | 'income' | 'expense'
  category: string
  startDate?: string
  endDate?: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  permissions: 'basic' | 'family' | 'admin'
}

export interface DashboardState {
  filters: FilterOptions
  isLoading: boolean
  lastSync: string | null
  error: string | null
}

export interface PaginationConfig {
  page: number
  limit: number
  total: number
}