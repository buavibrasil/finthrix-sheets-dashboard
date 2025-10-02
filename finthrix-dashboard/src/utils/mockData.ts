// Dados simulados para demonstração do dashboard

export const mockLineChartData = {
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
  datasets: [
    {
      label: 'Receitas',
      data: [5000, 5200, 4800, 5500, 5300, 5800],
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4,
    },
    {
      label: 'Despesas',
      data: [3200, 3800, 3500, 4100, 3900, 4200],
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.4,
    },
  ],
};

export const mockPieChartData = {
  labels: ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Outros'],
  datasets: [
    {
      label: 'Gastos por Categoria',
      data: [1200, 800, 1500, 400, 300, 500],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(107, 114, 128, 0.8)',
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(107, 114, 128, 1)',
      ],
      borderWidth: 2,
    },
  ],
};

export const mockTransactions = [
  {
    id: '1',
    description: 'Salário',
    amount: 5000,
    type: 'income' as const,
    category: 'Salário',
    date: '2025-01-01',
    status: 'completed' as const,
  },
  {
    id: '2',
    description: 'Supermercado',
    amount: -250.80,
    type: 'expense' as const,
    category: 'Alimentação',
    date: '2024-12-30',
    status: 'completed' as const,
  },
  {
    id: '3',
    description: 'Combustível',
    amount: -120,
    type: 'expense' as const,
    category: 'Transporte',
    date: '2024-12-29',
    status: 'completed' as const,
  },
  {
    id: '4',
    description: 'Freelance',
    amount: 800,
    type: 'income' as const,
    category: 'Trabalho',
    date: '2024-12-28',
    status: 'completed' as const,
  },
];

export const mockAccountsPayable = [
  {
    id: '1',
    description: 'Energia Elétrica',
    amount: 180.50,
    dueDate: '2025-01-06',
    status: 'pending' as const,
    category: 'Moradia',
  },
  {
    id: '2',
    description: 'Internet',
    amount: 89.90,
    dueDate: '2024-12-30',
    status: 'overdue' as const,
    category: 'Moradia',
  },
  {
    id: '3',
    description: 'Cartão de Crédito',
    amount: 1250,
    dueDate: '2025-01-16',
    status: 'pending' as const,
    category: 'Financeiro',
  },
];

export const mockKPIs = {
  currentBalance: 12450.75,
  totalIncome: 5800,
  totalExpenses: 4200,
  accountsPayable: 1520.40,
  overdueAccounts: 89.90,
  netProfit: 1600, // totalIncome - totalExpenses
  totalRevenue: 5800, // mesmo valor que totalIncome
};

// Dados para gráfico de barras - Comparação mensal por categoria
export const mockBarChartData = {
  labels: ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação'],
  datasets: [
    {
      label: 'Mês Atual',
      data: [1200, 800, 1500, 400, 300, 600],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
    },
    {
      label: 'Mês Anterior',
      data: [1100, 750, 1500, 350, 280, 550],
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      borderColor: 'rgba(16, 185, 129, 1)',
      borderWidth: 1,
    },
  ],
};

// Dados para gráfico de área - Fluxo de caixa acumulado
export const mockAreaChartData = {
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
  datasets: [
    {
      label: 'Saldo Acumulado',
      data: [1800, 3600, 2900, 4300, 3700, 5300],
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.3)',
      fill: true,
      tension: 0.4,
    },
    {
      label: 'Meta de Economia',
      data: [2000, 4000, 6000, 8000, 10000, 12000],
      borderColor: 'rgb(245, 158, 11)',
      backgroundColor: 'rgba(245, 158, 11, 0.2)',
      fill: true,
      tension: 0.4,
    },
  ],
};

// Dados para gráfico de barras horizontal - Top categorias de gastos
export const mockHorizontalBarChartData = {
  labels: ['Moradia', 'Alimentação', 'Transporte', 'Educação', 'Lazer', 'Saúde'],
  datasets: [
    {
      label: 'Gastos por Categoria',
      data: [1500, 1200, 800, 600, 400, 300],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
      ],
      borderColor: [
        'rgba(239, 68, 68, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(236, 72, 153, 1)',
      ],
      borderWidth: 1,
    },
  ],
};