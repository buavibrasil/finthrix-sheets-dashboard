import { supabase } from "@/integrations/supabase/client";
import { GoogleSheetsDirectService } from "./google-sheets-direct";
import { InputValidator, DataSanitizer, SecureLogger } from "@/utils/security-validator";

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
  private static readonly MAX_ROWS = 10000; // Limite de segurança para evitar DoS
  private static readonly ALLOWED_RANGES = [
    'Movimentações!A:F',
    'Contas!A:D',
    'Dashboard!A:Z'
  ]; // Lista de ranges permitidos

  // Validação da configuração
  private static validateConfig(): void {
    if (!InputValidator.validateSpreadsheetId(this.SPREADSHEET_ID)) {
      const error = new Error('Google Spreadsheet ID não configurado ou inválido. Configure VITE_GOOGLE_SPREADSHEET_ID no arquivo .env');
      SecureLogger.logError('Configuração inválida do Spreadsheet', error);
      throw error;
    }
  }

  // Validar range permitido
  private static validateRange(range: string): void {
    const sanitizedRange = DataSanitizer.sanitizeString(range);
    if (!this.ALLOWED_RANGES.includes(sanitizedRange)) {
      const error = new Error(`Range não permitido: ${sanitizedRange}`);
      SecureLogger.logError('Tentativa de acesso a range não autorizado', error, { range: sanitizedRange });
      throw error;
    }
  }

  // Sanitizar dados de movimentação
  private static sanitizeMovimentacaoData(row: string[]): MovimentacaoData {
    return {
      data: DataSanitizer.sanitizeString(row[0] || ''),
      transacao: DataSanitizer.sanitizeString(row[1] || ''),
      categoria: DataSanitizer.sanitizeString(row[2] || ''),
      entrada: DataSanitizer.sanitizeNumber(row[3]),
      saida: DataSanitizer.sanitizeNumber(row[4]),
      mes: DataSanitizer.sanitizeString(row[5] || '')
    };
  }

  // Sanitizar dados de conta
  private static sanitizeContaData(row: string[]): ContaData {
    return {
      dataFatura: DataSanitizer.sanitizeString(row[0] || ''),
      numeroFatura: DataSanitizer.sanitizeString(row[1] || ''),
      total: DataSanitizer.sanitizeNumber(row[2]),
      destinatario: DataSanitizer.sanitizeString(row[3] || '')
    };
  }
  
  static async fetchMovimentacoes(accessToken: string): Promise<MovimentacaoData[]> {
    this.validateConfig();
    
    // Validar token de acesso
    if (!InputValidator.validateAccessToken(accessToken)) {
      const error = new Error('Token de acesso inválido');
      SecureLogger.logError('Token inválido fornecido para fetchMovimentacoes', error);
      throw error;
    }

    const range = 'Movimentações!A:F';
    this.validateRange(range);
    
    try {
      SecureLogger.logInfo('Iniciando busca de movimentações');
      
      // Tentar usar a Edge Function primeiro
      const { data, error } = await supabase.functions.invoke('google-sheets', {
        body: {
          access_token: accessToken,
          spreadsheet_id: this.SPREADSHEET_ID,
          range: range
        }
      });

      if (error) {
        SecureLogger.logError('Erro na Edge Function', error);
        throw error;
      }

      const rows = data.values || [];
      
      // Validar tamanho da resposta
      if (rows.length > this.MAX_ROWS) {
        const error = new Error(`Muitos dados retornados: ${rows.length} linhas (máximo: ${this.MAX_ROWS})`);
        SecureLogger.logError('Limite de dados excedido', error);
        throw error;
      }

      if (rows.length <= 1) {
        SecureLogger.logInfo('Nenhum dado de movimentação encontrado');
        return []; // Sem dados ou apenas cabeçalho
      }

      // Converter dados das linhas para objetos com sanitização
      const movimentacoes = rows.slice(1)
        .filter((row: string[]) => row && row.length > 0) // Filtrar linhas vazias
        .map((row: string[]) => this.sanitizeMovimentacaoData(row))
        .filter(mov => mov.data && (mov.entrada > 0 || mov.saida > 0)); // Validar dados essenciais

      SecureLogger.logInfo(`${movimentacoes.length} movimentações processadas com sucesso`);
      return movimentacoes;
    } catch (error) {
      SecureLogger.logError('Edge Function falhou, tentando implementação direta', error as Error);
      
      try {
        // Fallback: usar implementação direta
        const data = await GoogleSheetsDirectService.fetchMovimentacoes(accessToken, this.SPREADSHEET_ID);
        const rows = data.values || [];
        
        // Validar tamanho da resposta no fallback também
        if (rows.length > this.MAX_ROWS) {
          const error = new Error(`Muitos dados retornados no fallback: ${rows.length} linhas (máximo: ${this.MAX_ROWS})`);
          SecureLogger.logError('Limite de dados excedido no fallback', error);
          throw error;
        }
        
        if (rows.length <= 1) {
          SecureLogger.logInfo('Nenhum dado encontrado no fallback');
          return [];
        }

        const movimentacoes = rows.slice(1)
          .filter((row: string[]) => row && row.length > 0)
          .map((row: string[]) => this.sanitizeMovimentacaoData(row))
          .filter(mov => mov.data && (mov.entrada > 0 || mov.saida > 0));

        SecureLogger.logInfo(`${movimentacoes.length} movimentações processadas via fallback`);
        return movimentacoes;
      } catch (directError) {
        SecureLogger.logError('Erro ao buscar movimentações (implementação direta)', directError as Error);
        throw directError;
      }
    }
  }

  static async fetchContas(accessToken: string): Promise<ContaData[]> {
    this.validateConfig();
    
    // Validar token de acesso
    if (!InputValidator.validateAccessToken(accessToken)) {
      const error = new Error('Token de acesso inválido');
      SecureLogger.logError('Token inválido fornecido para fetchContas', error);
      throw error;
    }

    const range = 'Contas!A:D';
    this.validateRange(range);
    
    try {
      SecureLogger.logInfo('Iniciando busca de contas');
      
      // Tentar usar a Edge Function primeiro
      const { data, error } = await supabase.functions.invoke('google-sheets', {
        body: {
          access_token: accessToken,
          spreadsheet_id: this.SPREADSHEET_ID,
          range: range
        }
      });

      if (error) {
        SecureLogger.logError('Erro na Edge Function para contas', error);
        throw error;
      }

      const rows = data.values || [];
      
      // Validar tamanho da resposta
      if (rows.length > this.MAX_ROWS) {
        const error = new Error(`Muitos dados retornados: ${rows.length} linhas (máximo: ${this.MAX_ROWS})`);
        SecureLogger.logError('Limite de dados excedido para contas', error);
        throw error;
      }

      if (rows.length <= 1) {
        SecureLogger.logInfo('Nenhum dado de conta encontrado');
        return []; // Sem dados ou apenas cabeçalho
      }

      // Converter dados das linhas para objetos com sanitização
      const contas = rows.slice(1)
        .filter((row: string[]) => row && row.length > 0) // Filtrar linhas vazias
        .map((row: string[]) => this.sanitizeContaData(row))
        .filter(conta => conta.numeroFatura && conta.total > 0); // Validar dados essenciais

      SecureLogger.logInfo(`${contas.length} contas processadas com sucesso`);
      return contas;
    } catch (error) {
      SecureLogger.logError('Edge Function falhou para contas, tentando implementação direta', error as Error);
      
      try {
        // Fallback: usar implementação direta
        const data = await GoogleSheetsDirectService.fetchContas(accessToken, this.SPREADSHEET_ID);
        const rows = data.values || [];
        
        // Validar tamanho da resposta no fallback também
        if (rows.length > this.MAX_ROWS) {
          const error = new Error(`Muitos dados retornados no fallback: ${rows.length} linhas (máximo: ${this.MAX_ROWS})`);
          SecureLogger.logError('Limite de dados excedido no fallback para contas', error);
          throw error;
        }
        
        if (rows.length <= 1) {
          SecureLogger.logInfo('Nenhum dado de conta encontrado no fallback');
          return [];
        }

        const contas = rows.slice(1)
          .filter((row: string[]) => row && row.length > 0)
          .map((row: string[]) => this.sanitizeContaData(row))
          .filter(conta => conta.numeroFatura && conta.total > 0);

        SecureLogger.logInfo(`${contas.length} contas processadas via fallback`);
        return contas;
      } catch (directError) {
        SecureLogger.logError('Erro ao buscar contas (implementação direta)', directError as Error);
        throw directError;
      }
    }
  }
}