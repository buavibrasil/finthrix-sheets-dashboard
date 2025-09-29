import { supabase } from "@/integrations/supabase/client";

export interface DiagnosticResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export class GoogleSheetsDiagnostic {
  private results: DiagnosticResult[] = [];

  private addResult(step: string, status: 'success' | 'error' | 'warning', message: string, details?: any) {
    this.results.push({ step, status, message, details });
    console.log(`[${status.toUpperCase()}] ${step}: ${message}`, details || '');
  }

  async runDiagnostic(): Promise<DiagnosticResult[]> {
    this.results = [];
    
    // 1. Verificar variáveis de ambiente
    this.checkEnvironmentVariables();
    
    // 2. Verificar carregamento do script Google
    await this.checkGoogleScriptLoading();
    
    // 3. Verificar configuração do Supabase
    await this.checkSupabaseConfiguration();
    
    // 4. Testar Edge Function
    await this.testEdgeFunction();
    
    return this.results;
  }

  private checkEnvironmentVariables() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const spreadsheetId = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!clientId || clientId.includes('your-')) {
      this.addResult('Environment Variables', 'error', 'VITE_GOOGLE_CLIENT_ID não configurado ou usando valor padrão', { clientId });
    } else {
      this.addResult('Environment Variables', 'success', 'VITE_GOOGLE_CLIENT_ID configurado corretamente');
    }

    if (!spreadsheetId || spreadsheetId.includes('your-')) {
      this.addResult('Environment Variables', 'error', 'VITE_GOOGLE_SPREADSHEET_ID não configurado ou usando valor padrão', { spreadsheetId });
    } else {
      this.addResult('Environment Variables', 'success', 'VITE_GOOGLE_SPREADSHEET_ID configurado corretamente');
    }

    if (!supabaseUrl || !supabaseKey) {
      this.addResult('Environment Variables', 'error', 'Variáveis do Supabase não configuradas', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
    } else {
      this.addResult('Environment Variables', 'success', 'Variáveis do Supabase configuradas corretamente');
    }
  }

  private async checkGoogleScriptLoading(): Promise<void> {
    try {
      // Verificar se o script já está carregado
      if (window.google?.accounts?.oauth2) {
        this.addResult('Google Script', 'success', 'Script do Google já carregado');
        return;
      }

      // Tentar carregar o script
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          setTimeout(() => {
            if (window.google?.accounts?.oauth2) {
              this.addResult('Google Script', 'success', 'Script do Google carregado com sucesso');
              resolve();
            } else {
              this.addResult('Google Script', 'error', 'Script carregado mas API não disponível');
              reject(new Error('API não disponível'));
            }
          }, 500);
        };
        script.onerror = () => {
          this.addResult('Google Script', 'error', 'Falha ao carregar script do Google');
          reject(new Error('Falha ao carregar script'));
        };
        document.head.appendChild(script);
      });
    } catch (error) {
      this.addResult('Google Script', 'error', 'Erro ao carregar script do Google', error);
    }
  }

  private async checkSupabaseConfiguration(): Promise<void> {
    try {
      // Testar conexão básica com Supabase
      const { data, error } = await supabase.from('_test_connection').select('*').limit(1);
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = tabela não encontrada (esperado)
        this.addResult('Supabase Connection', 'error', 'Erro na conexão com Supabase', error);
      } else {
        this.addResult('Supabase Connection', 'success', 'Conexão com Supabase funcionando');
      }
    } catch (error) {
      this.addResult('Supabase Connection', 'error', 'Erro ao testar conexão com Supabase', error);
    }
  }

  private async testEdgeFunction(): Promise<void> {
    try {
      // Testar se a Edge Function responde (sem token válido)
      const { data, error } = await supabase.functions.invoke('google-sheets', {
        body: {
          access_token: 'test_token',
          spreadsheet_id: 'test_id',
          range: 'test_range'
        }
      });

      if (error) {
        // Se o erro for relacionado à autenticação, a função está funcionando
        if (error.message?.includes('Google Sheets API error') || error.message?.includes('401')) {
          this.addResult('Edge Function', 'success', 'Edge Function google-sheets está respondendo (erro de autenticação esperado)');
        } else {
          this.addResult('Edge Function', 'error', 'Edge Function google-sheets com erro', error);
        }
      } else {
        this.addResult('Edge Function', 'warning', 'Edge Function respondeu sem erro (inesperado)', data);
      }
    } catch (error) {
      this.addResult('Edge Function', 'error', 'Erro ao testar Edge Function', error);
    }
  }

  getResults(): DiagnosticResult[] {
    return this.results;
  }

  getSummary(): { total: number; success: number; error: number; warning: number } {
    const summary = {
      total: this.results.length,
      success: this.results.filter(r => r.status === 'success').length,
      error: this.results.filter(r => r.status === 'error').length,
      warning: this.results.filter(r => r.status === 'warning').length
    };
    return summary;
  }
}

export const googleSheetsDiagnostic = new GoogleSheetsDiagnostic();