import { googleSheetsService } from './googleSheetsService';
import {
  SyncConfig,
  RangeData,
  GoogleSheetsResponse,
  GoogleSheetsError
} from '../types/googleSheets';

export interface SyncOperation {
  id: string;
  type: 'read' | 'write' | 'append';
  spreadsheetId: string;
  range: string;
  data?: (string | number | boolean)[][];
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: GoogleSheetsError;
}

export interface SyncState {
  isActive: boolean;
  lastSync: Date | null;
  operations: SyncOperation[];
  config: SyncConfig;
}

class SyncService {
  private syncState: SyncState = {
    isActive: false,
    lastSync: null,
    operations: [],
    config: {
      enabled: false,
      direction: 'bidirectional',
      frequency: 'manual',
      autoSync: false
    }
  };

  private syncInterval: NodeJS.Timeout | null = null;
  private operationQueue: SyncOperation[] = [];
  private isProcessing = false;

  /**
   * Configura a sincronização
   */
  configure(config: Partial<SyncConfig>): void {
    this.syncState.config = { ...this.syncState.config, ...config };
    
    if (config.enabled && config.autoSync && config.frequency !== 'manual') {
      this.startAutoSync();
    } else {
      this.stopAutoSync();
    }
  }

  /**
   * Inicia sincronização automática
   */
  private startAutoSync(): void {
    this.stopAutoSync(); // Para qualquer sincronização anterior
    
    const { frequency } = this.syncState.config;
    let intervalMs: number;

    switch (frequency) {
      case 'hourly':
        intervalMs = 60 * 60 * 1000; // 1 hora
        break;
      case 'daily':
        intervalMs = 24 * 60 * 60 * 1000; // 24 horas
        break;
      case 'weekly':
        intervalMs = 7 * 24 * 60 * 60 * 1000; // 7 dias
        break;
      default:
        return;
    }

    this.syncInterval = setInterval(() => {
      this.processQueue();
    }, intervalMs);
  }

  /**
   * Para sincronização automática
   */
  private stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Adiciona operação à fila de sincronização
   */
  queueOperation(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'status'>): string {
    const syncOperation: SyncOperation = {
      ...operation,
      id: this.generateOperationId(),
      timestamp: new Date(),
      status: 'pending'
    };

    this.operationQueue.push(syncOperation);
    this.syncState.operations.push(syncOperation);

    // Se auto-sync estiver ativo, processa imediatamente
    if (this.syncState.config.autoSync && this.syncState.config.enabled) {
      this.processQueue();
    }

    return syncOperation.id;
  }

  /**
   * Processa fila de operações
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || this.operationQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    this.syncState.isActive = true;

    try {
      while (this.operationQueue.length > 0) {
        const operation = this.operationQueue.shift()!;
        await this.processOperation(operation);
      }
      
      this.syncState.lastSync = new Date();
    } catch (error) {
      console.error('Erro ao processar fila de sincronização:', error);
    } finally {
      this.isProcessing = false;
      this.syncState.isActive = false;
    }
  }

  /**
   * Processa uma operação individual
   */
  private async processOperation(operation: SyncOperation): Promise<void> {
    operation.status = 'processing';

    try {
      let result: GoogleSheetsResponse<any>;

      switch (operation.type) {
        case 'read':
          result = await googleSheetsService.readRange(operation.spreadsheetId, operation.range);
          break;
        case 'write':
          if (!operation.data) {
            throw new Error('Dados não fornecidos para operação de escrita');
          }
          result = await googleSheetsService.writeRange(
            operation.spreadsheetId,
            operation.range,
            operation.data
          );
          break;
        case 'append':
          if (!operation.data) {
            throw new Error('Dados não fornecidos para operação de adição');
          }
          result = await googleSheetsService.appendData(
            operation.spreadsheetId,
            operation.range,
            operation.data
          );
          break;
        default:
          throw new Error(`Tipo de operação não suportado: ${operation.type}`);
      }

      if (result.success) {
        operation.status = 'completed';
      } else {
        operation.status = 'failed';
        operation.error = result.error;
      }
    } catch (error) {
      operation.status = 'failed';
      operation.error = {
        code: 'OPERATION_ERROR',
        message: 'Erro ao processar operação',
        details: error
      };
    }
  }

