declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

import { InputValidator, SecureLogger, DataSanitizer } from '@/utils/security-validator';

// Configuração do Google OAuth usando variáveis de ambiente
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';

// Validação das configurações necessárias (mais tolerante em desenvolvimento)
const validateConfig = () => {
  try {
    InputValidator.validateEnvironmentVariables({
      VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      VITE_GOOGLE_SPREADSHEET_ID: import.meta.env.VITE_GOOGLE_SPREADSHEET_ID,
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
    });
    return true;
  } catch (error) {
    if (import.meta.env.DEV) {
      // Em desenvolvimento, apenas avisar sem bloquear
      console.warn('⚠️ Configuração incompleta. Para usar a integração com Google Sheets, configure as variáveis de ambiente no arquivo .env.local');
      console.warn('📖 Consulte o arquivo GOOGLE_SETUP.md para instruções detalhadas');
      return false;
    } else {
      // Em produção, logar o erro
      SecureLogger.logError('Configuração inválida detectada', error as Error);
      return false;
    }
  }
};

// Verificar configuração
const isConfigValid = validateConfig();

export class GoogleAuthService {
  private tokenClient: any;
  private accessToken: string | null = null;
  private isScriptLoaded: boolean = false;

  constructor() {
    // Script será carregado quando necessário
  }

  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Se já carregou, resolve imediatamente
      if (this.isScriptLoaded && window.google) {
        resolve();
        return;
      }

      // Se o script já existe no DOM, aguarda carregar
      if (window.google) {
        this.isScriptLoaded = true;
        resolve();
        return;
      }

      // Verifica se já existe um script sendo carregado
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          this.isScriptLoaded = true;
          resolve();
        });
        existingScript.addEventListener('error', () => {
          reject(new Error('Falha ao carregar script do Google'));
        });
        return;
      }

      // Cria novo script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.isScriptLoaded = true;
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Falha ao carregar script do Google'));
      };
      document.head.appendChild(script);
    });
  }

  async initializeAuth(): Promise<void> {
    // Verificar se a configuração é válida
    if (!isConfigValid) {
      throw new Error('Configuração do Google Auth incompleta. Verifique as variáveis de ambiente no arquivo .env.local');
    }

    // Validar se o Client ID está configurado
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "your-google-client-id.apps.googleusercontent.com") {
      throw new Error('Google Client ID não configurado. Configure VITE_GOOGLE_CLIENT_ID no arquivo .env.local');
    }

    try {
      await this.loadGoogleScript();
      
      // Aguardar um pouco para garantir que o Google API está disponível
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!window.google?.accounts?.oauth2) {
        throw new Error('Google API não carregada corretamente');
      }
      
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPES,
        callback: (response) => {
          this.accessToken = response.access_token;
        },
      });
    } catch (error) {
      console.error('Erro ao inicializar Google Auth:', error);
      throw new Error(`Falha na inicialização do Google Auth: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  requestAccess(): Promise<string> {
    return new Promise((resolve, reject) => {
      // Verificar se a configuração é válida
      if (!isConfigValid) {
        const error = new Error('Configuração do Google Auth incompleta. Verifique as variáveis de ambiente.');
        SecureLogger.logError('Tentativa de acesso com configuração inválida', error);
        reject(error);
        return;
      }

      if (!this.tokenClient) {
        const error = new Error('Google Auth não inicializado. Chame initializeAuth() primeiro.');
        SecureLogger.logError('Tentativa de acesso sem inicialização', error);
        reject(error);
        return;
      }

      // Timeout para evitar travamento
      const timeout = setTimeout(() => {
        const error = new Error('Timeout na autenticação Google. Tente novamente.');
        SecureLogger.logError('Timeout na autenticação Google', error);
        reject(error);
      }, 60000); // 60 segundos

      this.tokenClient.callback = (response: { access_token: string; error?: string }) => {
        clearTimeout(timeout);
        
        if (response.error) {
          const error = new Error(`Erro na autenticação Google: ${DataSanitizer.sanitizeString(response.error)}`);
          SecureLogger.logError('Erro na autenticação Google', error, { 
            errorType: response.error 
          });
          reject(error);
          return;
        }
        
        if (response.access_token) {
          // Validar formato do token antes de aceitar
          if (!InputValidator.validateAccessToken(response.access_token)) {
            const error = new Error('Token de acesso recebido tem formato inválido');
            SecureLogger.logError('Token inválido recebido', error);
            reject(error);
            return;
          }
          
          this.accessToken = response.access_token;
          SecureLogger.logInfo('Autenticação Google bem-sucedida');
          resolve(response.access_token);
        } else {
          const error = new Error('Token de acesso não recebido. Verifique as permissões.');
          SecureLogger.logError('Token não recebido', error);
          reject(error);
        }
      };

      try {
        SecureLogger.logInfo('Iniciando solicitação de token Google');
        this.tokenClient.requestAccessToken();
      } catch (error) {
        clearTimeout(timeout);
        const wrappedError = new Error(`Erro ao solicitar token: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        SecureLogger.logError('Erro ao solicitar token', wrappedError);
        reject(wrappedError);
      }
    });
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}

export const googleAuth = new GoogleAuthService();