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

// Configuração do Google OAuth usando variáveis de ambiente
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';

// Validação das configurações necessárias
if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "your-google-client-id.apps.googleusercontent.com") {
  console.warn('⚠️ Google Client ID não configurado. Configure VITE_GOOGLE_CLIENT_ID no arquivo .env');
}

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
    // Validar se o Client ID está configurado
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "your-google-client-id.apps.googleusercontent.com") {
      throw new Error('Google Client ID não configurado. Configure VITE_GOOGLE_CLIENT_ID no arquivo .env');
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
      if (!this.tokenClient) {
        reject(new Error('Google Auth não inicializado. Chame initializeAuth() primeiro.'));
        return;
      }

      // Timeout para evitar travamento
      const timeout = setTimeout(() => {
        reject(new Error('Timeout na autenticação Google. Tente novamente.'));
      }, 60000); // 60 segundos

      this.tokenClient.callback = (response: { access_token: string; error?: string }) => {
        clearTimeout(timeout);
        
        if (response.error) {
          reject(new Error(`Erro na autenticação Google: ${response.error}`));
          return;
        }
        
        if (response.access_token) {
          this.accessToken = response.access_token;
          resolve(response.access_token);
        } else {
          reject(new Error('Token de acesso não recebido. Verifique as permissões.'));
        }
      };

      try {
        this.tokenClient.requestAccessToken();
      } catch (error) {
        clearTimeout(timeout);
        reject(new Error(`Erro ao solicitar token: ${error instanceof Error ? error.message : 'Erro desconhecido'}`));
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