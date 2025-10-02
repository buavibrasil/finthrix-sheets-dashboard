const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Mock data
const mockKPIs = {
  saldoAtual: {
    value: 125430.50,
    change: 12.5,
    trend: 'up'
  },
  receitas: {
    value: 89250.00,
    change: 8.3,
    trend: 'up'
  },
  despesas: {
    value: 45820.75,
    change: -3.2,
    trend: 'down'
  },
  contasAPagar: {
    value: 12350.00,
    change: -15.7,
    trend: 'down'
  },
  contasVencidas: {
    value: 2450.00,
    change: -25.4,
    trend: 'down'
  }
};

const mockTransactions = [
  {
    id: 1,
    description: 'Pagamento de fornecedor',
    amount: -5500.00,
    date: '2024-01-15',
    category: 'Despesas',
    type: 'expense',
    status: 'completed'
  },
  {
    id: 2,
    description: 'Recebimento de cliente',
    amount: 12000.00,
    date: '2024-01-14',
    category: 'Receitas',
    type: 'income',
    status: 'completed'
  },
  {
    id: 3,
    description: 'Compra de equipamentos',
    amount: -3200.00,
    date: '2024-01-13',
    category: 'Investimentos',
    type: 'expense',
    status: 'pending'
  },
  {
    id: 4,
    description: 'Venda de produtos',
    amount: 8750.00,
    date: '2024-01-12',
    category: 'Receitas',
    type: 'income',
    status: 'completed'
  },
  {
    id: 5,
    description: 'Pagamento de salários',
    amount: -15000.00,
    date: '2024-01-11',
    category: 'Folha de Pagamento',
    type: 'expense',
    status: 'completed'
  }
];

const mockAccountsPayable = [
  {
    id: 1,
    supplier: 'Fornecedor ABC Ltda',
    amount: 4500.00,
    dueDate: '2024-01-20',
    status: 'pending',
    category: 'Materiais'
  },
  {
    id: 2,
    supplier: 'Energia Elétrica S.A.',
    amount: 1200.00,
    dueDate: '2024-01-18',
    status: 'overdue',
    category: 'Utilidades'
  },
  {
    id: 3,
    supplier: 'Telecomunicações XYZ',
    amount: 850.00,
    dueDate: '2024-01-25',
    status: 'pending',
    category: 'Comunicação'
  },
  {
    id: 4,
    supplier: 'Consultoria Financeira',
    amount: 3200.00,
    dueDate: '2024-01-22',
    status: 'pending',
    category: 'Serviços'
  },
  {
    id: 5,
    supplier: 'Seguradora Nacional',
    amount: 2600.00,
    dueDate: '2024-01-15',
    status: 'overdue',
    category: 'Seguros'
  }
];

const mockLineChartData = {
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
  datasets: [
    {
      label: 'Receitas',
      data: [65000, 72000, 68000, 89000, 85000, 92000],
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4
    },
    {
      label: 'Despesas',
      data: [45000, 48000, 52000, 46000, 51000, 49000],
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.4
    }
  ]
};

const mockPieChartData = {
  labels: ['Receitas', 'Despesas', 'Investimentos', 'Reservas'],
  datasets: [
    {
      data: [45, 30, 15, 10],
      backgroundColor: [
        'rgb(34, 197, 94)',
        'rgb(239, 68, 68)',
        'rgb(59, 130, 246)',
        'rgb(168, 85, 247)'
      ],
      borderWidth: 2
    }
  ]
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'FinThrix Mock Server is running',
    timestamp: new Date().toISOString()
  });
});

// Dashboard endpoints
app.get('/api/dashboard', (req, res) => {
  setTimeout(() => {
    res.json({
      kpis: mockKPIs,
      recentTransactions: mockTransactions.slice(0, 5),
      accountsPayable: mockAccountsPayable.slice(0, 5),
      summary: {
        totalBalance: mockKPIs.saldoAtual.value,
        monthlyIncome: mockKPIs.receitas.value,
        monthlyExpenses: mockKPIs.despesas.value,
        pendingPayments: mockKPIs.contasAPagar.value
      }
    });
  }, 500); // Simula latência da rede
});

app.get('/api/dashboard/kpis', (req, res) => {
  setTimeout(() => {
    res.json(mockKPIs);
  }, 300);
});

app.get('/api/dashboard/transactions', (req, res) => {
  const { limit = 10, offset = 0 } = req.query;
  const start = parseInt(offset);
  const end = start + parseInt(limit);
  
  setTimeout(() => {
    res.json({
      transactions: mockTransactions.slice(start, end),
      total: mockTransactions.length,
      hasMore: end < mockTransactions.length
    });
  }, 400);
});

app.get('/api/dashboard/accounts-payable', (req, res) => {
  const { limit = 10, offset = 0 } = req.query;
  const start = parseInt(offset);
  const end = start + parseInt(limit);
  
  setTimeout(() => {
    res.json({
      accounts: mockAccountsPayable.slice(start, end),
      total: mockAccountsPayable.length,
      hasMore: end < mockAccountsPayable.length
    });
  }, 350);
});

app.get('/api/dashboard/charts/line', (req, res) => {
  setTimeout(() => {
    res.json(mockLineChartData);
  }, 600);
});

app.get('/api/dashboard/charts/pie', (req, res) => {
  setTimeout(() => {
    res.json(mockPieChartData);
  }, 450);
});

// Export endpoint
app.get('/api/dashboard/export/:format', (req, res) => {
  const { format } = req.params;
  
  setTimeout(() => {
    res.json({
      message: `Export em formato ${format} gerado com sucesso`,
      downloadUrl: `/api/downloads/dashboard-${Date.now()}.${format}`,
      expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hora
    });
  }, 1000);
});

// Auth endpoints (básicos para compatibilidade)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  setTimeout(() => {
    if (email && password) {
      res.json({
        token: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        user: {
          id: 1,
          email: email,
          name: 'Usuário Teste',
          role: 'admin'
        }
      });
    } else {
      res.status(400).json({
        error: 'Email e senha são obrigatórios'
      });
    }
  }, 800);
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    res.json({
      id: 1,
      email: 'usuario@teste.com',
      name: 'Usuário Teste',
      role: 'admin'
    });
  } else {
    res.status(401).json({
      error: 'Token de autenticação necessário'
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FinThrix Mock Server rodando na porta ${PORT}`);
  console.log(`📊 Dashboard API disponível em: http://localhost:${PORT}/api/dashboard`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Logs de requisições habilitados`);
});

module.exports = app;