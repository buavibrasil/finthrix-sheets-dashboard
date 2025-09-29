import { supabase } from "@/integrations/supabase/client";
import { GoogleSheetsDirectService } from "./google-sheets-direct";

export interface MovimentacaoData {
  data: string;
  transacao: string;
  categoria: string;
  entrada: number;
  saida: number;
  mes: string;
}

export interface ContaData {
  dataFatura: string;
  numeroFatura: string;
  total: number;
  destinatario: string;
}

export class GoogleSheetsService {
  private static readonly SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID;

  // Validação da configuração
  private static validateConfig(): void {
    if (!this.SPREADSHEET_ID || this.SPREADSHEET_ID === "your-google-spreadsheet-id") {
      throw new Error('Google Spreadsheet ID não configurado. Configure VITE_GOOGLE_SPREADSHEET_ID no arquivo .env');
    }
  }
  
  static async fetchMovimentacoes(accessToken: string): Promise<MovimentacaoData[]> {
    this.validateConfig();
    
    try {
      // Tentar usar a Edge Function primeiro
      const { data, error } = await supabase.functions.invoke('google-sheets', {
        body: {
          access_token: accessToken,
          spreadsheet_id: this.SPREADSHEET_ID,
          range: 'Movimentações!A:F'
        }
      });

      if (error) throw error;

      const rows = data.values || [];
      if (rows.length <= 1) return []; // Sem dados ou apenas cabeçalho

      // Converter dados das linhas para objetos
      return rows.slice(1).map((row: string[]) => ({
        data: row[0] || '',
        transacao: row[1] || '',
        categoria: row[2] || '',
        entrada: parseFloat(row[3]) || 0,
        saida: parseFloat(row[4]) || 0,
        mes: row[5] || ''
      }));
    } catch (error) {
      console.warn('Edge Function falhou, tentando implementação direta:', error);
      
      try {
        // Fallback: usar implementação direta
        const data = await GoogleSheetsDirectService.fetchMovimentacoes(accessToken, this.SPREADSHEET_ID);
        const rows = data.values || [];
        if (rows.length <= 1) return [];

        return rows.slice(1).map((row: string[]) => ({
          data: row[0] || '',
          transacao: row[1] || '',
          categoria: row[2] || '',
          entrada: parseFloat(row[3]) || 0,
          saida: parseFloat(row[4]) || 0,
          mes: row[5] || ''
        }));
      } catch (directError) {
        console.error('Erro ao buscar movimentações (implementação direta):', directError);
        throw directError;
      }
    }
  }

  static async fetchContas(accessToken: string): Promise<ContaData[]> {
    this.validateConfig();
    
    try {
      // Tentar usar a Edge Function primeiro
      const { data, error } = await supabase.functions.invoke('google-sheets', {
        body: {
          access_token: accessToken,
          spreadsheet_id: this.SPREADSHEET_ID,
          range: 'Contas!A:D'
        }
      });

      if (error) throw error;

      const rows = data.values || [];
      if (rows.length <= 1) return []; // Sem dados ou apenas cabeçalho

      // Converter dados das linhas para objetos
      return rows.slice(1).map((row: string[]) => ({
        dataFatura: row[0] || '',
        numeroFatura: row[1] || '',
        total: parseFloat(row[2]) || 0,
        destinatario: row[3] || ''
      }));
    } catch (error) {
      console.warn('Edge Function falhou, tentando implementação direta:', error);
      
      try {
        // Fallback: usar implementação direta
        const data = await GoogleSheetsDirectService.fetchContas(accessToken, this.SPREADSHEET_ID);
        const rows = data.values || [];
        if (rows.length <= 1) return [];

        return rows.slice(1).map((row: string[]) => ({
          dataFatura: row[0] || '',
          numeroFatura: row[1] || '',
          total: parseFloat(row[2]) || 0,
          destinatario: row[3] || ''
        }));
      } catch (directError) {
        console.error('Erro ao buscar contas (implementação direta):', directError);
        throw directError;
      }
    }
  }
}