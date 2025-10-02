import { useState, useEffect, useCallback } from 'react';
import { syncService, SyncOperation, SyncState } from '../services/syncService';
import { SyncConfig, RangeData, GoogleSheetsError } from '../types/googleSheets';

interface UseSyncReturn {
  // Estado da sincronização
  syncState: SyncState;
  isProcessing: boolean;
  error: GoogleSheetsError | null;
  
  // Configuração
  configure: (config: Partial<SyncConfig>) => void;
  
  // Operações de sincronização
  queueRead: (spreadsheetId: string, range: string) => string;
  queueWrite: (spreadsheetId: string, range: string, data: (string | number | boolean)[][]) => string;
  queueAppend: (spreadsheetId: string, range: string, data: (string | number | boolean)[][]) => string;
  
  // Sincronização bidirecional
  bidirectionalSync: (
    sourceSpreadsheetId: string,
    sourceRange: string,
    targetSpreadsheetId: string,
    targetRange: string
  ) => Promise<{ sourceData: RangeData; targetData: RangeData } | null>;
  
  // Controle da fila
  processQueue: () => Promise<void>;
  cancelOperation: (operationId: string) => boolean;
  clearCompletedOperations: () => void;
  
  // Filtros de operações
  getPendingOperations: () => SyncOperation[];
  getCompletedOperations: () => SyncOperation[];
  getFailedOperations: () => SyncOperation[];
  
  // Utilitários
  clearError: () => void;
}

export const useSync = (): UseSyncReturn => {
  const [syncState, setSyncState] = useState<SyncState>(syncService.getSyncState());
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<GoogleSheetsError | null>(null);

  // Atualiza estado da sincronização
  const updateSyncState = useCallback(() => {
    setSyncState(syncService.getSyncState());
  }, []);

  // Configura sincronização
  const configure = useCallback((config: Partial<SyncConfig>) => {
    try {
      syncService.configure(config);
      updateSyncState();
      setError(null);
    } catch (err) {
      setError({
        code: 'SYNC_CONFIG_ERROR',
        message: 'Erro ao configurar sincronização',
        details: err
      });
    }
  }, [updateSyncState]);

  // Adiciona operação de leitura à fila
  const queueRead = useCallback((spreadsheetId: string, range: string): string => {
    try {
      const operationId = syncService.queueOperation({
        type: 'read',
        spreadsheetId,
        range
      });
      updateSyncState();
      setError(null);
      return operationId;
    } catch (err) {
      setError({
        code: 'QUEUE_READ_ERROR',
        message: 'Erro ao adicionar operação de leitura à fila',
        details: err
      });
      return '';
    }
  }, [updateSyncState]);

  // Adiciona operação de escrita à fila
  const queueWrite = useCallback((
    spreadsheetId: string,
    range: string,
    data: (string | number | boolean)[][]
  ): string => {
    try {
      const operationId = syncService.queueOperation({
        type: 'write',
        spreadsheetId,
        range,
        data
      });
      updateSyncState();
      setError(null);
      return operationId;
    } catch (err) {
      setError({
        code: 'QUEUE_WRITE_ERROR',
        message: 'Erro ao adicionar operação de escrita à fila',
        details: err
      });
      return '';
    }
  }, [updateSyncState]);

  // Adiciona operação de adição à fila
  const queueAppend = useCallback((
    spreadsheetId: string,
    range: string,
    data: (string | number | boolean)[][]
  ): string => {
    try {
      const operationId = syncService.queueOperation({
        type: 'append',
        spreadsheetId,
        range,
        data
      });
      updateSyncState();
      setError(null);
      return operationId;
    } catch (err) {
      setError({
        code: 'QUEUE_APPEND_ERROR',
        message: 'Erro ao adicionar operação de adição à fila',
        details: err
      });
      return '';
    }
  }, [updateSyncState]);

  // Executa sincronização bidirecional
  const bidirectionalSync = useCallback(async (
    sourceSpreadsheetId: string,
    sourceRange: string,
    targetSpreadsheetId: string,
    targetRange: string
  ): Promise<{ sourceData: RangeData; targetData: RangeData } | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await syncService.bidirectionalSync(
        sourceSpreadsheetId,
        sourceRange,
        targetSpreadsheetId,
        targetRange
      );

      if (result.success) {
        updateSyncState();
        return result.data!;
      } else {
        setError(result.error || {
          code: 'UNKNOWN_ERROR',
          message: 'Erro desconhecido na sincronização bidirecional'
        });
        return null;
      }
    } catch (err) {
      setError({
        code: 'BIDIRECTIONAL_SYNC_ERROR',
        message: 'Erro na sincronização bidirecional',
        details: err
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [updateSyncState]);

  // Processa fila de operações
  const processQueue = useCallback(async (): Promise<void> => {
    setIsProcessing(true);
    setError(null);

    try {
      await syncService.processQueue();
      updateSyncState();
    } catch (err) {
      setError({
        code: 'PROCESS_QUEUE_ERROR',
        message: 'Erro ao processar fila de sincronização',
        details: err
      });
    } finally {
      setIsProcessing(false);
    }
  }, [updateSyncState]);

  // Cancela operação
  const cancelOperation = useCallback((operationId: string): boolean => {
    try {
      const success = syncService.cancelOperation(operationId);
      if (success) {
        updateSyncState();
        setError(null);
      }
      return success;
    } catch (err) {
      setError({
        code: 'CANCEL_OPERATION_ERROR',
        message: 'Erro ao cancelar operação',
        details: err
      });
      return false;
    }
  }, [updateSyncState]);

  // Limpa operações concluídas
  const clearCompletedOperations = useCallback(() => {
    try {
      syncService.clearCompletedOperations();
      updateSyncState();
      setError(null);
    } catch (err) {
      setError({
        code: 'CLEAR_OPERATIONS_ERROR',
        message: 'Erro ao limpar operações concluídas',
        details: err
      });
    }
  }, [updateSyncState]);

  // Obtém operações por status
  const getPendingOperations = useCallback((): SyncOperation[] => {
    return syncService.getOperationsByStatus('pending');
  }, []);

  const getCompletedOperations = useCallback((): SyncOperation[] => {
    return syncService.getOperationsByStatus('completed');
  }, []);

  const getFailedOperations = useCallback((): SyncOperation[] => {
    return syncService.getOperationsByStatus('failed');
  }, []);

  // Limpa erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Atualiza estado periodicamente
  useEffect(() => {
    const interval = setInterval(updateSyncState, 1000);
    return () => clearInterval(interval);
  }, [updateSyncState]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      // Não destruir o serviço aqui pois pode ser usado por outros componentes
      // syncService.destroy();
    };
  }, []);

  return {
    syncState,
    isProcessing,
    error,
    configure,
    queueRead,
    queueWrite,
    queueAppend,
    bidirectionalSync,
    processQueue,
    cancelOperation,
    clearCompletedOperations,
    getPendingOperations,
    getCompletedOperations,
    getFailedOperations,
    clearError
  };
};