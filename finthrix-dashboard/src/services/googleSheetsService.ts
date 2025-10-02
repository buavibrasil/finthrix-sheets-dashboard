import {
  GoogleSheetsConfig,
  SpreadsheetInfo,
  SheetInfo,
  RangeData,
  GoogleSheetsAuthState,
  GoogleSheetsResponse,
  GoogleSheetsError
} from '../types/googleSheets';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

class GoogleSheetsService {
  private config: GoogleSheetsConfig;
  private gapi: any = null;
  private tokenClient: any = null;
  private authState: GoogleSheetsAuthState = {
    isSignedIn: false,
    isInitialized: false
  };

  constructor() {
    this.config = {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
      discoveryDoc: import.meta.env.VITE_GOOGLE_DISCOVERY_DOC || 'https://sheets.googleapis.com/$discovery/rest?version=v4',
      scopes: import.meta.env.VITE_GOOGLE_SCOPES || 'https://www.googleapis.com/auth/spreadsheets'
    };
    

  }

  /**
   * Inicializa a API do Google Sheets
   */
  async initialize(): Promise<GoogleSheetsResponse<boolean>> {
    try {
      if (this.authState.isInitialized) {
        return { success: true, data: true };
      }

      // Verifica se as credenciais estão configuradas
      if (!this.config.clientId || !this.config.apiKey) {
        console.error('[GoogleSheetsService] Credenciais não configuradas:', {
          clientId: !!this.config.clientId,
          apiKey: !!this.config.apiKey
        });
        throw new Error('Credenciais do Google não configuradas');
      }

      // Carrega a API do Google
      await this.loadGoogleAPI();

      if (!window.gapi) {
        await this.loadGoogleAPI();
      }

      this.gapi = window.gapi;

      // Inicializa a API
      await new Promise<void>((resolve, reject) => {
        this.gapi.load('client:auth2', async () => {
          try {
            await this.gapi.client.init({
              apiKey: this.config.apiKey,
              discoveryDocs: [this.config.discoveryDoc]
            });

            if (window.google?.accounts?.oauth2) {
              this.tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: this.config.clientId,
                scope: this.config.scopes,
                callback: (response: any) => {
                  if (response.access_token) {
                    this.authState.isSignedIn = true;
                  }
                }
              });
            }

            this.authState.isInitialized = true;
            resolve();
          } catch (error) {
            console.error('[GoogleSheetsService] Erro durante inicialização:', error);
            reject(error);
          }
        });
      });

