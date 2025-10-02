import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { googleSheetsService } from './googleSheetsService';

// Mock das APIs do Google
const mockGapi = {
  load: vi.fn(),
  client: {
    init: vi.fn(),
    sheets: {
      spreadsheets: {
        get: vi.fn(),
        values: {
          get: vi.fn(),
          update: vi.fn(),
          append: vi.fn()
        }
      }
    },
    getToken: vi.fn(),
    setToken: vi.fn()
  }
};

const mockGoogle = {
  accounts: {
    oauth2: {
      initTokenClient: vi.fn(),
      revoke: vi.fn()
    }
  }
};

// Mock do window.gapi e window.google
Object.defineProperty(window, 'gapi', {
  value: mockGapi,
  writable: true
});

Object.defineProperty(window, 'google', {
  value: mockGoogle,
  writable: true
});

describe('GoogleSheetsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset do estado do serviço
    (googleSheetsService as any).authState = {
      isSignedIn: false,
      isInitialized: false
    };
    (googleSheetsService as any).gapi = null;
    (googleSheetsService as any).tokenClient = null;
  });

  describe('initialize', () => {
    it('deve inicializar com sucesso quando as APIs estão disponíveis', async () => {
      // Arrange
      mockGapi.load.mockImplementation((apis: string, callback: () => void) => {
        callback();
      });
      mockGapi.client.init.mockResolvedValue(undefined);
      mockGoogle.accounts.oauth2.initTokenClient.mockReturnValue({});

      // Act
      const result = await googleSheetsService.initialize();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(mockGapi.load).toHaveBeenCalledWith('client:auth2', expect.any(Function));
      expect(mockGapi.client.init).toHaveBeenCalled();
    });

    it('deve retornar erro quando a inicialização falha', async () => {
      // Arrange
      const error = new Error('Falha na inicialização');
      mockGapi.load.mockImplementation((apis: string, callback: () => void) => {
        callback();
      });
      mockGapi.client.init.mockRejectedValue(error);

      // Act
      const result = await googleSheetsService.initialize();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INITIALIZATION_ERROR');
      expect(result.error?.message).toBe('Erro ao inicializar Google Sheets API');
    });

    it('deve retornar sucesso se já estiver inicializado', async () => {
      // Arrange
      (googleSheetsService as any).authState.isInitialized = true;

      // Act
      const result = await googleSheetsService.initialize();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(mockGapi.load).not.toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    beforeEach(() => {
      (googleSheetsService as any).authState.isInitialized = true;
      (googleSheetsService as any).tokenClient = {
        requestAccessToken: vi.fn()
      };
    });

    it('deve solicitar acesso com sucesso', async () => {
      // Act
      const result = await googleSheetsService.signIn();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect((googleSheetsService as any).tokenClient.requestAccessToken).toHaveBeenCalled();
    });

    it('deve retornar erro se o cliente de autenticação não estiver inicializado', async () => {
      // Arrange
      (googleSheetsService as any).tokenClient = null;

      // Act
      const result = await googleSheetsService.signIn();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('AUTH_CLIENT_ERROR');
    });

    it('deve inicializar automaticamente se não estiver inicializado', async () => {
      // Arrange
      (googleSheetsService as any).authState.isInitialized = false;
      mockGapi.load.mockImplementation((apis: string, callback: () => void) => {
        callback();
      });
      mockGapi.client.init.mockResolvedValue(undefined);
      mockGoogle.accounts.oauth2.initTokenClient.mockReturnValue({
        requestAccessToken: vi.fn()
      });

      // Act
      const result = await googleSheetsService.signIn();

      // Assert
      expect(result.success).toBe(true);
      expect(mockGapi.client.init).toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    beforeEach(() => {
      (googleSheetsService as any).gapi = mockGapi;
      (googleSheetsService as any).authState.isSignedIn = true;
    });

    it('deve fazer logout com sucesso', async () => {
      // Arrange
      mockGapi.client.getToken.mockReturnValue({ access_token: 'token123' });

      // Act
      const result = await googleSheetsService.signOut();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(mockGoogle.accounts.oauth2.revoke).toHaveBeenCalledWith('token123');
      expect(mockGapi.client.setToken).toHaveBeenCalledWith(null);
    });

    it('deve lidar com erro durante logout', async () => {
      // Arrange
      const error = new Error('Erro no logout');
      mockGapi.client.getToken.mockImplementation(() => {
        throw error;
      });

      // Act
      const result = await googleSheetsService.signOut();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SIGN_OUT_ERROR');
    });
  });

  describe('getSpreadsheetInfo', () => {
    beforeEach(() => {
      (googleSheetsService as any).gapi = mockGapi;
      (googleSheetsService as any).authState.isSignedIn = true;
      mockGapi.client.getToken.mockReturnValue({ access_token: 'token123' });
    });

    it('deve obter informações da planilha com sucesso', async () => {
      // Arrange
      const mockSpreadsheet = {
        result: {
          spreadsheetId: 'sheet123',
          properties: { title: 'Minha Planilha' },
          spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/sheet123',
          sheets: [
            {
              properties: {
                sheetId: 0,
                title: 'Aba1',
                index: 0,
                gridProperties: { rowCount: 100, columnCount: 26 }
              }
            }
          ]
        }
      };
      mockGapi.client.sheets.spreadsheets.get.mockResolvedValue(mockSpreadsheet);

      // Act
      const result = await googleSheetsService.getSpreadsheetInfo('sheet123');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('sheet123');
      expect(result.data?.name).toBe('Minha Planilha');
      expect(result.data?.sheets).toHaveLength(1);
      expect(result.data?.sheets[0].title).toBe('Aba1');
    });

    it('deve retornar erro se não estiver autenticado', async () => {
      // Arrange
      (googleSheetsService as any).authState.isSignedIn = false;

      // Act
      const result = await googleSheetsService.getSpreadsheetInfo('sheet123');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_AUTHENTICATED');
    });
  });

  describe('readRange', () => {
    beforeEach(() => {
      (googleSheetsService as any).gapi = mockGapi;
      (googleSheetsService as any).authState.isSignedIn = true;
      mockGapi.client.getToken.mockReturnValue({ access_token: 'token123' });
    });

    it('deve ler dados do intervalo com sucesso', async () => {
      // Arrange
      const mockResponse = {
        result: {
          range: 'Aba1!A1:C3',
          values: [
            ['Nome', 'Idade', 'Cidade'],
            ['João', '30', 'São Paulo'],
            ['Maria', '25', 'Rio de Janeiro']
          ],
          majorDimension: 'ROWS'
        }
      };
      mockGapi.client.sheets.spreadsheets.values.get.mockResolvedValue(mockResponse);

      // Act
      const result = await googleSheetsService.readRange('sheet123', 'Aba1!A1:C3');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.values).toHaveLength(3);
      expect(result.data?.values[0]).toEqual(['Nome', 'Idade', 'Cidade']);
      expect(result.data?.range).toBe('Aba1!A1:C3');
    });

    it('deve retornar erro se não estiver autenticado', async () => {
      // Arrange
      (googleSheetsService as any).authState.isSignedIn = false;

      // Act
      const result = await googleSheetsService.readRange('sheet123', 'A1:C3');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_AUTHENTICATED');
    });
  });

  describe('writeRange', () => {
    beforeEach(() => {
      (googleSheetsService as any).gapi = mockGapi;
      (googleSheetsService as any).authState.isSignedIn = true;
      mockGapi.client.getToken.mockReturnValue({ access_token: 'token123' });
    });

    it('deve escrever dados no intervalo com sucesso', async () => {
      // Arrange
      const mockResponse = {
        result: {
          updatedCells: 6,
          updatedColumns: 3,
          updatedRows: 2
        }
      };
      mockGapi.client.sheets.spreadsheets.values.update.mockResolvedValue(mockResponse);

      const values = [
        ['João', '30', 'São Paulo'],
        ['Maria', '25', 'Rio de Janeiro']
      ];

      // Act
      const result = await googleSheetsService.writeRange('sheet123', 'A1:C2', values);

      // Assert
      expect(result.success).toBe(true);
      expect(mockGapi.client.sheets.spreadsheets.values.update).toHaveBeenCalledWith({
        spreadsheetId: 'sheet123',
        range: 'A1:C2',
        valueInputOption: 'USER_ENTERED',
        resource: { values }
      });
    });
  });

  describe('appendData', () => {
    beforeEach(() => {
      (googleSheetsService as any).gapi = mockGapi;
      (googleSheetsService as any).authState.isSignedIn = true;
      mockGapi.client.getToken.mockReturnValue({ access_token: 'token123' });
    });

    it('deve adicionar dados com sucesso', async () => {
      // Arrange
      const mockResponse = {
        result: {
          updates: {
            updatedCells: 3,
            updatedColumns: 3,
            updatedRows: 1
          }
        }
      };
      mockGapi.client.sheets.spreadsheets.values.append.mockResolvedValue(mockResponse);

      const values = [['Pedro', '35', 'Brasília']];

      // Act
      const result = await googleSheetsService.appendData('sheet123', 'A:C', values);

      // Assert
      expect(result.success).toBe(true);
      expect(mockGapi.client.sheets.spreadsheets.values.append).toHaveBeenCalledWith({
        spreadsheetId: 'sheet123',
        range: 'A:C',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: { values }
      });
    });
  });

  describe('isSignedIn', () => {
    it('deve retornar true quando autenticado', () => {
      // Arrange
      (googleSheetsService as any).authState.isSignedIn = true;
      (googleSheetsService as any).gapi = mockGapi;
      mockGapi.client.getToken.mockReturnValue({ access_token: 'token123' });

      // Act
      const result = googleSheetsService.isSignedIn();

      // Assert
      expect(result).toBe(true);
    });

    it('deve retornar false quando não autenticado', () => {
      // Arrange
      (googleSheetsService as any).authState.isSignedIn = false;

      // Act
      const result = googleSheetsService.isSignedIn();

      // Assert
      expect(result).toBe(false);
    });
  });
});