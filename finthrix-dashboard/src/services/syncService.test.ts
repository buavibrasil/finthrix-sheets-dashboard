import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { syncService } from './syncService';
import { googleSheetsService } from './googleSheetsService';

// Mock do serviço Google Sheets
vi.mock('./googleSheetsService', () => ({
  googleSheetsService: {
    readRange: vi.fn(),
    writeRange: vi.fn(),
    appendData: vi.fn()
  }
}));

const mockGoogleSheetsService = googleSheetsService as any;

describe('SyncService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Limpa estado do serviço
    syncService.configure({
      enabled: false,
      direction: 'bidirectional',
      frequency: 'manual',
      autoSync: false
    });
    
    // Limpa todas as operações (não apenas as concluídas)
    const state = syncService.getSyncState();
    (syncService as any).syncState.operations = [];
    (syncService as any).operationQueue = [];
  });

  afterEach(() => {
    // Para qualquer sincronização automática
    syncService.configure({ autoSync: false });
  });

  describe('configure', () => {
    it('deve configurar sincronização corretamente', () => {
      // Act
      syncService.configure({
        enabled: true,
        direction: 'import',
        frequency: 'hourly',
        autoSync: true
      });

      // Assert
      const state = syncService.getSyncState();
      expect(state.config.enabled).toBe(true);
      expect(state.config.direction).toBe('import');
      expect(state.config.frequency).toBe('hourly');
      expect(state.config.autoSync).toBe(true);
    });
  });

  describe('queueOperation', () => {
    it('deve adicionar operação de leitura à fila', () => {
      // Act
      const operationId = syncService.queueOperation({
        type: 'read',
        spreadsheetId: 'sheet123',
        range: 'A1:C3'
      });

      // Assert
      expect(operationId).toBeTruthy();
      const state = syncService.getSyncState();
      expect(state.operations).toHaveLength(1);
      expect(state.operations[0].type).toBe('read');
      expect(state.operations[0].spreadsheetId).toBe('sheet123');
      expect(state.operations[0].range).toBe('A1:C3');
      expect(state.operations[0].status).toBe('pending');
    });

    it('deve adicionar operação de escrita à fila', () => {
      // Arrange
      const data = [['A', 'B'], ['1', '2']];

      // Act
      const operationId = syncService.queueOperation({
        type: 'write',
        spreadsheetId: 'sheet123',
        range: 'A1:B2',
        data
      });

      // Assert
      expect(operationId).toBeTruthy();
      const state = syncService.getSyncState();
      expect(state.operations).toHaveLength(1);
      expect(state.operations[0].type).toBe('write');
      expect(state.operations[0].data).toEqual(data);
    });

    it('deve adicionar operação de adição à fila', () => {
      // Arrange
      const data = [['C', 'D']];

      // Act
      const operationId = syncService.queueOperation({
        type: 'append',
        spreadsheetId: 'sheet123',
        range: 'A:B',
        data
      });

      // Assert
      expect(operationId).toBeTruthy();
      const state = syncService.getSyncState();
      expect(state.operations).toHaveLength(1);
      expect(state.operations[0].type).toBe('append');
      expect(state.operations[0].data).toEqual(data);
    });
  });

  describe('processQueue', () => {
    it('deve processar operação de leitura com sucesso', async () => {
      // Arrange
      const mockData = {
        range: 'A1:C3',
        values: [['A', 'B', 'C'], ['1', '2', '3']],
        majorDimension: 'ROWS'
      };
      mockGoogleSheetsService.readRange.mockResolvedValue({
        success: true,
        data: mockData
      });

      syncService.queueOperation({
        type: 'read',
        spreadsheetId: 'sheet123',
        range: 'A1:C3'
      });

      // Act
      await syncService.processQueue();

      // Assert
      expect(mockGoogleSheetsService.readRange).toHaveBeenCalledWith('sheet123', 'A1:C3');
      
      const state = syncService.getSyncState();
      expect(state.operations[0].status).toBe('completed');
      expect(state.lastSync).toBeTruthy();
    });

    it('deve processar operação de escrita com sucesso', async () => {
      // Arrange
      const data = [['A', 'B'], ['1', '2']];
      mockGoogleSheetsService.writeRange.mockResolvedValue({
        success: true,
        data: { updatedCells: 4 }
      });

      syncService.queueOperation({
        type: 'write',
        spreadsheetId: 'sheet123',
        range: 'A1:B2',
        data
      });

      // Act
      await syncService.processQueue();

      // Assert
      expect(mockGoogleSheetsService.writeRange).toHaveBeenCalledWith('sheet123', 'A1:B2', data);
      
      const state = syncService.getSyncState();
      expect(state.operations[0].status).toBe('completed');
    });

    it('deve processar operação de adição com sucesso', async () => {
      // Arrange
      const data = [['C', 'D']];
      mockGoogleSheetsService.appendData.mockResolvedValue({
        success: true,
        data: { updates: { updatedCells: 2 } }
      });

      syncService.queueOperation({
        type: 'append',
        spreadsheetId: 'sheet123',
        range: 'A:B',
        data
      });

      // Act
      await syncService.processQueue();

      // Assert
      expect(mockGoogleSheetsService.appendData).toHaveBeenCalledWith('sheet123', 'A:B', data);
      
      const state = syncService.getSyncState();
      expect(state.operations[0].status).toBe('completed');
    });

    it('deve marcar operação como falhada em caso de erro', async () => {
      // Arrange
      mockGoogleSheetsService.readRange.mockResolvedValue({
        success: false,
        error: {
          code: 'READ_ERROR',
          message: 'Erro ao ler planilha'
        }
      });

      syncService.queueOperation({
        type: 'read',
        spreadsheetId: 'sheet123',
        range: 'A1:C3'
      });

      // Act
      await syncService.processQueue();

      // Assert
      const state = syncService.getSyncState();
      expect(state.operations[0].status).toBe('failed');
      expect(state.operations[0].error?.code).toBe('READ_ERROR');
    });

    it('deve processar múltiplas operações em sequência', async () => {
      // Arrange
      mockGoogleSheetsService.readRange.mockResolvedValue({
        success: true,
        data: { range: 'A1:C3', values: [] }
      });
      mockGoogleSheetsService.writeRange.mockResolvedValue({
        success: true,
        data: { updatedCells: 4 }
      });

      syncService.queueOperation({
        type: 'read',
        spreadsheetId: 'sheet123',
        range: 'A1:C3'
      });
      syncService.queueOperation({
        type: 'write',
        spreadsheetId: 'sheet123',
        range: 'A1:B2',
        data: [['A', 'B']]
      });

      // Act
      await syncService.processQueue();

      // Assert
      const state = syncService.getSyncState();
      expect(state.operations).toHaveLength(2);
      expect(state.operations[0].status).toBe('completed');
      expect(state.operations[1].status).toBe('completed');
    });
  });

  describe('bidirectionalSync', () => {
    it('deve sincronizar dados entre duas planilhas', async () => {
      // Arrange
      const sourceData = {
        range: 'A1:B2',
        values: [['A', 'B'], ['1', '2']],
        majorDimension: 'ROWS'
      };
      const targetData = {
        range: 'A1:B2',
        values: [['A', 'B'], ['3', '4']],
        majorDimension: 'ROWS'
      };

      mockGoogleSheetsService.readRange
        .mockResolvedValueOnce({ success: true, data: sourceData })
        .mockResolvedValueOnce({ success: true, data: targetData });
      
      mockGoogleSheetsService.writeRange.mockResolvedValue({
        success: true,
        data: { updatedCells: 4 }
      });

      // Act
      const result = await syncService.bidirectionalSync(
        'source123',
        'A1:B2',
        'target123',
        'A1:B2'
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.sourceData).toEqual(sourceData);
      expect(result.data?.targetData).toEqual(targetData);
      
      // Verifica se as operações de escrita foram chamadas
      expect(mockGoogleSheetsService.writeRange).toHaveBeenCalledTimes(2);
    });

    it('deve retornar erro se falhar ao ler dados', async () => {
      // Arrange
      mockGoogleSheetsService.readRange.mockResolvedValue({
        success: false,
        error: { code: 'READ_ERROR', message: 'Erro ao ler' }
      });

      // Act
      const result = await syncService.bidirectionalSync(
        'source123',
        'A1:B2',
        'target123',
        'A1:B2'
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SYNC_READ_ERROR');
    });
  });

  describe('getOperationsByStatus', () => {
    it('deve filtrar operações por status', async () => {
      // Arrange
      mockGoogleSheetsService.readRange.mockResolvedValue({
        success: true,
        data: { range: 'A1:C3', values: [] }
      });
      mockGoogleSheetsService.writeRange.mockResolvedValue({
        success: false,
        error: { code: 'WRITE_ERROR', message: 'Erro' }
      });

      const readOpId = syncService.queueOperation({
        type: 'read',
        spreadsheetId: 'sheet123',
        range: 'A1:C3'
      });
      const writeOpId = syncService.queueOperation({
        type: 'write',
        spreadsheetId: 'sheet123',
        range: 'A1:B2',
        data: [['A', 'B']]
      });

      await syncService.processQueue();

      // Act & Assert
      const completed = syncService.getOperationsByStatus('completed');
      const failed = syncService.getOperationsByStatus('failed');
      const pending = syncService.getOperationsByStatus('pending');

      expect(completed).toHaveLength(1);
      expect(failed).toHaveLength(1);
      expect(pending).toHaveLength(0);
      expect(completed[0].type).toBe('read');
      expect(failed[0].type).toBe('write');
    });
  });

  describe('cancelOperation', () => {
    it('deve cancelar operação pendente', () => {
      // Arrange
      const operationId = syncService.queueOperation({
        type: 'read',
        spreadsheetId: 'sheet123',
        range: 'A1:C3'
      });

      // Act
      const success = syncService.cancelOperation(operationId);

      // Assert
      expect(success).toBe(true);
      
      const state = syncService.getSyncState();
      const operation = state.operations.find(op => op.id === operationId);
      expect(operation?.status).toBe('failed');
      expect(operation?.error?.code).toBe('OPERATION_CANCELLED');
    });

    it('deve retornar false para operação inexistente', () => {
      // Act
      const success = syncService.cancelOperation('invalid-id');

      // Assert
      expect(success).toBe(false);
    });
  });

  describe('clearCompletedOperations', () => {
    it('deve limpar apenas operações concluídas', async () => {
      // Arrange
      mockGoogleSheetsService.readRange.mockResolvedValue({
        success: true,
        data: { range: 'A1:C3', values: [] }
      });

      // Adiciona uma operação que será processada
      const completedId = syncService.queueOperation({
        type: 'read',
        spreadsheetId: 'sheet123',
        range: 'A1:C3'
      });

      // Processa a fila para completar a primeira operação
      await syncService.processQueue();

      // Adiciona uma operação que ficará pendente
      const pendingId = syncService.queueOperation({
        type: 'read',
        spreadsheetId: 'sheet456',
        range: 'A1:C3'
      });

      // Verifica estado antes da limpeza
      let state = syncService.getSyncState();
      expect(state.operations).toHaveLength(2);

      // Act
      syncService.clearCompletedOperations();

      // Assert
      state = syncService.getSyncState();
      expect(state.operations).toHaveLength(1);
      expect(state.operations[0].id).toBe(pendingId);
      expect(state.operations[0].status).toBe('pending');
    });
  });
});