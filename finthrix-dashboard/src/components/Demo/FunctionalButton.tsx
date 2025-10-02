import React, { useState } from 'react';
import { Button } from '../ui/button';
import { 
  RefreshCw, 
  Download, 
  Upload, 
  Settings, 
  Info, 
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface FunctionalButtonProps {
  className?: string;
}

export const FunctionalButton: React.FC<FunctionalButtonProps> = ({ className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');
  const [actionCount, setActionCount] = useState(0);

  const handleAction = async (actionName: string, duration: number = 1000) => {
    setIsLoading(true);
    setLastAction(actionName);
    setActionCount(prev => prev + 1);
    
    // Simula uma operação assíncrona
    await new Promise(resolve => setTimeout(resolve, duration));
    
    setIsLoading(false);
    
    // Mostra notificação de sucesso
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Ação "${actionName}" executada com sucesso!`);
    }
  };

  const handleDownload = async () => {
    await handleAction('Download de Dados');
    
    // Cria um arquivo de exemplo para download
    const data = {
      timestamp: new Date().toISOString(),
      action: 'download',
      count: actionCount + 1,
      message: 'Dados de exemplo gerados pelo botão funcional'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dados-exemplo-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    await handleAction('Upload de Arquivo');
    
    // Simula upload de arquivo
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('Arquivo selecionado:', file.name);
        alert(`Arquivo "${file.name}" processado com sucesso!`);
      }
    };
    input.click();
  };

  const handleRefresh = async () => {
    await handleAction('Atualização de Dados', 2000);
    
    // Força um refresh da página após confirmação
    if (confirm('Deseja recarregar a página para ver os dados atualizados?')) {
      window.location.reload();
    }
  };

  const handleSettings = async () => {
    await handleAction('Configurações');
    
    // Abre configurações em nova aba
    const settingsData = {
      theme: 'light',
      language: 'pt-BR',
      notifications: true,
      autoSave: true
    };
    
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>Configurações</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>Configurações do Sistema</h1>
            <pre>${JSON.stringify(settingsData, null, 2)}</pre>
            <button onclick="window.close()">Fechar</button>
          </body>
        </html>
      `);
    }
  };

  const handleInfo = () => {
    const info = `
🔧 Botão Funcional - Demonstração de Recursos

📊 Estatísticas:
• Ações executadas: ${actionCount}
• Última ação: ${lastAction || 'Nenhuma'}
• Status: ${isLoading ? 'Processando...' : 'Pronto'}

🚀 Funcionalidades disponíveis:
• Download de dados em JSON
• Upload de arquivos
• Atualização de dados
• Configurações do sistema
• Notificações do navegador

💡 Este botão demonstra como implementar funcionalidades reais em componentes React.
    `;
    
    alert(info);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Botão Funcional</h3>
          <p className="text-sm text-gray-600">
            Demonstração de botão com funcionalidades reais
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isLoading && <Clock className="h-4 w-4 text-blue-500 animate-spin" />}
          {lastAction && !isLoading && <CheckCircle className="h-4 w-4 text-green-500" />}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <Button
          onClick={handleDownload}
          disabled={isLoading}
          variant="default"
          size="sm"
          className="flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </Button>

        <Button
          onClick={handleUpload}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>Upload</span>
        </Button>

        <Button
          onClick={handleRefresh}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </Button>

        <Button
          onClick={handleSettings}
          disabled={isLoading}
          variant="ghost"
          size="sm"
          className="flex items-center space-x-2"
        >
          <Settings className="h-4 w-4" />
          <span>Config</span>
        </Button>

        <Button
          onClick={handleInfo}
          disabled={isLoading}
          variant="ghost"
          size="sm"
          className="flex items-center space-x-2"
        >
          <Info className="h-4 w-4" />
          <span>Info</span>
        </Button>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          {isLoading ? (
            <>
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <span className="text-blue-600">Processando {lastAction}...</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-gray-600">
                {actionCount > 0 ? `${actionCount} ações executadas` : 'Pronto para uso'}
              </span>
            </>
          )}
        </div>
        
        {lastAction && (
          <span className="text-xs text-gray-500">
            Última: {lastAction}
          </span>
        )}
      </div>
    </div>
  );
};