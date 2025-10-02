import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Criar QueryClient para testes
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

// Provider wrapper para testes
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

// Função customizada de render
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-exportar tudo
export * from '@testing-library/react'
export { customRender as render }

// Mock de dados para testes
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user' as const,
  permissions: ['read', 'write'],
  createdAt: '2024-01-01T00:00:00Z',
}

export const mockKPI = {
  id: '1',
  title: 'Saldo Atual',
  value: 15000,
  change: 5.2,
  trend: 'up' as const,
  icon: 'wallet',
}

export const mockTransaction = {
  id: '1',
  description: 'Salário',
  amount: 5000,
  date: '2024-01-15',
  type: 'income' as const,
  category: 'Salário',
}

export const mockAccountPayable = {
  id: '1',
  description: 'Aluguel',
  amount: 1200,
  dueDate: '2024-01-30',
  status: 'pending' as const,
}