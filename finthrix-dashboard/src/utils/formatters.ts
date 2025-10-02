import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export const formatDate = (date: string | Date, pattern = 'dd/MM/yyyy'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, pattern, { locale: ptBR })
}

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm')
}

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`
}

export const formatNumber = (value: number, decimals = 0): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export const getTransactionTypeLabel = (type: 'income' | 'expense'): string => {
  const labels = {
    income: 'Receita',
    expense: 'Despesa',
  }
  return labels[type]
}

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    completed: 'Concluído',
    pending: 'Pendente',
    cancelled: 'Cancelado',
    paid: 'Pago',
    overdue: 'Vencido',
  }
  return labels[status] || status
}

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    completed: 'text-success-600 bg-success-50',
    pending: 'text-warning-600 bg-warning-50',
    cancelled: 'text-gray-600 bg-gray-50',
    paid: 'text-success-600 bg-success-50',
    overdue: 'text-danger-600 bg-danger-50',
  }
  return colors[status] || 'text-gray-600 bg-gray-50'
}