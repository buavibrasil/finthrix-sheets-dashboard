import api from './api';
import { KPI, Transaction, AccountPayable, ChartData } from '../types';

export interface DashboardFilters {
  period: string;
  category: string;
  transactionType: string;
}

export interface DashboardResponse {
  kpis: KPI[];
  transactions: Transaction[];
  accountsPayable: AccountPayable[];
  lineChartData: ChartData;
  pieChartData: ChartData;
}

class DashboardService {
  // Buscar dados do dashboard com filtros
  async getDashboardData(filters: DashboardFilters): Promise<DashboardResponse> {
    try {
      const response = await api.get('/dashboard', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      throw error;
    }
  }

  // Buscar KPIs
  async getKPIs(filters: DashboardFilters): Promise<KPI[]> {
    try {
      const response = await api.get('/dashboard/kpis', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar KPIs:', error);
      throw error;
    }
  }

  // Buscar transações
  async getTransactions(filters: DashboardFilters): Promise<Transaction[]> {
    try {
      const response = await api.get('/dashboard/transactions', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      throw error;
    }
  }

  // Buscar contas a pagar
  async getAccountsPayable(filters: DashboardFilters): Promise<AccountPayable[]> {
    try {
      const response = await api.get('/dashboard/accounts-payable', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar contas a pagar:', error);
      throw error;
    }
  }

  // Buscar dados para gráfico de linha
  async getLineChartData(filters: DashboardFilters): Promise<ChartData> {
    try {
      const response = await api.get('/dashboard/charts/line', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do gráfico de linha:', error);
      throw error;
    }
  }

  // Buscar dados para gráfico de pizza
  async getPieChartData(filters: DashboardFilters): Promise<ChartData> {
    try {
      const response = await api.get('/dashboard/charts/pie', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do gráfico de pizza:', error);
      throw error;
    }
  }

  // Exportar dados do dashboard
  async exportDashboard(filters: DashboardFilters, format: 'pdf' | 'excel'): Promise<Blob> {
    try {
      const response = await api.get(`/dashboard/export/${format}`, {
        params: filters,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao exportar dashboard:', error);
      throw error;
    }
  }
}

export default new DashboardService();