import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ExportButton } from './ExportButton';
import { ExportData } from '@/services/exportService';

// Mock do serviço de exportação
vi.mock('@/services/exportService', () => ({
  exportService: {
    exportToPDF: vi.fn().mockResolvedValue(undefined),
    exportToExcel: vi.fn().mockResolvedValue(undefined),
  },
}));

const mockData: ExportData = {
  kpis: {
    currentBalance: 12450.75,
    totalIncome: 5800,
    totalExpenses: 4200,
    accountsPayable: 1520.40,
    overdueAccounts: 89.90,
    netProfit: 1600,
    totalRevenue: 5800,
  },
  transactions: [
    {
      id: '1',
      description: 'Venda de produto',
      amount: 1000,
      type: 'income' as const,
      category: 'vendas',
      date: '2024-01-15',
      status: 'completed' as const,
    },
  ],
  accountsPayable: [
    {
      id: '1',
      description: 'Fornecedor A',
      amount: 500,
      dueDate: '2024-02-15',
      status: 'pending' as const,
      category: 'fornecedores',
    },
  ],
  period: 'Janeiro 2024',
  generatedAt: new Date().toISOString(),
};

describe('ExportButton', () => {
  it('deve renderizar o botão de exportação', () => {
    render(<ExportButton data={mockData} />);
    
    const exportButton = screen.getByText('Exportar Relatório');
    expect(exportButton).toBeInTheDocument();
  });

  it('deve mostrar opções de exportação ao clicar no botão', () => {
    render(<ExportButton data={mockData} />);
    
    const exportButton = screen.getByText('Exportar Relatório');
    fireEvent.click(exportButton);
    
    expect(screen.getByText('Opções de Exportação')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('Excel')).toBeInTheDocument();
  });

  it('deve permitir selecionar formato PDF', () => {
    render(<ExportButton data={mockData} />);
    
    const exportButton = screen.getByText('Exportar Relatório');
    fireEvent.click(exportButton);
    
    const pdfButton = screen.getByText('PDF');
    fireEvent.click(pdfButton);
    
    expect(pdfButton.closest('button')).toHaveClass('border-blue-500');
  });

  it('deve permitir selecionar formato Excel', () => {
    render(<ExportButton data={mockData} />);
    
    const exportButton = screen.getByText('Exportar Relatório');
    fireEvent.click(exportButton);
    
    const excelButton = screen.getByText('Excel');
    fireEvent.click(excelButton);
    
    expect(excelButton.closest('button')).toHaveClass('border-green-500');
  });

  it('deve mostrar checkboxes para opções de conteúdo', () => {
    render(<ExportButton data={mockData} />);
    
    const exportButton = screen.getByText('Exportar Relatório');
    fireEvent.click(exportButton);
    
    expect(screen.getByText('Indicadores (KPIs)')).toBeInTheDocument();
    expect(screen.getByText('Gráficos')).toBeInTheDocument();
    expect(screen.getByText('Transações')).toBeInTheDocument();
    expect(screen.getByText('Contas a Pagar')).toBeInTheDocument();
  });

  it('deve fechar o modal ao clicar em cancelar', () => {
    render(<ExportButton data={mockData} />);
    
    const exportButton = screen.getByText('Exportar Relatório');
    fireEvent.click(exportButton);
    
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);
    
    expect(screen.queryByText('Opções de Exportação')).not.toBeInTheDocument();
  });
});