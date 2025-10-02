import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { googleSheetsService } from '../../services/googleSheetsService';

export const GoogleSheetsTest: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `${timestamp}: ${message}`;
    console.log(`[GoogleSheetsTest] ${message}`);
    setLogs(prev => [...prev, logMessage]);
  };

  const testGoogleAPI = async () => {
    setIsLoading(true);
    setLogs([]);
    
    try {
      addLog('Iniciando teste das APIs do Google');
      
      // Verificar variáveis de ambiente
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      const discoveryDoc = import.meta.env.VITE_GOOGLE_DISCOVERY_DOC;
      const scopes = import.meta.env.VITE_GOOGLE_SCOPES;
      
      addLog(`Client ID: ${clientId ? `${clientId.substring(0, 10)}...` : 'NÃO CONFIGURADO'}`);
      addLog(`API Key: ${apiKey ? `${apiKey.substring(0, 10)}...` : 'NÃO CONFIGURADO'}`);
      addLog(`Discovery Doc: ${discoveryDoc || 'NÃO CONFIGURADO'}`);
      addLog(`Scopes: ${scopes || 'NÃO CONFIGURADO'}`);
      
      if (!clientId || !apiKey) {
        addLog('❌ ERRO: Credenciais não configuradas');
        return;
      }
      
      // Verificar conectividade com Google
      addLog('Testando conectividade com Google...');
      try {
        const response = await fetch('https://www.googleapis.com/discovery/v1/apis/sheets/v4/rest', {
          method: 'HEAD',
          mode: 'no-cors'
        });
        addLog('✅ Conectividade com Google APIs OK');
      } catch (error) {
        addLog(`⚠️ Possível problema de conectividade: ${error}`);
      }
      
      // Carregar Google API
      addLog('Carregando Google API...');
      
      if (!window.gapi) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.onload = () => {
            addLog('✅ Google API carregada');
            addLog(`window.gapi disponível: ${!!window.gapi}`);
            resolve();
          };
          script.onerror = (event) => {
            addLog('❌ Erro ao carregar Google API');
            addLog(`Detalhes do erro: ${JSON.stringify(event)}`);
            reject(new Error('Erro ao carregar Google API'));
          };
          script.ontimeout = () => {
            addLog('❌ Timeout ao carregar Google API');
            reject(new Error('Timeout ao carregar Google API'));
          };
          script.timeout = 10000; // 10 segundos
          addLog(`Tentando carregar: ${script.src}`);
          document.head.appendChild(script);
        });
      } else {
        addLog('✅ Google API já estava carregada');
      }
      
      // Carregar Google Auth
      addLog('Carregando Google Auth...');
      
      if (!window.google?.accounts?.oauth2) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.onload = () => {
            addLog('✅ Google Auth carregada');
            addLog(`window.google disponível: ${!!window.google}`);
            addLog(`window.google.accounts disponível: ${!!window.google?.accounts}`);
            resolve();
          };
          script.onerror = (event) => {
            addLog('❌ Erro ao carregar Google Auth');
            addLog(`Detalhes do erro: ${JSON.stringify(event)}`);
            reject(new Error('Erro ao carregar Google Auth'));
          };
          script.ontimeout = () => {
            addLog('❌ Timeout ao carregar Google Auth');
            reject(new Error('Timeout ao carregar Google Auth'));
          };
          script.timeout = 10000; // 10 segundos
          addLog(`Tentando carregar: ${script.src}`);
          document.head.appendChild(script);
        });
      } else {
        addLog('✅ Google Auth já estava carregada');
      }
      
      // Verificar objetos disponíveis
      addLog(`window.gapi: ${!!window.gapi ? '✅' : '❌'}`);
      addLog(`window.google: ${!!window.google ? '✅' : '❌'}`);
      addLog(`window.google.accounts: ${!!(window.google?.accounts) ? '✅' : '❌'}`);
      addLog(`window.google.accounts.oauth2: ${!!(window.google?.accounts?.oauth2) ? '✅' : '❌'}`);
      
      // Testar inicialização do gapi
      if (window.gapi) {
        addLog('Testando gapi.load...');
        
        await new Promise<void>((resolve, reject) => {
          window.gapi.load('client:auth2', async () => {
            try {
              addLog('✅ gapi.load client:auth2 executado');
              
              addLog('Inicializando gapi.client...');
              await window.gapi.client.init({
                apiKey: apiKey,
                discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
              });
              
              addLog('✅ gapi.client inicializado com sucesso');
              resolve();
            } catch (error) {
              addLog(`❌ Erro ao inicializar gapi.client: ${error}`);
              reject(error);
            }
          });
        });
      }
      
      addLog('🎉 Teste concluído com sucesso!');
      
    } catch (error) {
      addLog(`❌ Erro durante o teste: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testGoogleSheetsService = async () => {
    setIsLoading(true);
    setLogs([]);
    
    try {
      addLog('Testando diretamente o googleSheetsService');
      
      // Verificar estado inicial
      const initialState = googleSheetsService.getAuthState();
      addLog(`Estado inicial: isInitialized=${initialState.isInitialized}, isSignedIn=${initialState.isSignedIn}`);
      
      // Tentar inicializar
      addLog('Chamando googleSheetsService.initialize()...');
      const result = await googleSheetsService.initialize();
      
      if (result.success) {
        addLog('✅ Inicialização bem-sucedida');
        const finalState = googleSheetsService.getAuthState();
        addLog(`Estado final: isInitialized=${finalState.isInitialized}, isSignedIn=${finalState.isSignedIn}`);
      } else {
        addLog(`❌ Falha na inicialização: ${result.error?.message}`);
        if (result.error?.details) {
          addLog(`Detalhes: ${JSON.stringify(result.error.details)}`);
        }
      }
      
    } catch (error) {
      addLog(`❌ Erro durante teste do serviço: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    addLog('Componente de teste montado');
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Teste das APIs do Google Sheets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={testGoogleAPI} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Testando...' : 'Teste APIs Google'}
          </Button>
          
          <Button 
            onClick={testGoogleSheetsService} 
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? 'Testando...' : 'Teste Serviço Direto'}
          </Button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-2">Logs do Teste:</h3>
          {logs.length === 0 ? (
            <p className="text-gray-500">Nenhum log ainda. Clique em "Executar Teste" para começar.</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-sm font-mono">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};