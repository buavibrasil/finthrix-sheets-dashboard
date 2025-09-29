/**
 * Implementação direta do Google Sheets API
 * Solução alternativa para quando a Edge Function não está funcionando
 */

export interface GoogleSheetsResponse {
  range: string;
  majorDimension: string;
  values: string[][];
}

export class GoogleSheetsDirectService {
  /**
   * Busca dados diretamente da API do Google Sheets
   */
  static async fetchData(
    accessToken: string, 
    spreadsheetId: string, 
    range: string
  ): Promise<GoogleSheetsResponse> {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Sheets API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar dados do Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Busca movimentações diretamente
   */
  static async fetchMovimentacoes(accessToken: string, spreadsheetId: string) {
    return this.fetchData(accessToken, spreadsheetId, 'Movimentações!A:H');
  }

  /**
   * Busca contas diretamente
   */
  static async fetchContas(accessToken: string, spreadsheetId: string) {
    return this.fetchData(accessToken, spreadsheetId, 'Contas!A:D');
  }

  /**
   * Testa a conectividade com a API
   */
  static async testConnection(accessToken: string, spreadsheetId: string): Promise<boolean> {
    try {
      await this.fetchData(accessToken, spreadsheetId, 'A1:A1');
      return true;
    } catch (error) {
      console.error('Teste de conexão falhou:', error);
      return false;
    }
  }
}