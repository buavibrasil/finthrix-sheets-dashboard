import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSync } from './useSync';
import { syncService } from '../services/syncService';

// Mock do syncService
vi.mock('../services/syncService', () => ({
  syncService: {
    configure: vi.fn(),
    getSyncState: vi.fn(),
    queueOperation: vi.fn(),
    processQueue: vi.fn(),
    bidirectionalSync: vi.fn(),
    getOperationsByStatus: vi.fn(),
    cancelOperation: vi.fn(),
    clearCompletedOperations: vi.fn()
  }
}));

const mockSyncService = vi.mocked(syncService);

describe('useSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock padrão do estado
    mockSyncService.getSyncState.mockReturnValue({
      isActive: false,
      lastSync: null,
      operations: [],
      config: {
        enabled: false,
        direction: 'bidirectional',
        frequency: 'manual',
        autoSync: false
      }
    });
  });

  describe('configuração', () => {
    it('deve configurar sincronização corretamente', () => {
      const { result } = renderHook(() => useSync());

      act(() => {
        result.current.configure({
          enabled: true,
          direction: 'import',
          frequency: 'hourly',
          autoSync: true
        });
      });

      expect(mockSyncService.configure).toHaveBeenCalledWith({
        enabled: true,
        direction: 'import',
      frequency: 'hourly',
        autoSync: true
      });
    });
  });

  describe('operações de fila', () => {
    it('deve adicionar operação de leitura à fila', () => {
      mockSyncService.queueOperation.mockReturnValue('op-123');
      
      const { result } = renderHook(() => useSync());

      act(() => {
        result.current.queueRead('sheet123', 'A1:C3');
      });

      expect(mockSyncService.queueOperation).toHaveBeenCalledWith({
        type: 'read',
        spreadsheetId: 'sheet123',
        range: 'A1:C3'
      });
    });

    it('deve adicionar operação de escrita à fila', () => {
      mockSyncService.queueOperation.mockReturnValue('op-124');
      
      const { result } = renderHook(() => useSync());
      const data = [['A', 'B'], ['1', '2']];

      act(() => {
        result.current.queueWrite('sheet123', 'A1:B2', data);
      });

      expect(mockSyncService.queueOperation).toHaveBeenCalledWith({
        type: 'write',
        spreadsheetId: 'sheet123',
        range: 'A1:B2',
        data
      });
    });

    it('deve adicionar operação de adição à fila', () => {
      mockSyncService.queueOperation.mockReturnValue('op-125');
      
      const { result } = renderHook(() => useSync());
      const data = [['C', 'D']];

      act(() => {
        result.current.queueAppend('sheet123', 'Sheet1', data);
      });

      expect(mockSyncService.queueOperation).toHaveBeenCalledWith({
        type: 'append',
        spreadsheetId: 'sheet123',
        range: 'Sheet1',
        data
      });
    });
  });

  describe('processamento de fila', () => {
    it('deve processar fila com sucesso', async () => {
      mockSyncService.processQueue.mockResolvedValue();
      
      const { result } = renderHook(() => useSync());

      await act(async () => {
        await result.current.processQueue();
      });

      expect(mockSyncService.processQueue).toHaveBeenCalled();
    });

    it('deve tratar erro no processamento da fila', async () => {
      const error = new Error('Erro de processamento');
      mockSyncService.processQueue.mockRejectedValue(error);
      
      const { result } = renderHook(() => useSync());

      await act(async () => {
        await result.current.processQueue();
      });

      expect(mockSyncService.processQueue).toHaveBeenCalled();
      // O erro deve ser tratado internamente
    });
  });

  describe('sincronização bidirecional', () => {
    it('deve executar sincronização bidirecional com sucesso', async () => {
      const mockData = {
        sourceData: { range: 'A1:C3', values: [['A', 'B', 'C']] },
        targetData: { range: 'A1:C3', values: [['X', 'Y', 'Z']] }
      };
      
      mockSyncService.bidirectionalSync.mockResolvedValue({
        success: true,
        data: mockData
      });
      
      const { result } = renderHook(() => useSync());

      let syncResult;
      await act(async () => {
        syncResult = await result.current.bidirectionalSync(
          'source123',
          'A1:C3',
          'target456',
          'A1:C3'
        );
      });

      expect(mockSyncService.bidirectionalSync).toHaveBeenCalledWith(
        'source123',
        'A1:C3',
        'target456',
        'A1:C3'
      );
      expect(syncResult).toEqual(mockData);
    });

    it('deve tratar erro na sincronização bidirecional', async () => {
      mockSyncService.bidirectionalSync.mockResolvedValue({
        success: false,
        error: { code: 'SYNC_ERROR', message: 'Erro de sincronização' }
      });
      
      const { result } = renderHook(() => useSync());

      let syncResult;
      await act(async () => {
        syncResult = await result.current.bidirectionalSync(
          'source123',
          'A1:C3',
          'target456',
          'A1:C3'
        );
      });

      expect(syncResult).toBeNull();
      expect(result.current.error).toEqual({
        code: 'SYNC_ERROR',
        message: 'Erro de sincronização'
      });
    });
  });

  describe('gerenciamento de operações', () => {
    it('deve cancelar operação', () => {
      mockSyncService.cancelOperation.mockReturnValue(true);
      
      const { result } = renderHook(() => useSync());

      let cancelled;
      act(() => {
        cancelled = result.current.cancelOperation('op-123');
      });

      expect(cancelled).toBe(true);
      expect(mockSyncService.cancelOperation).toHaveBeenCalledWith('op-123');
    });

    it('deve limpar operações concluídas', () => {
      const { result } = renderHook(() => useSync());

      act(() => {
        result.current.clearCompletedOperations();
      });

      expect(mockSyncService.clearCompletedOperations).toHaveBeenCalled();
    });

    it('deve obter operações pendentes', () => {
      const mockOperations = [
        { id: 'op-1', type: 'read', status: 'pending' },
        { id: 'op-2', type: 'write', status: 'pending' }
      ];
      mockSyncService.getOperationsByStatus.mockReturnValue(mockOperations as any);
      
      const { result } = renderHook(() => useSync());

      let pending;
      act(() => {
        pending = result.current.getPendingOperations();
      });

      expect(pending).toEqual(mockOperations);
      expect(mockSyncService.getOperationsByStatus).toHaveBeenCalledWith('pending');
    });

    it('deve obter operações concluídas', () => {
      const mockOperations = [
        { id: 'op-1', type: 'read', status: 'completed' },
        { id: 'op-2', type: 'write', status: 'completed' }
      ];
      mockSyncService.getOperationsByStatus.mockReturnValue(mockOperations as any);
      
      const { result } = renderHook(() => useSync());

      let completed;
      act(() => {
        completed = result.current.getCompletedOperations();
      });

      expect(completed).toEqual(mockOperations);
      expect(mockSyncService.getOperationsByStatus).toHaveBeenCalledWith('completed');
    });

    it('deve obter operações falhadas', () => {
      const mockOperations = [
        { id: 'op-1', type: 'read', status: 'failed' }
      ];
      mockSyncService.getOperationsByStatus.mockReturnValue(mockOperations as any);
      
      const { result } = renderHook(() => useSync());

      let failed;
      act(() => {
        failed = result.current.getFailedOperations();
      });

      expect(failed).toEqual(mockOperations);
      expect(mockSyncService.getOperationsByStatus).toHaveBeenCalledWith('failed');
    });
  });

  describe('estado do hook', () => {
    it('deve retornar estado inicial correto', () => {
      const { result } = renderHook(() => useSync());

      expect(result.current.syncState).toEqual({
        isActive: false,
        lastSync: null,
        operations: [],
        config: {
          enabled: false,
          direction: 'bidirectional',
          frequency: 'manual',
          autoSync: false
        }
      });
    });

    it('deve atualizar estado após configuração', () => {
      // Configura o mock para retornar novo estado após configuração
      mockSyncService.getSyncState.mockReturnValueOnce({
        isActive: false,
        lastSync: null,
        operations: [],
        config: {
          enabled: false,
          direction: 'bidirectional',
          frequency: 'manual',
          autoSync: false
        }
      }).mockReturnValueOnce({
        isActive: false,
        lastSync: null,
        operations: [],
        config: {
          enabled: true,
          direction: 'import',
          frequency: 'hourly',
          autoSync: true
        }
      });

      const { result } = renderHook(() => useSync());

      act(() => {
        result.current.configure({
          enabled: true,
          direction: 'import',
          frequency: 'hourly',
          autoSync: true
        });
      });

      expect(result.current.syncState.config.enabled).toBe(true);
      expect(result.current.syncState.config.direction).toBe('import');
      expect(result.current.syncState.config.frequency).toBe('hourly');
      expect(result.current.syncState.config.autoSync).toBe(true);
    });
  });
});