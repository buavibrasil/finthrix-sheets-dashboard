import React, { useEffect, useState } from 'react';
import { useGoogleSheets } from '../../hooks/useGoogleSheets';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2,
  Bug,
  Key,
  Globe,
  Shield
} from 'lucide-react';

export const GoogleSheetsDebug: React.FC = () => {
  const {
    authState,
    isLoading,
    error,
    initialize,
    signIn,
    clearError
  } = useGoogleSheets();

  const [debugInfo, setDebugInfo] = useState<any>({});
  const [initializationAttempted, setInitializationAttempted] = useState(false);

  // Coleta informações de debug
  useEffect(() => {
    const info = {
      // Variáveis de ambiente
      env: {
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ? 'Configurado' : 'Não configurado',
        apiKey: import.meta.env.VITE_GOOGLE_API_KEY ? 'Configurado' : 'Não configurado',
        discoveryDoc: import.meta.env.VITE_GOOGLE_DISCOVERY_DOC || 'Padrão',
        scopes: import.meta.env.VITE_GOOGLE_SCOPES || 'Padrão'
      },
      // APIs do Google
      apis: {
        gapi: typeof window.gapi !== 'undefined' ? 'Carregado' : 'Não carregado',
        google: typeof window.google !== 'undefined' ? 'Carregado' : 'Não carregado',
        oauth2: typeof window.google?.accounts?.oauth2 !== 'undefined' ? 'Carregado' : 'Não carregado'
      },
      // Estado da autenticação
      auth: {
        isInitialized: authState.isInitialized,
        isSignedIn: authState.isSignedIn,
        hasUser: !!authState.user
      }
    };
    setDebugInfo(info);
  }, [authState]);

  const handleInitialize = async () => {
    setInitializationAttempted(true);
    clearError();
    await initialize();
  };

  const handleSignIn = async () => {
    clearError();
    await signIn();
  };

  const getStatusIcon = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      );
    }
    
    if (status === 'Configurado' || status === 'Carregado') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusBadge = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return (
        <Badge variant={status ? 'default' : 'destructive'}>
          {status ? 'OK' : 'Erro'}
        </Badge>
      );
    }
    
    if (status === 'Configurado' || status === 'Carregado') {
      return <Badge variant="default">OK</Badge>;
    }
    
    return <Badge variant="secondary">{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bug className="h-5 w-5" />
          <span>Debug - Google Sheets</span>
        </CardTitle>
        <CardDescription>
          Informações de diagnóstico para identificar problemas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Erro atual */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{error.code}:</strong> {error.message}
              {error.details && (
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(error.details, null, 2)}
                </pre>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Variáveis de Ambiente */}
        <div>
          <h3 className="flex items-center space-x-2 font-medium mb-3">
            <Key className="h-4 w-4" />
            <span>Variáveis de Ambiente</span>
          </h3>
          <div className="space-y-2">
            {Object.entries(debugInfo.env || {}).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(value)}
                  <span className="text-sm">{key}</span>
                </div>
                {getStatusBadge(value)}
              </div>
            ))}
          </div>
        </div>

        {/* APIs do Google */}
        <div>
          <h3 className="flex items-center space-x-2 font-medium mb-3">
            <Globe className="h-4 w-4" />
            <span>APIs do Google</span>
          </h3>
          <div className="space-y-2">
            {Object.entries(debugInfo.apis || {}).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(value)}
                  <span className="text-sm">{key}</span>
                </div>
                {getStatusBadge(value)}
              </div>
            ))}
          </div>
        </div>

        {/* Estado da Autenticação */}
        <div>
          <h3 className="flex items-center space-x-2 font-medium mb-3">
            <Shield className="h-4 w-4" />
            <span>Estado da Autenticação</span>
          </h3>
          <div className="space-y-2">
            {Object.entries(debugInfo.auth || {}).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(value)}
                  <span className="text-sm">{key}</span>
                </div>
                {getStatusBadge(value)}
              </div>
            ))}
          </div>
        </div>

        {/* Ações de Teste */}
        <div className="space-y-3">
          <h3 className="font-medium">Ações de Teste</h3>
          <div className="flex space-x-2">
            <Button 
              onClick={handleInitialize}
              disabled={isLoading}
              variant={authState.isInitialized ? "secondary" : "default"}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {authState.isInitialized ? 'Reinicializar' : 'Inicializar'}
            </Button>
            
            <Button 
              onClick={handleSignIn}
              disabled={isLoading || !authState.isInitialized}
              variant={authState.isSignedIn ? "secondary" : "default"}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {authState.isSignedIn ? 'Reconectar' : 'Conectar'}
            </Button>

            {error && (
              <Button onClick={clearError} variant="outline">
                Limpar Erro
              </Button>
            )}
          </div>
        </div>

        {/* Status Geral */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="font-medium">Status Geral:</span>
            <Badge 
              variant={
                authState.isInitialized && authState.isSignedIn 
                  ? "default" 
                  : error 
                    ? "destructive" 
                    : "secondary"
              }
            >
              {authState.isInitialized && authState.isSignedIn 
                ? "Pronto para usar" 
                : error 
                  ? "Com erro" 
                  : initializationAttempted 
                    ? "Aguardando autenticação"
                    : "Aguardando inicialização"
              }
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};