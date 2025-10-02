import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SyncManager } from './SyncManager';
import { useSync } from '../../hooks/useSync';

// Mock do hook useSync
vi.mock('../../hooks/useSync', () => ({
  useSync: vi.fn()
}));

const mockUseSync = vi.mocked(useSync);

describe('SyncManager', () => {
  const mockSyncHook = {
    syncState: {
      enabled: false,
      direction: 'bidirectional' as const,
      frequency: 'manual' as const,
      autoSync: false,
      operations: [],
      isProcessing: false
    },
    isProcessing: false,
    error: null,
    configure: vi.fn(),
    queueRead: vi.fn(),
    queueWrite: vi.fn(),
    queueAppend: vi.fn(),
    processQueue: vi.fn(),
    bidirectionalSync: vi.fn(),
    cancelOperation: vi.fn(),
    clearCompletedOperations: vi.fn(),
    getPendingOperations: vi.fn().mockReturnValue([]),
    getCompletedOperations: vi.fn().mockReturnValue([]),
    getFailedOperations: vi.fn().mockReturnValue([]),
    clearError: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSync.mockReturnValue(mockSyncHook);
  });

  describe('renderização inicial', () => {
    it('deve renderizar sem erros', () => {
      expect(() => {
        render(<SyncManager />);
      }).not.toThrow();
    });

    it('deve exibir o título do componente', () => {
      render(<SyncManager />);
      expect(screen.getByText('Configuração de Sincronização')).toBeInTheDocument();
    });
  });

  describe('configuração', () => {
    it('deve permitir habilitar sincronização', () => {
      render(<SyncManager />);
      
      const enableCheckbox = screen.getByLabelText('Sincronização Ativada');
      fireEvent.click(enableCheckbox);
      
      expect(mockSyncHook.configure).toHaveBeenCalledWith({
        enabled: true,
        direction: 'bidirectional',
        frequency: 'manual',
        autoSync: false
      });
    });

    it('deve permitir alterar direção da sincronização', () => {
      render(<SyncManager />);
      
      const directionSelect = screen.getByLabelText('Direção');
      fireEvent.change(directionSelect, { target: { value: 'import' } });
      
      expect(mockSyncHook.configure).toHaveBeenCalledWith({
        enabled: false,
        direction: 'import',
        frequency: 'manual',
        autoSync: false
      });
    });
  });

  describe('operações', () => {
    it('deve permitir processar fila', () => {
      // Simular operações pendentes para habilitar o botão
      mockSyncHook.getPendingOperations.mockReturnValue([{ id: '1', type: 'read' }]);
      
      render(<SyncManager />);
      
      const processButton = screen.getByText('Processar Fila');
      fireEvent.click(processButton);
      
      expect(mockSyncHook.processQueue).toHaveBeenCalled();
    });

    it('deve permitir limpar operações concluídas', () => {
      // Simular operações concluídas para habilitar o botão
      mockSyncHook.getCompletedOperations.mockReturnValue([{ id: '1', type: 'read', status: 'completed' }]);
      
      render(<SyncManager />);
      
      const clearButton = screen.getByText('Limpar Concluídas');
      fireEvent.click(clearButton);
      
      expect(mockSyncHook.clearCompletedOperations).toHaveBeenCalled();
    });

    it('deve desabilitar botão de processar quando não há operações pendentes', () => {
      mockSyncHook.getPendingOperations.mockReturnValue([]);
      
      render(<SyncManager />);
      
      const processButton = screen.getByText('Processar Fila');
      expect(processButton).toBeDisabled();
    });

    it('deve desabilitar botão de limpar quando não há operações concluídas', () => {
      mockSyncHook.getCompletedOperations.mockReturnValue([]);
      
      render(<SyncManager />);
      
      const clearButton = screen.getByText('Limpar Concluídas');
      expect(clearButton).toBeDisabled();
    });

    it('deve mostrar estado de processamento', () => {
      mockSyncHook.isProcessing = true;
      mockSyncHook.getPendingOperations.mockReturnValue([{ id: '1', type: 'read' }]);
      
      render(<SyncManager />);
      
      expect(screen.getByText('Processando...')).toBeInTheDocument();
      
      const processButton = screen.getByText('Processando...');
      expect(processButton).toBeDisabled();
    });
  });

  describe('estados de erro', () => {
    it('deve exibir erro quando presente', () => {
      mockSyncHook.error = { message: 'Erro de conexão com Google Sheets' };
      
      render(<SyncManager />);
      
      expect(screen.getByText('Erro de conexão com Google Sheets')).toBeInTheDocument();
    });
  });

  describe('estatísticas de operações', () => {
    it('deve exibir contadores de operações', () => {
      mockSyncHook.getPendingOperations.mockReturnValue([
        { id: '1', type: 'read' },
        { id: '2', type: 'write' }
      ]);
      mockSyncHook.getCompletedOperations.mockReturnValue([
        { id: '3', type: 'read', status: 'completed' }
      ]);
      mockSyncHook.getFailedOperations.mockReturnValue([
        { id: '4', type: 'write', status: 'failed' }
      ]);
      
      render(<SyncManager />);
      
      // Verificar contadores usando texto mais específico
      expect(screen.getByText('Pendentes')).toBeInTheDocument();
      expect(screen.getByText('Concluídas')).toBeInTheDocument();
      expect(screen.getByText('Falharam')).toBeInTheDocument();
      
      // Verificar se os números estão presentes no contexto correto
      const pendingSection = screen.getByText('Pendentes').parentElement;
      const completedSection = screen.getByText('Concluídas').parentElement;
      const failedSection = screen.getByText('Falharam').parentElement;
      
      expect(pendingSection).toHaveTextContent('2Pendentes');
      expect(completedSection).toHaveTextContent('1Concluídas');
      expect(failedSection).toHaveTextContent('1Falharam');
    });
  });
});