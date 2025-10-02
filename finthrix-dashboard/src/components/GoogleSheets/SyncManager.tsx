import React, { useState } from 'react';
import { useSync } from '../../hooks/useSync';
import { SyncConfig } from '../../types/googleSheets';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Alert } from '../ui/alert';

interface SyncManagerProps {
  onSyncComplete?: (data: any) => void;
  className?: string;
}

export const SyncManager: React.FC<SyncManagerProps> = ({
  onSyncComplete,
  className = ''
}) => {
  const {
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
  } = useSync();

  // Estados locais para formulários
  const [syncConfig, setSyncConfig] = useState<SyncConfig>({
    enabled: false,
    direction: 'bidirectional',
    frequency: 'manual',
    autoSync: false
  });

  const [operationForm, setOperationForm] = useState({
    type: 'read' as 'read' | 'write' | 'append',
    spreadsheetId: '',
    range: '',
    data: ''
  });

  const [bidirectionalForm, setBidirectionalForm] = useState({
    sourceSpreadsheetId: '',
    sourceRange: '',
    targetSpreadsheetId: '',
    targetRange: ''
  });

  // Handlers para configuração
  const handleConfigChange = (field: keyof SyncConfig, value: any) => {
    const newConfig = { ...syncConfig, [field]: value };
    setSyncConfig(newConfig);
    configure(newConfig);
  };

  // Handler para adicionar operação à fila
  const handleQueueOperation = () => {
    const { type, spreadsheetId, range, data } = operationForm;
    
    if (!spreadsheetId || !range) {
      return;
    }

    let operationId = '';
    
    switch (type) {
      case 'read':
        operationId = queueRead(spreadsheetId, range);
        break;
      case 'write':
      case 'append':
        try {
          const parsedData = data ? JSON.parse(data) : [];
          if (type === 'write') {
            operationId = queueWrite(spreadsheetId, range, parsedData);
          } else {
            operationId = queueAppend(spreadsheetId, range, parsedData);
          }
        } catch (err) {
          console.error('Erro ao parsear dados:', err);
          return;
        }
        break;
    }

    if (operationId) {
      setOperationForm({
        type: 'read',
        spreadsheetId: '',
        range: '',
        data: ''
      });
    }
  };

  // Handler para sincronização bidirecional
  const handleBidirectionalSync = async () => {
    const { sourceSpreadsheetId, sourceRange, targetSpreadsheetId, targetRange } = bidirectionalForm;
    
    if (!sourceSpreadsheetId || !sourceRange || !targetSpreadsheetId || !targetRange) {
      return;
    }

    const result = await bidirectionalSync(
      sourceSpreadsheetId,
      sourceRange,
      targetSpreadsheetId,
      targetRange
    );

    if (result && onSyncComplete) {
      onSyncComplete(result);
    }
  };

  const pendingOps = getPendingOperations();
  const completedOps = getCompletedOperations();
  const failedOps = getFailedOperations();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Configuração de Sincronização */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Configuração de Sincronização</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sync-enabled">
              <input
                id="sync-enabled"
                type="checkbox"
                checked={syncConfig.enabled}
                onChange={(e) => handleConfigChange('enabled', e.target.checked)}
                className="mr-2"
              />
              Sincronização Ativada
            </Label>
          </div>

          <div>
            <Label htmlFor="auto-sync">
              <input
                id="auto-sync"
                type="checkbox"
                checked={syncConfig.autoSync}
                onChange={(e) => handleConfigChange('autoSync', e.target.checked)}
                className="mr-2"
              />
              Sincronização Automática
            </Label>
          </div>

          <div>
            <Label htmlFor="sync-direction">Direção</Label>
            <select
              id="sync-direction"
              value={syncConfig.direction}
              onChange={(e) => handleConfigChange('direction', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="import">Importar</option>
              <option value="export">Exportar</option>
              <option value="bidirectional">Bidirecional</option>
            </select>
          </div>

          <div>
            <Label htmlFor="sync-frequency">Frequência</Label>
            <select
              id="sync-frequency"
              value={syncConfig.frequency}
              onChange={(e) => handleConfigChange('frequency', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="manual">Manual</option>
              <option value="hourly">A cada hora</option>
              <option value="daily">Diariamente</option>
              <option value="weekly">Semanalmente</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Status da Sincronização */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Status da Sincronização</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{pendingOps.length}</div>
            <div className="text-sm text-gray-600">Pendentes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedOps.length}</div>
            <div className="text-sm text-gray-600">Concluídas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{failedOps.length}</div>
            <div className="text-sm text-gray-600">Falharam</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={processQueue}
            disabled={isProcessing || pendingOps.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? 'Processando...' : 'Processar Fila'}
          </Button>
          
          <Button
            onClick={clearCompletedOperations}
            disabled={completedOps.length === 0}
            variant="outline"
          >
            Limpar Concluídas
          </Button>
        </div>

        {syncState.lastSync && (
          <div className="mt-4 text-sm text-gray-600">
            Última sincronização: {syncState.lastSync.toLocaleString()}
          </div>
        )}
      </Card>

      {/* Adicionar Operação */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Adicionar Operação</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="operation-type">Tipo de Operação</Label>
            <select
              id="operation-type"
              value={operationForm.type}
              onChange={(e) => setOperationForm(prev => ({ 
                ...prev, 
                type: e.target.value as 'read' | 'write' | 'append' 
              }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="read">Leitura</option>
              <option value="write">Escrita</option>
              <option value="append">Adicionar</option>
            </select>
          </div>

          <div>
            <Label htmlFor="operation-spreadsheet">ID da Planilha</Label>
            <Input
              id="operation-spreadsheet"
              value={operationForm.spreadsheetId}
              onChange={(e) => setOperationForm(prev => ({ 
                ...prev, 
                spreadsheetId: e.target.value 
              }))}
              placeholder="ID ou URL da planilha"
            />
          </div>

          <div>
            <Label htmlFor="operation-range">Intervalo</Label>
            <Input
              id="operation-range"
              value={operationForm.range}
              onChange={(e) => setOperationForm(prev => ({ 
                ...prev, 
                range: e.target.value 
              }))}
              placeholder="A1:C10"
            />
          </div>

          {(operationForm.type === 'write' || operationForm.type === 'append') && (
            <div className="md:col-span-2">
              <Label htmlFor="operation-data">Dados (JSON)</Label>
              <textarea
                id="operation-data"
                value={operationForm.data}
                onChange={(e) => setOperationForm(prev => ({ 
                  ...prev, 
                  data: e.target.value 
                }))}
                placeholder='[["A", "B", "C"], ["1", "2", "3"]]'
                className="w-full p-2 border border-gray-300 rounded-md h-24"
              />
            </div>
          )}
        </div>

        <Button
          onClick={handleQueueOperation}
          disabled={!operationForm.spreadsheetId || !operationForm.range}
          className="mt-4 bg-green-600 hover:bg-green-700"
        >
          Adicionar à Fila
        </Button>
      </Card>

      {/* Sincronização Bidirecional */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Sincronização Bidirecional</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="source-spreadsheet">Planilha Origem</Label>
            <Input
              id="source-spreadsheet"
              value={bidirectionalForm.sourceSpreadsheetId}
              onChange={(e) => setBidirectionalForm(prev => ({ 
                ...prev, 
                sourceSpreadsheetId: e.target.value 
              }))}
              placeholder="ID da planilha origem"
            />
          </div>

          <div>
            <Label htmlFor="source-range">Intervalo Origem</Label>
            <Input
              id="source-range"
              value={bidirectionalForm.sourceRange}
              onChange={(e) => setBidirectionalForm(prev => ({ 
                ...prev, 
                sourceRange: e.target.value 
              }))}
              placeholder="A1:C10"
            />
          </div>

          <div>
            <Label htmlFor="target-spreadsheet">Planilha Destino</Label>
            <Input
              id="target-spreadsheet"
              value={bidirectionalForm.targetSpreadsheetId}
              onChange={(e) => setBidirectionalForm(prev => ({ 
                ...prev, 
                targetSpreadsheetId: e.target.value 
              }))}
              placeholder="ID da planilha destino"
            />
          </div>

          <div>
            <Label htmlFor="target-range">Intervalo Destino</Label>
            <Input
              id="target-range"
              value={bidirectionalForm.targetRange}
              onChange={(e) => setBidirectionalForm(prev => ({ 
                ...prev, 
                targetRange: e.target.value 
              }))}
              placeholder="A1:C10"
            />
          </div>
        </div>

        <Button
          onClick={handleBidirectionalSync}
          disabled={
            isProcessing ||
            !bidirectionalForm.sourceSpreadsheetId ||
            !bidirectionalForm.sourceRange ||
            !bidirectionalForm.targetSpreadsheetId ||
            !bidirectionalForm.targetRange
          }
          className="mt-4 bg-purple-600 hover:bg-purple-700"
        >
          {isProcessing ? 'Sincronizando...' : 'Sincronizar'}
        </Button>
      </Card>

      {/* Lista de Operações */}
      {syncState.operations.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Operações Recentes</h3>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {syncState.operations.slice(-10).reverse().map((operation) => (
              <div
                key={operation.id}
                className={`p-3 rounded-md border ${
                  operation.status === 'completed' ? 'bg-green-50 border-green-200' :
                  operation.status === 'failed' ? 'bg-red-50 border-red-200' :
                  operation.status === 'processing' ? 'bg-blue-50 border-blue-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">
                      {operation.type.toUpperCase()} - {operation.range}
                    </div>
                    <div className="text-sm text-gray-600">
                      {operation.spreadsheetId}
                    </div>
                    <div className="text-xs text-gray-500">
                      {operation.timestamp.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      operation.status === 'completed' ? 'bg-green-100 text-green-800' :
                      operation.status === 'failed' ? 'bg-red-100 text-red-800' :
                      operation.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {operation.status}
                    </span>
                    
                    {operation.status === 'pending' && (
                      <Button
                        onClick={() => cancelOperation(operation.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
                
                {operation.error && (
                  <div className="mt-2 text-sm text-red-600">
                    {operation.error.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Exibição de Erros */}
      {error && (
        <Alert variant="destructive">
          <div className="flex justify-between items-start">
            <div>
              <strong>Erro:</strong> {error.message}
            </div>
            <button 
              onClick={clearError}
              className="ml-2 text-sm hover:opacity-70"
            >
              ✕
            </button>
          </div>
        </Alert>
      )}
    </div>
  );
};