      return { success: true, data: true };
    } catch (error) {
      const googleError: GoogleSheetsError = {
        code: 'INITIALIZATION_ERROR',
        message: 'Erro ao inicializar Google Sheets API',
        details: error
      };
      return { success: false, error: googleError };
    }
  }

  /**
   * Carrega a API do Google dinamicamente
   */
  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        const authScript = document.createElement('script');
        authScript.src = 'https://accounts.google.com/gsi/client';
        authScript.onload = () => {
          resolve();
        };
        authScript.onerror = () => reject(new Error('Falha ao carregar Google Auth script'));
        document.head.appendChild(authScript);
      };
      script.onerror = () => reject(new Error('Falha ao carregar Google API script'));
      document.head.appendChild(script);
    });
  }

  /**
   * Autentica o usuário com Google
   */
  async signIn(): Promise<GoogleSheetsResponse<boolean>> {
    try {
      if (!this.authState.isInitialized) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          return initResult;
        }
      }

      if (!this.tokenClient) {
        return {
          success: false,
          error: {
            code: 'AUTH_CLIENT_ERROR',
            message: 'Cliente de autenticação não inicializado'
          }
        };
      }

      // Solicita autorização
      this.tokenClient.requestAccessToken();

      return { success: true, data: true };
    } catch (error) {
      const googleError: GoogleSheetsError = {
        code: 'SIGN_IN_ERROR',
        message: 'Erro ao fazer login no Google',
        details: error
      };
      return { success: false, error: googleError };
    }
  }

  /**
   * Desconecta o usuário
   */
  async signOut(): Promise<GoogleSheetsResponse<boolean>> {
    try {
      if (this.gapi?.client?.getToken()) {
        window.google?.accounts?.oauth2?.revoke(this.gapi.client.getToken().access_token);
        this.gapi.client.setToken(null);
      }

      this.authState.isSignedIn = false;
      this.authState.user = undefined;

      return { success: true, data: true };
    } catch (error) {
      const googleError: GoogleSheetsError = {
        code: 'SIGN_OUT_ERROR',
        message: 'Erro ao fazer logout do Google',
        details: error
      };
      return { success: false, error: googleError };
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isSignedIn(): boolean {
    return this.authState.isSignedIn && !!this.gapi?.client?.getToken();
  }

  /**
   * Obtém informações do usuário autenticado
   */
  getAuthState(): GoogleSheetsAuthState {
    return this.authState;
  }

  /**
   * Lista todas as planilhas do usuário
   */
  async listSpreadsheets(): Promise<GoogleSheetsResponse<SpreadsheetInfo[]>> {
    try {
      if (!this.isSignedIn()) {
        return {
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'Usuário não autenticado'
          }
        };
      }

      // Nota: A API do Sheets não tem um endpoint direto para listar todas as planilhas
      // Seria necessário usar a Drive API para isso. Por enquanto, retornamos uma lista vazia
      // e o usuário precisará fornecer o ID da planilha manualmente
      
      return { success: true, data: [] };
    } catch (error) {
      const googleError: GoogleSheetsError = {
        code: 'LIST_SPREADSHEETS_ERROR',
        message: 'Erro ao listar planilhas',
        details: error
      };
      return { success: false, error: googleError };
    }
  }

  /**
   * Obtém informações de uma planilha específica
   */
  async getSpreadsheetInfo(spreadsheetId: string): Promise<GoogleSheetsResponse<SpreadsheetInfo>> {
    try {
      if (!this.isSignedIn()) {
        return {
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'Usuário não autenticado'
          }
        };
      }

      const response = await this.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId
      });

      const spreadsheet = response.result;
      const sheets: SheetInfo[] = spreadsheet.sheets?.map((sheet: any) => ({
        id: sheet.properties.sheetId,
        title: sheet.properties.title,
        index: sheet.properties.index,
        rowCount: sheet.properties.gridProperties?.rowCount || 0,
        columnCount: sheet.properties.gridProperties?.columnCount || 0
      })) || [];

      const spreadsheetInfo: SpreadsheetInfo = {
        id: spreadsheet.spreadsheetId,
        name: spreadsheet.properties.title,
        url: spreadsheet.spreadsheetUrl,
        sheets: sheets
      };

      return { success: true, data: spreadsheetInfo };
    } catch (error) {
      const googleError: GoogleSheetsError = {
        code: 'GET_SPREADSHEET_ERROR',
        message: 'Erro ao obter informações da planilha',
        details: error
      };
      return { success: false, error: googleError };
    }
  }

  /**
   * Lê dados de um intervalo específico
   */
  async readRange(spreadsheetId: string, range: string): Promise<GoogleSheetsResponse<RangeData>> {
    try {
      if (!this.isSignedIn()) {
        return {
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'Usuário não autenticado'
          }
        };
      }

      const response = await this.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range
      });

      const rangeData: RangeData = {
        range: response.result.range,
        values: response.result.values || [],
        majorDimension: response.result.majorDimension
      };

      return { success: true, data: rangeData };
    } catch (error) {
      const googleError: GoogleSheetsError = {
        code: 'READ_RANGE_ERROR',
        message: 'Erro ao ler dados da planilha',
        details: error
      };
      return { success: false, error: googleError };
    }
  }

  /**
   * Escreve dados em um intervalo específico
   */
  async writeRange(
    spreadsheetId: string, 
    range: string, 
    values: (string | number | boolean)[][]
  ): Promise<GoogleSheetsResponse<any>> {
    try {
      if (!this.isSignedIn()) {
        return {
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'Usuário não autenticado'
          }
        };
      }

      const response = await this.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: values
        }
      });

      return { success: true, data: response.result };
    } catch (error) {
      const googleError: GoogleSheetsError = {
        code: 'WRITE_RANGE_ERROR',
        message: 'Erro ao escrever dados na planilha',
        details: error
      };
      return { success: false, error: googleError };
    }
  }

  /**
   * Adiciona dados ao final de uma planilha
   */
  async appendData(
    spreadsheetId: string, 
    range: string, 
    values: (string | number | boolean)[][]
  ): Promise<GoogleSheetsResponse<any>> {
    try {
      if (!this.isSignedIn()) {
        return {
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'Usuário não autenticado'
          }
        };
      }

      const response = await this.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: values
        }
      });

      return { success: true, data: response.result };
    } catch (error) {
      const googleError: GoogleSheetsError = {
        code: 'APPEND_DATA_ERROR',
        message: 'Erro ao adicionar dados na planilha',
        details: error
      };
      return { success: false, error: googleError };
    }
  }

  /**
   * Manipula o sucesso da autenticação
   */
  private handleAuthSuccess(): void {
    this.authState.isSignedIn = true;
    
    // Aqui você pode obter informações do usuário se necessário
    // Por exemplo, usando a People API ou Profile API
  }
}

// Exporta uma instância singleton
export const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;