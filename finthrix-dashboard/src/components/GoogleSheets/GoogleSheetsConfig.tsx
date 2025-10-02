import React, { useState, useEffect } from 'react';
import { useGoogleSheets } from '../../hooks/useGoogleSheets';
import { SpreadsheetInfo, SheetInfo } from '../../types/googleSheets';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, ExternalLink, Sheet, CheckCircle, AlertCircle } from 'lucide-react';

interface GoogleSheetsConfigProps {
  onSpreadsheetSelected?: (spreadsheet: SpreadsheetInfo, sheet: SheetInfo) => void;
  onConfigChange?: (config: { spreadsheetId: string; sheetName: string; range?: string }) => void;
  initialSpreadsheetId?: string;
  initialSheetName?: string;
  initialRange?: string;
}

export const GoogleSheetsConfig: React.FC<GoogleSheetsConfigProps> = ({
  onSpreadsheetSelected,
  onConfigChange,
  initialSpreadsheetId = import.meta.env.VITE_DEFAULT_SPREADSHEET_ID || '',
  initialSheetName = '',
  initialRange = ''
}) => {
  const {
    authState,
    isLoading,
    error,
    signIn,
    signOut,
    getSpreadsheetInfo,
    isOperationLoading,
    clearError
  } = useGoogleSheets();

  const [spreadsheetId, setSpreadsheetId] = useState(initialSpreadsheetId);
  const [selectedSheet, setSelectedSheet] = useState(initialSheetName);
  const [range, setRange] = useState(initialRange);
  const [spreadsheetInfo, setSpreadsheetInfo] = useState<SpreadsheetInfo | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Valida a planilha quando o ID muda
  useEffect(() => {
    if (spreadsheetId && authState.isSignedIn) {
      validateSpreadsheet();
    } else {
      setSpreadsheetInfo(null);
    }
  }, [spreadsheetId, authState.isSignedIn]);

  // Notifica mudanças na configuração
  useEffect(() => {
    if (onConfigChange) {
      onConfigChange({
        spreadsheetId,
        sheetName: selectedSheet,
        range: range || undefined
      });
    }
  }, [spreadsheetId, selectedSheet, range, onConfigChange]);

  // Notifica seleção de planilha e aba
  useEffect(() => {
    if (spreadsheetInfo && selectedSheet && onSpreadsheetSelected) {
      const sheet = spreadsheetInfo.sheets.find(s => s.title === selectedSheet);
      if (sheet) {
        onSpreadsheetSelected(spreadsheetInfo, sheet);
      }
    }
  }, [spreadsheetInfo, selectedSheet, onSpreadsheetSelected]);

  const validateSpreadsheet = async () => {
    if (!spreadsheetId.trim()) return;

    setIsValidating(true);
    clearError();

    try {
      const info = await getSpreadsheetInfo(spreadsheetId);
      if (info) {
        setSpreadsheetInfo(info);
        // Se não há aba selecionada, seleciona a primeira
        if (!selectedSheet && info.sheets.length > 0) {
          setSelectedSheet(info.sheets[0].title);
        }
      }
    } catch (err) {
      console.error('Erro ao validar planilha:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSpreadsheetIdChange = (value: string) => {
    setSpreadsheetId(value);
    setSpreadsheetInfo(null);
    setSelectedSheet('');
  };

  const extractSpreadsheetIdFromUrl = (url: string): string => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : url;
  };

  const handleUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.includes('docs.google.com/spreadsheets')) {
      const id = extractSpreadsheetIdFromUrl(pastedText);
      setSpreadsheetId(id);
      e.preventDefault();
    }
  };

  if (!authState.isInitialized) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Inicializando Google Sheets...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Autenticação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sheet className="h-5 w-5" />
            <span>Configuração do Google Sheets</span>
          </CardTitle>
          <CardDescription>
            Configure a conexão com sua planilha do Google Sheets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!authState.isSignedIn ? (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Você precisa fazer login com sua conta Google para acessar as planilhas.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={signIn} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  'Conectar com Google'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Conectado com sucesso ao Google Sheets!
                </AlertDescription>
              </Alert>
              <Button 
                variant="outline" 
                onClick={signOut}
                disabled={isLoading}
                size="sm"
              >
                Desconectar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuração da Planilha */}
      {authState.isSignedIn && (
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Planilha</CardTitle>
            <CardDescription>
              Informe o ID ou URL da planilha do Google Sheets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="spreadsheet-id">ID ou URL da Planilha</Label>
              <Input
                id="spreadsheet-id"
                placeholder="Cole aqui o ID ou URL da planilha..."
                value={spreadsheetId}
                onChange={(e) => handleSpreadsheetIdChange(e.target.value)}
                onPaste={handleUrlPaste}
              />
              <p className="text-sm text-muted-foreground">
                Você pode colar a URL completa da planilha ou apenas o ID
              </p>
            </div>

            {spreadsheetId && (
              <Button 
                onClick={validateSpreadsheet}
                disabled={isValidating || isOperationLoading}
                variant="outline"
                size="sm"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validando...
                  </>
                ) : (
                  'Validar Planilha'
                )}
              </Button>
            )}

            {spreadsheetInfo && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{spreadsheetInfo.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {spreadsheetInfo.sheets.length} aba(s) encontrada(s)
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(spreadsheetInfo.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sheet-select">Selecionar Aba</Label>
                  <select
                    id="sheet-select"
                    className="w-full p-2 border rounded-md"
                    value={selectedSheet}
                    onChange={(e) => setSelectedSheet(e.target.value)}
                  >
                    <option value="">Selecione uma aba...</option>
                    {spreadsheetInfo.sheets.map((sheet) => (
                      <option key={sheet.id} value={sheet.title}>
                        {sheet.title} ({sheet.rowCount}x{sheet.columnCount})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="range-input">Intervalo (Opcional)</Label>
                  <Input
                    id="range-input"
                    placeholder="Ex: A1:Z100 ou deixe vazio para toda a aba"
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Especifique um intervalo específico ou deixe vazio para usar toda a aba
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Exibir Erros */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};