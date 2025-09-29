import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { googleSheetsDiagnostic, DiagnosticResult } from "@/utils/google-sheets-diagnostic";
import { googleAuth } from "@/lib/google-auth";
import { GoogleSheetsService } from "@/lib/google-sheets";

export const GoogleSheetsDiagnostic: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isTestingAuth, setIsTestingAuth] = useState(false);
  const [authResult, setAuthResult] = useState<string | null>(null);

  const runDiagnostic = async () => {
    setIsRunning(true);
    setResults([]);
    
    try {
      const diagnosticResults = await googleSheetsDiagnostic.runDiagnostic();
      setResults(diagnosticResults);
    } catch (error) {
      console.error('Erro no diagnóstico:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const testAuthentication = async () => {
    setIsTestingAuth(true);
    setAuthResult(null);
    
    try {
      await googleAuth.initializeAuth();
      const token = await googleAuth.requestAccess();
      
      if (token) {
        setAuthResult('✅ Autenticação realizada com sucesso!');
        
        // Testar busca de dados
        try {
          const movimentacoes = await GoogleSheetsService.fetchMovimentacoes(token);
          setAuthResult(`✅ Autenticação e busca de dados realizadas com sucesso! Encontradas ${movimentacoes.length} movimentações.`);
        } catch (dataError) {
          setAuthResult(`⚠️ Autenticação OK, mas erro ao buscar dados: ${dataError instanceof Error ? dataError.message : 'Erro desconhecido'}`);
        }
      }
    } catch (error) {
      setAuthResult(`❌ Erro na autenticação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsTestingAuth(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default' as const,
      error: 'destructive' as const,
      warning: 'secondary' as const,
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const summary = results.length > 0 ? googleSheetsDiagnostic.getSummary() : null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Diagnóstico Google Sheets
        </CardTitle>
        <CardDescription>
          Teste a configuração e conectividade com Google Sheets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runDiagnostic} 
            disabled={isRunning}
            variant="outline"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isRunning ? 'Executando...' : 'Executar Diagnóstico'}
          </Button>
          
          <Button 
            onClick={testAuthentication} 
            disabled={isTestingAuth}
            variant="default"
          >
            {isTestingAuth ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            {isTestingAuth ? 'Testando...' : 'Testar Autenticação'}
          </Button>
        </div>

        {authResult && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Resultado do Teste de Autenticação:</p>
            <p className="text-sm mt-1">{authResult}</p>
          </div>
        )}

        {summary && (
          <div className="grid grid-cols-4 gap-2 p-3 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold">{summary.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{summary.success}</div>
              <div className="text-xs text-muted-foreground">Sucesso</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{summary.error}</div>
              <div className="text-xs text-muted-foreground">Erros</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">{summary.warning}</div>
              <div className="text-xs text-muted-foreground">Avisos</div>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Resultados do Diagnóstico:</h4>
            {results.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{result.step}</span>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                        Ver detalhes
                      </summary>
                      <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Dica:</strong> Execute o diagnóstico primeiro para verificar a configuração.</p>
          <p><strong>Teste de Autenticação:</strong> Testa a conexão real com Google Sheets (requer interação do usuário).</p>
        </div>
      </CardContent>
    </Card>
  );
};