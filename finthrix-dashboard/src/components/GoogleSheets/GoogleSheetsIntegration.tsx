import React, { useState, useCallback } from 'react';
import { SpreadsheetInfo, SheetInfo, ColumnMapping } from '../../types/googleSheets';
import { GoogleSheetsConfig } from './GoogleSheetsConfig';
import { GoogleSheetsImport } from './GoogleSheetsImport';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Sheet, 
  Settings, 
  Download, 
  RefreshCw,
  CheckCircle,
  Clock
} from 'lucide-react';

interface GoogleSheetsIntegrationProps {
  onDataImported?: (data: any[], mappings: ColumnMapping[]) => void;
  onConfigSaved?: (config: { spreadsheetId: string; sheetName: string; range?: string }) => void;
  initialConfig?: {
    spreadsheetId?: string;
    sheetName?: string;
    range?: string;
  };
}

export const GoogleSheetsIntegration: React.FC<GoogleSheetsIntegrationProps> = ({
  onDataImported,
  onConfigSaved,
  initialConfig
}) => {
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<SpreadsheetInfo | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<SheetInfo | null>(null);
  const [range, setRange] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [lastImportTime, setLastImportTime] = useState<Date | null>(null);
  const [importedDataCount, setImportedDataCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState('config');

  const handleSpreadsheetSelected = (spreadsheet: SpreadsheetInfo, sheet: SheetInfo) => {
    setSelectedSpreadsheet(spreadsheet);
    setSelectedSheet(sheet);
    setIsConfigured(true);
  };

  const handleConfigChange = useCallback((config: { spreadsheetId: string; sheetName: string; range?: string }) => {
    setRange(config.range || '');
    
    if (onConfigSaved) {
      onConfigSaved(config);
    }
  }, [onConfigSaved]);

  const handleDataImported = (data: any[], mappings: ColumnMapping[]) => {
    setLastImportTime(new Date());
    setImportedDataCount(data.length);
    
    if (onDataImported) {
      onDataImported(data, mappings);
    }
  };

  const handleSwitchToImport = () => {
    if (isConfigured) {
      setActiveTab('import');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sheet className="h-6 w-6" />
            <span>Integração Google Sheets</span>
          </CardTitle>
          <CardDescription>
            Configure e importe dados das suas planilhas do Google Sheets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isConfigured ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Configurado</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Aguardando configuração</span>
                </div>
              )}

              {selectedSpreadsheet && (
                <Badge variant="outline">
                  {selectedSpreadsheet.name}
                </Badge>
              )}

              {selectedSheet && (
                <Badge variant="outline">
                  {selectedSheet.title}
                </Badge>
              )}
            </div>

            {lastImportTime && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Última importação: {lastImportTime.toLocaleString()} 
                  ({importedDataCount} registros)
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Configuração e Importação */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Configuração</span>
          </TabsTrigger>
          <TabsTrigger 
            value="import" 
            disabled={!isConfigured}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Importar</span>
          </TabsTrigger>
          <TabsTrigger 
            value="sync" 
            disabled={!isConfigured}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Sincronização</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <GoogleSheetsConfig
            onSpreadsheetSelected={handleSpreadsheetSelected}
            onConfigChange={handleConfigChange}
            initialSpreadsheetId={initialConfig?.spreadsheetId}
            initialSheetName={initialConfig?.sheetName}
            initialRange={initialConfig?.range}
          />
          
          {isConfigured && (
            <div className="flex justify-end">
              <Button onClick={handleSwitchToImport}>
                Prosseguir para Importação
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <GoogleSheetsImport
            spreadsheet={selectedSpreadsheet || undefined}
            sheet={selectedSheet || undefined}
            range={range}
            onDataImported={handleDataImported}
          />
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sincronização Automática</CardTitle>
              <CardDescription>
                Configure a sincronização bidirecional entre o dashboard e a planilha
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Em Desenvolvimento</h3>
                <p className="text-muted-foreground">
                  A funcionalidade de sincronização automática será implementada em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};