  /**
   * Sincronização bidirecional entre duas planilhas/ranges
   */
  async bidirectionalSync(
    sourceSpreadsheetId: string,
    sourceRange: string,
    targetSpreadsheetId: string,
    targetRange: string
  ): Promise<GoogleSheetsResponse<{ sourceData: RangeData; targetData: RangeData }>> {
    try {
      // Lê dados de ambas as fontes
      const [sourceResult, targetResult] = await Promise.all([
        googleSheetsService.readRange(sourceSpreadsheetId, sourceRange),
        googleSheetsService.readRange(targetSpreadsheetId, targetRange)
      ]);

      if (!sourceResult.success || !targetResult.success) {
        return {
          success: false,
          error: {
            code: 'SYNC_READ_ERROR',
            message: 'Erro ao ler dados para sincronização',
            details: { sourceResult, targetResult }
          }
        };
      }

      const sourceData = sourceResult.data!;
      const targetData = targetResult.data!;

      // Compara e sincroniza dados (implementação básica)
      const needsSourceUpdate = this.compareData(sourceData.values, targetData.values);
      const needsTargetUpdate = this.compareData(targetData.values, sourceData.values);

      const updates: Promise<GoogleSheetsResponse<any>>[] = [];

      if (needsTargetUpdate && sourceData.values.length > 0) {
        updates.push(
          googleSheetsService.writeRange(targetSpreadsheetId, targetRange, sourceData.values)
        );
      }

      if (needsSourceUpdate && targetData.values.length > 0) {
        updates.push(
          googleSheetsService.writeRange(sourceSpreadsheetId, sourceRange, targetData.values)
        );
      }

      if (updates.length > 0) {
        await Promise.all(updates);
      }

      return {
        success: true,
        data: { sourceData, targetData }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BIDIRECTIONAL_SYNC_ERROR',
          message: 'Erro na sincronização bidirecional',
          details: error
        }
      };
    }
  }

  /**
   * Compara dois conjuntos de dados
   */
  private compareData(
    data1: (string | number | boolean)[][],
    data2: (string | number | boolean)[][]
  ): boolean {
    if (data1.length !== data2.length) return true;
    
    for (let i = 0; i < data1.length; i++) {
      if (data1[i].length !== data2[i].length) return true;
      
      for (let j = 0; j < data1[i].length; j++) {
        if (data1[i][j] !== data2[i][j]) return true;
      }
    }
    
    return false;
  }

  /**
   * Gera ID único para operação
   */
  private generateOperationId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtém estado atual da sincronização
   */
  getSyncState(): SyncState {
    return { ...this.syncState };
  }

  /**
   * Obtém operações por status
   */
  getOperationsByStatus(status: SyncOperation['status']): SyncOperation[] {
    return this.syncState.operations.filter(op => op.status === status);
  }

  /**
   * Limpa operações concluídas
   */
  clearCompletedOperations(): void {
    this.syncState.operations = this.syncState.operations.filter(
      op => op.status !== 'completed'
    );
  }

  /**
   * Cancela operação pendente
   */
  cancelOperation(operationId: string): boolean {
    const operationIndex = this.operationQueue.findIndex(op => op.id === operationId);
    if (operationIndex !== -1) {
      this.operationQueue.splice(operationIndex, 1);
      
      const stateOperation = this.syncState.operations.find(op => op.id === operationId);
      if (stateOperation) {
        stateOperation.status = 'failed';
        stateOperation.error = {
          code: 'OPERATION_CANCELLED',
          message: 'Operação cancelada pelo usuário'
        };
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Destrói o serviço e limpa recursos
   */
  destroy(): void {
    this.stopAutoSync();
    this.operationQueue = [];
    this.syncState.operations = [];
    this.isProcessing = false;
  }
}

// Exporta uma instância singleton
export const syncService = new SyncService();
export default syncService;