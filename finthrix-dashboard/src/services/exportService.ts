import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { Transaction, AccountPayable } from '@/types';
import { PDFTemplate } from '@/types/pdfTemplates';
import { cacheService } from './cacheService';

export interface ExportData {
  kpis: typeof import('@/utils/mockData').mockKPIs;
  transactions: Transaction[];
  accountsPayable: AccountPayable[];
  period: string;
  generatedAt: string;
}

export interface ExportOptions {
  includeCharts?: boolean;
  includeTransactions?: boolean;
  includeAccountsPayable?: boolean;
  includeKPIs?: boolean;
  format?: 'pdf' | 'excel' | 'csv' | 'json';
  fileName?: string;
  pdfTemplate?: PDFTemplate;
  csvOptions?: {
    delimiter?: string;
    includeHeaders?: boolean;
    encoding?: string;
  };
  jsonOptions?: {
    pretty?: boolean;
    includeMetadata?: boolean;
  };
}

class ExportService {
  /**
   * Exporta dados do dashboard em PDF
   */
  async exportToPDF(data: ExportData, options: ExportOptions = {}): Promise<void> {
    const {
      includeCharts = true,
      includeTransactions = true,
      includeAccountsPayable = true,
      includeKPIs = true,
      fileName = `finthrix-relatorio-${new Date().toISOString().split('T')[0]}`
    } = options;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Cabeçalho
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('FinThrix - Relatório Financeiro', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Período: ${data.period}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 5;
      pdf.text(`Gerado em: ${data.generatedAt}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 20;

      // KPIs
      if (includeKPIs) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Indicadores Principais', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        
        const kpiData = [
          ['Saldo Atual', this.formatCurrency(data.kpis.currentBalance)],
          ['Total de Entradas', this.formatCurrency(data.kpis.totalIncome)],
          ['Total de Saídas', this.formatCurrency(data.kpis.totalExpenses)],
          ['Contas a Pagar', this.formatCurrency(data.kpis.accountsPayable)],
          ['Contas Vencidas', this.formatCurrency(data.kpis.overdueAccounts)]
        ];

        kpiData.forEach(([label, value]) => {
          pdf.text(`${label}: ${value}`, 20, yPosition);
          yPosition += 7;
        });

        yPosition += 10;
      }

      // Gráficos (captura de tela)
      if (includeCharts) {
        await this.addChartsToPDF(pdf, yPosition);
        yPosition += 100; // Espaço estimado para gráficos
      }

      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 20;
      }

      // Transações
      if (includeTransactions && data.transactions.length > 0) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Transações Recentes', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        // Cabeçalho da tabela
        pdf.text('Data', 20, yPosition);
        pdf.text('Descrição', 50, yPosition);
        pdf.text('Categoria', 120, yPosition);
        pdf.text('Valor', 160, yPosition);
        yPosition += 7;

        // Linha separadora
        pdf.line(20, yPosition - 2, 190, yPosition - 2);

        data.transactions.slice(0, 15).forEach((transaction) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }

          const date = new Date(transaction.date).toLocaleDateString('pt-BR');
          const value = transaction.type === 'income' ? '+' : '-';
          
          pdf.text(date, 20, yPosition);
          pdf.text(transaction.description.substring(0, 25), 50, yPosition);
          pdf.text(transaction.category, 120, yPosition);
          pdf.text(`${value}${this.formatCurrency(transaction.amount)}`, 160, yPosition);
          yPosition += 6;
        });

        yPosition += 10;
      }

      // Contas a Pagar
      if (includeAccountsPayable && data.accountsPayable.length > 0) {
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Contas a Pagar', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        // Cabeçalho da tabela
        pdf.text('Vencimento', 20, yPosition);
        pdf.text('Descrição', 60, yPosition);
        pdf.text('Categoria', 120, yPosition);
        pdf.text('Valor', 160, yPosition);
        pdf.text('Status', 180, yPosition);
        yPosition += 7;

        // Linha separadora
        pdf.line(20, yPosition - 2, 190, yPosition - 2);

        data.accountsPayable.forEach((account) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }

          const dueDate = new Date(account.dueDate).toLocaleDateString('pt-BR');
          const status = account.status === 'pending' ? 'Pendente' : 
                        account.status === 'paid' ? 'Paga' : 'Vencida';
          
          pdf.text(dueDate, 20, yPosition);
          pdf.text(account.description.substring(0, 20), 60, yPosition);
          pdf.text(account.category, 120, yPosition);
          pdf.text(this.formatCurrency(account.amount), 160, yPosition);
          pdf.text(status, 180, yPosition);
          yPosition += 6;
        });
      }

      // Rodapé
      const totalPages = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text(`Página ${i} de ${totalPages}`, pageWidth - 30, pageHeight - 10);
        pdf.text('Gerado por FinThrix Dashboard', 20, pageHeight - 10);
      }

      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      throw new Error('Falha ao gerar relatório em PDF');
    }
  }

  /**
   * Exporta dados do dashboard em Excel
   */
  async exportToExcel(data: ExportData, options: ExportOptions = {}): Promise<void> {
    const {
      includeTransactions = true,
      includeAccountsPayable = true,
      includeKPIs = true,
      fileName = `finthrix-dados-${new Date().toISOString().split('T')[0]}`
    } = options;

    try {
      const workbook = XLSX.utils.book_new();

      // Planilha de KPIs
      if (includeKPIs) {
        const kpiData = [
          ['Indicador', 'Valor'],
          ['Saldo Atual', data.kpis.currentBalance],
          ['Total de Entradas', data.kpis.totalIncome],
          ['Total de Saídas', data.kpis.totalExpenses],
          ['Contas a Pagar', data.kpis.accountsPayable],
          ['Contas Vencidas', data.kpis.overdueAccounts],
          [],
          ['Período', data.period],
          ['Gerado em', data.generatedAt]
        ];

        const kpiWorksheet = XLSX.utils.aoa_to_sheet(kpiData);
        XLSX.utils.book_append_sheet(workbook, kpiWorksheet, 'KPIs');
      }

      // Planilha de Transações
      if (includeTransactions && data.transactions.length > 0) {
        const transactionData = [
          ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Status'],
          ...data.transactions.map(transaction => [
            new Date(transaction.date).toLocaleDateString('pt-BR'),
            transaction.description,
            transaction.category,
            transaction.type === 'income' ? 'Entrada' : 'Saída',
            transaction.amount,
            transaction.status === 'completed' ? 'Concluída' : 'Pendente'
          ])
        ];

        const transactionWorksheet = XLSX.utils.aoa_to_sheet(transactionData);
        XLSX.utils.book_append_sheet(workbook, transactionWorksheet, 'Transações');
      }

      // Planilha de Contas a Pagar
      if (includeAccountsPayable && data.accountsPayable.length > 0) {
        const accountsData = [
          ['Vencimento', 'Descrição', 'Categoria', 'Valor', 'Status'],
          ...data.accountsPayable.map(account => [
            new Date(account.dueDate).toLocaleDateString('pt-BR'),
            account.description,
            account.category,
            account.amount,
            account.status === 'pending' ? 'Pendente' : 
            account.status === 'paid' ? 'Paga' : 'Vencida'
          ])
        ];

        const accountsWorksheet = XLSX.utils.aoa_to_sheet(accountsData);
        XLSX.utils.book_append_sheet(workbook, accountsWorksheet, 'Contas a Pagar');
      }

      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      throw new Error('Falha ao gerar arquivo Excel');
    }
  }

  /**
   * Adiciona gráficos ao PDF através de captura de tela
   */
  private async addChartsToPDF(pdf: jsPDF, yPosition: number): Promise<void> {
    try {
      const chartsContainer = document.querySelector('[data-charts-container]');
      if (!chartsContainer) return;

      const canvas = await html2canvas(chartsContainer as HTMLElement, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 170; // Largura da imagem no PDF
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
    } catch (error) {
      console.warn('Não foi possível capturar os gráficos:', error);
    }
  }

  /**
   * Formata valores monetários
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  /**
   * Prepara dados para exportação
   */
  prepareExportData(
    kpis: typeof import('@/utils/mockData').mockKPIs,
    transactions: Transaction[],
    accountsPayable: AccountPayable[],
    period: string = 'Último mês'
  ): ExportData {
    return {
      kpis,
      transactions,
      accountsPayable,
      period,
      generatedAt: new Date().toLocaleString('pt-BR')
    };
  }

  /**
   * Exporta dados com cache inteligente
   */
  async exportWithCache(
    data: ExportData, 
    options: ExportOptions = {}
  ): Promise<void> {
    const cacheKey = cacheService.generateKey('export', {
      format: options.format || 'pdf',
      includeCharts: options.includeCharts,
      includeTransactions: options.includeTransactions,
      includeAccountsPayable: options.includeAccountsPayable,
      includeKPIs: options.includeKPIs,
      dataHash: this.generateDataHash(data)
    });

    // Verifica se já existe no cache
    const cachedResult = cacheService.get<Blob>(cacheKey);
    if (cachedResult) {
      this.downloadBlob(cachedResult, options.fileName || 'cached-export');
      return;
    }

    // Se não está no cache, gera novo export
    if (options.format === 'excel') {
      const blob = await this.generateExcelBlob(data, options);
      cacheService.set(cacheKey, blob);
      this.downloadBlob(blob, options.fileName || 'export.xlsx');
    } else {
      // Para PDF, não fazemos cache do blob pois é mais complexo
      await this.exportToPDF(data, options);
    }
  }

  /**
   * Gera hash dos dados para identificar mudanças
   */
  private generateDataHash(data: ExportData): string {
    const dataString = JSON.stringify({
      kpisCount: Object.keys(data.kpis).length,
      transactionsCount: data.transactions.length,
      accountsPayableCount: data.accountsPayable.length,
      period: data.period
    });
    
    // Hash simples baseado no conteúdo
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  /**
   * Gera blob do Excel para cache
   */
  private async generateExcelBlob(data: ExportData, options: ExportOptions): Promise<Blob> {
    const workbook = XLSX.utils.book_new();

    if (options.includeKPIs !== false) {
      const kpiData = [
        ['Métrica', 'Valor'],
        ['Receita Total', this.formatCurrency(data.kpis.totalRevenue)],
        ['Despesas Totais', this.formatCurrency(data.kpis.totalExpenses)],
        ['Lucro Líquido', this.formatCurrency(data.kpis.netProfit)],
        ['Contas a Pagar', this.formatCurrency(data.kpis.accountsPayable)],
        ['Contas Vencidas', this.formatCurrency(data.kpis.overdueAccounts)]
      ];
      
      const kpiWorksheet = XLSX.utils.aoa_to_sheet(kpiData);
      XLSX.utils.book_append_sheet(workbook, kpiWorksheet, 'KPIs');
    }

    if (options.includeTransactions !== false && data.transactions.length > 0) {
      const transactionData = [
        ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'],
        ...data.transactions.map(t => [
          new Date(t.date).toLocaleDateString('pt-BR'),
          t.description,
          t.category,
          t.type === 'income' ? 'Receita' : 'Despesa',
          this.formatCurrency(t.amount)
        ])
      ];
      
      const transactionWorksheet = XLSX.utils.aoa_to_sheet(transactionData);
      XLSX.utils.book_append_sheet(workbook, transactionWorksheet, 'Transações');
    }

    if (options.includeAccountsPayable !== false && data.accountsPayable.length > 0) {
      const accountsData = [
        ['Descrição', 'Valor', 'Data de Vencimento', 'Status'],
        ...data.accountsPayable.map(a => [
          a.description,
          this.formatCurrency(a.amount),
          new Date(a.dueDate).toLocaleDateString('pt-BR'),
          a.status === 'pending' ? 'Pendente' : a.status === 'paid' ? 'Pago' : 'Vencido'
        ])
      ];
      
      const accountsWorksheet = XLSX.utils.aoa_to_sheet(accountsData);
      XLSX.utils.book_append_sheet(workbook, accountsWorksheet, 'Contas a Pagar');
    }

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  /**
   * Faz download de um blob
   */
  private downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Exporta dados para CSV
   */
  async exportToCSV(data: ExportData, options: ExportOptions = {}): Promise<void> {
    const {
      includeTransactions = true,
      includeAccountsPayable = true,
      includeKPIs = true,
      fileName = `finthrix-dados-${new Date().toISOString().split('T')[0]}`,
      csvOptions = {}
    } = options;

    const {
      delimiter = ',',
      includeHeaders = true,
      encoding = 'utf-8'
    } = csvOptions;

    try {
      let csvContent = '';

      // Adicionar metadados
      if (includeHeaders) {
        csvContent += `# FinThrix - Exportação de Dados\n`;
        csvContent += `# Período: ${data.period}\n`;
        csvContent += `# Gerado em: ${data.generatedAt}\n`;
        csvContent += `\n`;
      }

      // KPIs
      if (includeKPIs) {
        if (includeHeaders) {
          csvContent += `# INDICADORES (KPIs)\n`;
          csvContent += `Indicador${delimiter}Valor\n`;
        }
        
        csvContent += `Receita Total${delimiter}${this.formatCurrency(data.kpis.totalRevenue)}\n`;
        csvContent += `Despesas Totais${delimiter}${this.formatCurrency(data.kpis.totalExpenses)}\n`;
        csvContent += `Lucro Líquido${delimiter}${this.formatCurrency(data.kpis.netProfit)}\n`;
        csvContent += `Contas a Pagar${delimiter}${this.formatCurrency(data.kpis.accountsPayable)}\n`;
        csvContent += `Contas Vencidas${delimiter}${this.formatCurrency(data.kpis.overdueAccounts)}\n`;
        csvContent += `\n`;
      }

      // Transações
      if (includeTransactions && data.transactions.length > 0) {
        if (includeHeaders) {
          csvContent += `# TRANSAÇÕES\n`;
          csvContent += `Data${delimiter}Descrição${delimiter}Categoria${delimiter}Tipo${delimiter}Valor\n`;
        }
        
        data.transactions.forEach(transaction => {
          const date = new Date(transaction.date).toLocaleDateString('pt-BR');
          const type = transaction.type === 'income' ? 'Receita' : 'Despesa';
          const amount = this.formatCurrency(transaction.amount);
          
          csvContent += `${date}${delimiter}"${transaction.description}"${delimiter}${transaction.category}${delimiter}${type}${delimiter}${amount}\n`;
        });
        csvContent += `\n`;
      }

      // Contas a Pagar
      if (includeAccountsPayable && data.accountsPayable.length > 0) {
        if (includeHeaders) {
          csvContent += `# CONTAS A PAGAR\n`;
          csvContent += `Descrição${delimiter}Valor${delimiter}Data de Vencimento${delimiter}Status\n`;
        }
        
        data.accountsPayable.forEach(account => {
          const dueDate = new Date(account.dueDate).toLocaleDateString('pt-BR');
          const status = account.status === 'pending' ? 'Pendente' : 
                        account.status === 'paid' ? 'Pago' : 'Vencido';
          const amount = this.formatCurrency(account.amount);
          
          csvContent += `"${account.description}"${delimiter}${amount}${delimiter}${dueDate}${delimiter}${status}\n`;
        });
      }

      // Criar e baixar arquivo
      const blob = new Blob([csvContent], { 
        type: `text/csv;charset=${encoding}` 
      });
      
      this.downloadBlob(blob, `${fileName}.csv`);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      throw new Error('Falha na exportação para CSV');
    }
  }

