import { supabase } from "@/integrations/supabase/client";
import { PerformanceMonitor, SimpleCache } from "@/utils/performance";

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

export class GoogleSheetsEnhancedService {
  private static readonly SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID;
  private static readonly CACHE_TTL = 300000; // 5 minutos
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 segundo

  // Validação da configuração
  private static validateConfig(): void {
    if (!this.SPREADSHEET_ID || this.SPREADSHEET_ID === "your-google-spreadsheet-id") {
      throw new Error('Google Spreadsheet ID não configurado. Configure VITE_GOOGLE_SPREADSHEET_ID no arquivo .env');
    }
  }

  // Retry logic com backoff exponencial
  private static async retryOperation<T>(
    operation: () => Promise<T>,
    retries: number = this.MAX_RETRIES
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries <= 0) throw error;
      
      const delay = this.RETRY_DELAY * (this.MAX_RETRIES - retries + 1);
      console.warn(`🔄 Tentativa falhou, tentando novamente em ${delay}ms. Tentativas restantes: ${retries - 1}`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryOperation(operation, retries - 1);
    }
  }

  // Fetch com cache e retry
  private static async fetchWithCacheAndRetry<T>(
    cacheKey: string,
    operation: () => Promise<T>
  ): Promise<T> {
    // Verificar cache primeiro
    const cached = SimpleCache.get<T>(cacheKey);
    if (cached) {
      console.log(`📦 Cache hit para: ${cacheKey}`);
      return cached;
    }

    // Executar operação com retry
    PerformanceMonitor.startTimer(`fetch-${cacheKey}`);
    
    try {
      const result = await this.retryOperation(operation);
      
      // Salvar no cache
      SimpleCache.set(cacheKey, result, this.CACHE_TTL);
      
      PerformanceMonitor.endTimer(`fetch-${cacheKey}`);
      return result;
    } catch (error) {
      PerformanceMonitor.endTimer(`fetch-${cacheKey}`);
      PerformanceMonitor.logError(`fetch-${cacheKey}`, error as Error);
      throw error;
    }
  }
  
  static async fetchMovimentacoes(accessToken: string, useCache: boolean = true): Promise<MovimentacaoData[]> {
    this.validateConfig();
    
    const cacheKey = `movimentacoes-${this.SPREADSHEET_ID}`;
    
    if (!useCache) {
      SimpleCache.clear();
    }

    return this.fetchWithCacheAndRetry(cacheKey, async () => {
      PerformanceMonitor.logAPICall('google-sheets/movimentacoes', 'POST');
      
      const { data, error } = await supabase.functions.invoke('google-sheets', {
        body: {
          access_token: accessToken,
          spreadsheet_id: this.SPREADSHEET_ID,
          range: 'Movimentações!A:F'
        }
      });

      if (error) {
        PerformanceMonitor.logError('fetchMovimentacoes', new Error(error.message));
        throw error;
      }

      const rows = data.values || [];
      if (rows.length <= 1) return []; // Sem dados ou apenas cabeçalho

      // Converter dados das linhas para objetos
      const result = rows.slice(1).map((row: string[]) => ({
        data: row[0] || '',
        transacao: row[1] || '',
        categoria: row[2] || '',
        entrada: parseFloat(row[3]) || 0,
        saida: parseFloat(row[4]) || 0,
        mes: row[5] || ''
      }));

      console.log(`✅ Movimentações carregadas: ${result.length} registros`);
      return result;
    });
  }

  static async fetchContas(accessToken: string, useCache: boolean = true): Promise<ContaData[]> {
    this.validateConfig();
    
    const cacheKey = `contas-${this.SPREADSHEET_ID}`;
    
    if (!useCache) {
      SimpleCache.clear();
    }

    return this.fetchWithCacheAndRetry(cacheKey, async () => {
      PerformanceMonitor.logAPICall('google-sheets/contas', 'POST');
      
      const { data, error } = await supabase.functions.invoke('google-sheets', {
        body: {
          access_token: accessToken,
          spreadsheet_id: this.SPREADSHEET_ID,
          range: 'Contas!A:D'
        }
      });

      if (error) {
        PerformanceMonitor.logError('fetchContas', new Error(error.message));
        throw error;
      }

      const rows = data.values || [];
      if (rows.length <= 1) return []; // Sem dados ou apenas cabeçalho

      // Converter dados das linhas para objetos
      const result = rows.slice(1).map((row: string[]) => ({
        dataFatura: row[0] || '',
        numeroFatura: row[1] || '',
        total: parseFloat(row[2]) || 0,
        destinatario: row[3] || ''
      }));

      console.log(`✅ Contas carregadas: ${result.length} registros`);
      return result;
    });
  }

  // Método para limpar cache manualmente
  static clearCache(): void {
    SimpleCache.clear();
    console.log('🗑️ Cache limpo');
  }

  // Método para verificar status do cache
  static getCacheStatus(): { size: number; keys: string[] } {
    return {
      size: SimpleCache.size(),
      keys: ['movimentacoes', 'contas'].map(key => `${key}-${this.SPREADSHEET_ID}`)
    };
  }

  // Método para pré-carregar dados
  static async preloadData(accessToken: string): Promise<void> {
    console.log('🚀 Pré-carregando dados...');
    
    try {
      await Promise.all([
        this.fetchMovimentacoes(accessToken),
        this.fetchContas(accessToken)
      ]);
      
      console.log('✅ Dados pré-carregados com sucesso');
    } catch (error) {
      console.error('❌ Erro no pré-carregamento:', error);
      throw error;
    }
  }
}