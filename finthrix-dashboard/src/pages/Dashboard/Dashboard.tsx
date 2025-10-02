import { memo, useMemo } from 'react';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useAuthStore } from '@/stores/authStore';
import { LazyLineChart, LazyPieChart, LazyBarChart, LazyAreaChart, LazyChart } from '@/components/charts';
import { Header } from '@/components/Layout';
import { ExportButton } from '@/components/Export';
import EmailVerificationBanner from '@/components/Auth/EmailVerificationBanner';
import { 
  mockLineChartData, 
  mockPieChartData, 
  mockBarChartData,
  mockAreaChartData,
  mockHorizontalBarChartData,
  mockKPIs,
  mockTransactions,
  mockAccountsPayable 
} from '@/utils/mockData';

const DashboardComponent = () => {
  const { filters, setFilters } = useDashboardStore();
  const { user } = useAuthStore();

  // Memoizar handlers para evitar recriação desnecessária
  const handlePeriodChange = useMemo(() => (period: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom') => {
    setFilters({ period });
  }, [setFilters]);

  const handleCategoryChange = useMemo(() => (category: string) => {
    setFilters({ category });
  }, [setFilters]);

  const clearFilters = useMemo(() => () => {
    setFilters({ period: 'month', category: 'all', transactionType: 'all' });
  }, [setFilters]);

  // Memoizar valores computados
  const hasActiveFilters = useMemo(() => 
    filters.period || filters.category || filters.transactionType, 
    [filters.period, filters.category, filters.transactionType]
  );

  // Memoizar dados para exportação
  const exportData = useMemo(() => ({
    kpis: mockKPIs,
    transactions: mockTransactions,
    accountsPayable: mockAccountsPayable,
    period: filters.period || 'month',
    generatedAt: new Date().toISOString(),
    charts: {
      lineChart: mockLineChartData,
      pieChart: mockPieChartData,
      barChart: mockBarChartData,
      areaChart: mockAreaChartData,
      horizontalBarChart: mockHorizontalBarChartData
    }
  }), []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Email Verification Banner */}
        {user && !user.emailVerified && (
          <EmailVerificationBanner email={user.email} />
        )}
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Financeiro</h1>
              <p className="mt-2 text-gray-600">
                Visão geral dos seus dados financeiros e indicadores de performance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <ExportButton 
                data={exportData}
                variant="primary"
                size="md"
              />
            </div>
          </div>
        </div>
        {/* Filters Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Filtros
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período
                </label>
                <select 
                  value={filters.period}
                  onChange={(e) => handlePeriodChange(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Período</option>
                  <option value="7d">Últimos 7 dias</option>
                  <option value="30d">Últimos 30 dias</option>
                  <option value="90d">Últimos 90 dias</option>
                  <option value="1y">Último ano</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Transação
                </label>
                <select 
                  value={filters.transactionType}
                  onChange={(e) => setFilters({ transactionType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tipo</option>
                  <option value="income">Receitas</option>
                  <option value="expense">Despesas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select 
                  value={filters.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Categoria</option>
                  <option value="alimentacao">Alimentação</option>
                  <option value="transporte">Transporte</option>
                  <option value="moradia">Moradia</option>
                  <option value="lazer">Lazer</option>
                  <option value="saude">Saúde</option>
                </select>
               </div>
               
               <div className="flex items-center gap-4">
                 {hasActiveFilters && (
                   <button
                     onClick={clearFilters}
                     className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                   >
                     Limpar Filtros
                   </button>
                 )}
                 
                 {hasActiveFilters && (
                   <div className="text-sm text-gray-500">
                     {[filters.period, filters.category, filters.transactionType].filter(Boolean).length} filtro(s) ativo(s)
                   </div>
                 )}
               </div>
             </div>
           </div>
         </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saldo Atual</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {mockKPIs.currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">💰</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receitas</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {mockKPIs.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">📈</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Despesas</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {mockKPIs.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-xl">📉</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contas a Pagar</p>
                <p className="text-2xl font-bold text-yellow-600">
                  R$ {mockKPIs.accountsPayable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl">📋</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contas Vencidas</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {mockKPIs.overdueAccounts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tendência de Receitas/Despesas
            </h3>
            <LazyChart height="300px">
              <LazyLineChart 
                data={mockLineChartData}
                height={300}
              />
            </LazyChart>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribuição por Categorias
            </h3>
            <LazyChart height="300px">
              <LazyPieChart 
                data={mockPieChartData}
                height={300}
              />
            </LazyChart>
          </div>
        </div>

        {/* Extended Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Comparação Mensal por Categoria
            </h3>
            <LazyChart height="300px">
              <LazyBarChart 
                data={mockBarChartData}
                height={300}
              />
            </LazyChart>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Fluxo de Caixa Acumulado
            </h3>
            <LazyChart height="300px">
              <LazyAreaChart 
                data={mockAreaChartData}
                height={300}
              />
            </LazyChart>
          </div>
        </div>

        {/* Horizontal Bar Chart Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Categorias de Gastos
            </h3>
            <LazyChart height="400px">
              <LazyBarChart 
                data={mockHorizontalBarChartData}
                height={400}
                orientation="horizontal"
              />
            </LazyChart>
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Transações Recentes
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : ''}R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Contas a Pagar
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockAccountsPayable.map((account) => {
                  const dueDate = new Date(account.dueDate);
                  const today = new Date();
                  const diffTime = dueDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  let statusText = '';
                  let statusColor = 'text-gray-500';
                  
                  if (account.status === 'overdue') {
                    statusText = `Vencida há ${Math.abs(diffDays)} dias`;
                    statusColor = 'text-red-500';
                  } else if (diffDays <= 7) {
                    statusText = `Vence em ${diffDays} dias`;
                    statusColor = 'text-yellow-600';
                  } else {
                    statusText = `Vence em ${diffDays} dias`;
                    statusColor = 'text-gray-500';
                  }
                  
                  return (
                    <div key={account.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{account.description}</p>
                        <p className={`text-sm ${statusColor}`}>{statusText}</p>
                      </div>
                      <span className={`font-medium ${
                        account.status === 'overdue' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        R$ {account.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Exportar componente memoizado
const Dashboard = memo(DashboardComponent);

export default Dashboard;