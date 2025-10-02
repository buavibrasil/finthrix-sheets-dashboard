import { memo, useMemo } from 'react'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useAuthStore } from '@/stores/authStore'
import { useDashboard } from '@/hooks/useDashboard'
import { LazyLineChart, LazyPieChart, LazyChart } from '@/components/charts'
import { Header } from '@/components/Layout'
import { ExportButton } from '@/components/Export'
import EmailVerificationBanner from '@/components/Auth/EmailVerificationBanner'
import { FunctionalButton } from '@/components/Demo/FunctionalButton'

const DashboardComponent = () => {
  const { filters, setFilters } = useDashboardStore();
  const { user } = useAuthStore();
  
  // Buscar dados reais usando o hook useDashboard
  const {
    kpis,
    transactions,
    accountsPayable,
    lineChartData,
    pieChartData,
    loading: {
      kpis: isKPIsLoading,
      transactions: isTransactionsLoading,
      accountsPayable: isAccountsPayableLoading,
      lineChart: isLineChartLoading,
      pieChart: isPieChartLoading,
    },
    errors: {
      kpis: kpisError,
      transactions: transactionsError,
      accountsPayable: accountsPayableError,
      lineChart: lineChartError,
      pieChart: pieChartError,
    },
  } = useDashboard()

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
  const exportData = useMemo(() => {
    // Converter array de KPIs para objeto se necessário
    const kpisObject = Array.isArray(kpis) ? {
      currentBalance: kpis.find(k => k.title === 'Saldo Atual')?.value || 0,
      totalIncome: kpis.find(k => k.title === 'Total de Entradas')?.value || 0,
      totalExpenses: kpis.find(k => k.title === 'Total de Saídas')?.value || 0,
      accountsPayable: kpis.find(k => k.title === 'Contas a Pagar')?.value || 0,
      overdueAccounts: kpis.find(k => k.title === 'Contas Vencidas')?.value || 0,
      netProfit: kpis.find(k => k.title === 'Lucro Líquido')?.value || 0,
      totalRevenue: kpis.find(k => k.title === 'Receita Total')?.value || 0,
    } : kpis || {
      currentBalance: 0,
      totalIncome: 0,
      totalExpenses: 0,
      accountsPayable: 0,
      overdueAccounts: 0,
      netProfit: 0,
      totalRevenue: 0,
    };

    return {
      kpis: kpisObject,
      transactions: transactions || [],
      accountsPayable: accountsPayable || [],
      period: 'Último mês',
      generatedAt: new Date().toLocaleString('pt-BR')
    };
  }, [kpis, transactions, accountsPayable]);

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
                  {isKPIsLoading ? (
                    <span className="animate-pulse bg-gray-200 h-8 w-24 rounded"></span>
                  ) : kpisError ? (
                    <span className="text-red-500">Erro</span>
                  ) : (
                    `R$ ${((kpis as any)?.currentBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  )}
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
                  {isKPIsLoading ? (
                    <span className="animate-pulse bg-gray-200 h-8 w-24 rounded"></span>
                  ) : kpisError ? (
                    <span className="text-red-500">Erro</span>
                  ) : (
                    `R$ ${((kpis as any)?.totalIncome || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  )}
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
                  {isKPIsLoading ? (
                    <span className="animate-pulse bg-gray-200 h-8 w-24 rounded"></span>
                  ) : kpisError ? (
                    <span className="text-red-500">Erro</span>
                  ) : (
                    `R$ ${((kpis as any)?.totalExpenses || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  )}
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
                  {isKPIsLoading ? (
                    <span className="animate-pulse bg-gray-200 h-8 w-24 rounded"></span>
                  ) : kpisError ? (
                    <span className="text-red-500">Erro</span>
                  ) : (
                    `R$ ${((kpis as any)?.accountsPayable || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  )}
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
                  {isKPIsLoading ? (
                    <span className="animate-pulse bg-gray-200 h-8 w-24 rounded"></span>
                  ) : kpisError ? (
                    <span className="text-red-500">Erro</span>
                  ) : (
                    `R$ ${((kpis as any)?.overdueAccounts || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  )}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Functional Button Demo */}
        <div className="mb-8">
          <FunctionalButton />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tendência de Receitas/Despesas
            </h3>
            <LazyChart height="300px">
              {isLineChartLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : lineChartError ? (
                <div className="flex items-center justify-center h-[300px] text-red-500">
                  Erro ao carregar gráfico
                </div>
              ) : (
                <LazyLineChart 
                  data={(lineChartData as any) || { 
                    labels: [], 
                    datasets: [{
                      label: 'Dados',
                      data: [],
                      borderColor: '#3B82F6',
                      backgroundColor: '#3B82F6',
                      tension: 0.1
                    }]
                  }}
                  height={300}
                />
              )}
            </LazyChart>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribuição por Categorias
            </h3>
            <LazyChart height="300px">
              {isPieChartLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : pieChartError ? (
                <div className="flex items-center justify-center h-[300px] text-red-500">
                  Erro ao carregar gráfico
                </div>
              ) : (
                <LazyPieChart 
                  data={(pieChartData as any) || { 
                    labels: [], 
                    datasets: [{
                      label: 'Dados',
                      data: [],
                      backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'],
                      borderColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'],
                      borderWidth: 1
                    }]
                  }}
                  height={300}
                />
              )}
            </LazyChart>
          </div>
        </div>

        {/* Extended Charts Section - Temporariamente removido até implementar dados reais */}
        {/* 
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Comparação Mensal por Categoria
            </h3>
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Gráfico em desenvolvimento
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Fluxo de Caixa Acumulado
            </h3>
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Gráfico em desenvolvimento
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Categorias de Gastos
            </h3>
            <div className="flex items-center justify-center h-[400px] text-gray-500">
              Gráfico em desenvolvimento
            </div>
          </div>
        </div>
        */}

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
                {isTransactionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : transactionsError ? (
                  <div className="text-center py-8 text-red-500">
                    Erro ao carregar transações
                  </div>
                ) : !transactions || transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma transação encontrada
                  </div>
                ) : (
                  transactions.slice(0, 5).map((transaction) => (
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
                  ))
                )}
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
                {isAccountsPayableLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : accountsPayableError ? (
                  <div className="text-center py-8 text-red-500">
                    Erro ao carregar contas a pagar
                  </div>
                ) : !accountsPayable || accountsPayable.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma conta a pagar encontrada
                  </div>
                ) : (
                  accountsPayable.slice(0, 5).map((account) => {
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
                  })
                )}
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