  /**
   * Exporta dados para JSON
   */
  async exportToJSON(data: ExportData, options: ExportOptions = {}): Promise<void> {
    const {
      includeTransactions = true,
      includeAccountsPayable = true,
      includeKPIs = true,
      fileName = `finthrix-dados-${new Date().toISOString().split('T')[0]}`,
      jsonOptions = {}
    } = options;

    const {
      pretty = true,
      includeMetadata = true
    } = jsonOptions;

    try {
      const exportData: any = {};

      // Metadados
      if (includeMetadata) {
        exportData.metadata = {
          exportedAt: new Date().toISOString(),
          period: data.period,
          generatedAt: data.generatedAt,
          version: '1.0',
          source: 'FinThrix Dashboard'
        };
      }

      // KPIs
      if (includeKPIs) {
        exportData.kpis = {
          totalRevenue: {
            value: data.kpis.totalRevenue,
            formatted: this.formatCurrency(data.kpis.totalRevenue),
            description: 'Receita total do período'
          },
          totalExpenses: {
            value: data.kpis.totalExpenses,
            formatted: this.formatCurrency(data.kpis.totalExpenses),
            description: 'Despesas totais do período'
          },
          netProfit: {
            value: data.kpis.netProfit,
            formatted: this.formatCurrency(data.kpis.netProfit),
            description: 'Lucro líquido do período'
          },
          accountsPayable: {
            value: data.kpis.accountsPayable,
            formatted: this.formatCurrency(data.kpis.accountsPayable),
            description: 'Total de contas a pagar'
          },
          overdueAccounts: {
            value: data.kpis.overdueAccounts,
            formatted: this.formatCurrency(data.kpis.overdueAccounts),
            description: 'Total de contas vencidas'
          }
        };
      }

      // Transações
      if (includeTransactions && data.transactions.length > 0) {
        exportData.transactions = data.transactions.map(transaction => ({
          id: transaction.id,
          date: transaction.date,
          dateFormatted: new Date(transaction.date).toLocaleDateString('pt-BR'),
          description: transaction.description,
          category: transaction.category,
          type: transaction.type,
          typeLabel: transaction.type === 'income' ? 'Receita' : 'Despesa',
          amount: transaction.amount,
          amountFormatted: this.formatCurrency(transaction.amount)
        }));
      }

      // Contas a Pagar
      if (includeAccountsPayable && data.accountsPayable.length > 0) {
        exportData.accountsPayable = data.accountsPayable.map(account => ({
          id: account.id,
          description: account.description,
          amount: account.amount,
          amountFormatted: this.formatCurrency(account.amount),
          dueDate: account.dueDate,
          dueDateFormatted: new Date(account.dueDate).toLocaleDateString('pt-BR'),
          status: account.status,
          statusLabel: account.status === 'pending' ? 'Pendente' : 
                      account.status === 'paid' ? 'Pago' : 'Vencido',
          isOverdue: new Date(account.dueDate) < new Date() && account.status !== 'paid'
        }));
      }

      // Estatísticas resumidas
      if (includeMetadata) {
        exportData.summary = {
          totalTransactions: data.transactions.length,
          totalAccountsPayable: data.accountsPayable.length,
          overdueAccountsCount: data.accountsPayable.filter(a => 
            new Date(a.dueDate) < new Date() && a.status !== 'paid'
          ).length,
          incomeTransactions: data.transactions.filter(t => t.type === 'income').length,
          expenseTransactions: data.transactions.filter(t => t.type === 'expense').length
        };
      }

      // Converter para JSON
      const jsonString = pretty 
        ? JSON.stringify(exportData, null, 2)
        : JSON.stringify(exportData);

      // Criar e baixar arquivo
      const blob = new Blob([jsonString], { 
        type: 'application/json;charset=utf-8' 
      });
      
      this.downloadBlob(blob, `${fileName}.json`);
    } catch (error) {
      console.error('Erro ao exportar JSON:', error);
      throw new Error('Falha na exportação para JSON');
    }
  }

  /**
   * Método principal de exportação que coordena todos os formatos
   */
  async export(data: ExportData, options: ExportOptions): Promise<void> {
    try {
      switch (options.format) {
        case 'pdf':
          await this.exportToPDF(data, options);
          break;
        case 'excel':
          await this.exportToExcel(data, options);
          break;
        case 'csv':
          await this.exportToCSV(data, options);
          break;
        case 'json':
          await this.exportToJSON(data, options);
          break;
        default:
          throw new Error(`Formato de exportação não suportado: ${options.format}`);
      }
    } catch (error) {
      console.error('Erro na exportação:', error);
      throw error;
    }
  }

  /**
   * Limpa cache de exportações
   */
  clearExportCache(): void {
    cacheService.clear();
  }

  /**
   * Retorna estatísticas do cache
   */
  getCacheStats() {
    return cacheService.getStats();
  }
}

export const exportService = new ExportService();
export default exportService;