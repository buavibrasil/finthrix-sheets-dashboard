import React, { useState } from 'react';
import { GoogleSheetsIntegration } from '../components/GoogleSheets';
import { ColumnMapping } from '../types/googleSheets';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import { 
  Sheet, 
  Database, 
  CheckCircle, 
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

export const GoogleSheetsDemo: React.FC = () => {
  const [importedData, setImportedData] = useState<any[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [sheetConfig, setSheetConfig] = useState<{
    spreadsheetId: string;
    sheetName: string;
    range?: string;
  } | null>(null);
  const [showRawData, setShowRawData] = useState(false);

  const handleDataImported = (data: any[], mappings: ColumnMapping[]) => {
    setImportedData(data);
    setColumnMappings(mappings);
    console.log('Dados importados:', data);
    console.log('Mapeamentos:', mappings);
  };

  const handleConfigSaved = (config: { spreadsheetId: string; sheetName: string; range?: string }) => {
    setSheetConfig(config);
    console.log('Configuração salva:', config);
  };

  const getDisplayColumns = () => {
    return columnMappings.filter(mapping => mapping.targetField);
  };

  const formatCellValue = (value: any, dataType: string) => {
    if (value === null || value === undefined) return '-';
    
    switch (dataType) {
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      case 'boolean':
        return value ? 'Sim' : 'Não';
      case 'date':
        return value instanceof Date ? value.toLocaleDateString() : value;
      default:
        return value.toString();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center space-x-2">
          <Sheet className="h-8 w-8" />
          <span>Google Sheets Integration</span>
        </h1>
        <p className="text-muted-foreground">
          Demonstração da integração com Google Sheets para importação e sincronização de dados
        </p>
      </div>

      {/* Status da Configuração */}
      {sheetConfig && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Conectado à planilha: <strong>{sheetConfig.spreadsheetId}</strong> • 
            Aba: <strong>{sheetConfig.sheetName}</strong>
            {sheetConfig.range && ` • Intervalo: ${sheetConfig.range}`}
          </AlertDescription>
        </Alert>
      )}

      {/* Componente de Integração */}
      <GoogleSheetsIntegration
        onDataImported={handleDataImported}
        onConfigSaved={handleConfigSaved}
      />

      {/* Dados Importados */}
      {importedData.length > 0 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>Dados Importados</span>
                  </CardTitle>
                  <CardDescription>
                    {importedData.length} registro(s) importado(s) com {getDisplayColumns().length} coluna(s) mapeada(s)
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRawData(!showRawData)}
                  >
                    {showRawData ? (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Ocultar Dados Brutos
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Dados Brutos
                      </>
                    )}
                  </Button>
                  <Badge variant="outline">
                    {importedData.length} registros
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!showRawData ? (
                // Visualização formatada
                <div className="space-y-4">
                  {getDisplayColumns().length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            {getDisplayColumns().map((mapping) => (
                              <TableHead key={mapping.sourceColumn}>
                                <div className="space-y-1">
                                  <div className="font-medium">{mapping.targetField}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {mapping.sourceColumnName} • {mapping.dataType}
                                  </div>
                                </div>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {importedData.slice(0, 10).map((row, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{index + 1}</TableCell>
                              {getDisplayColumns().map((mapping) => (
                                <TableCell key={mapping.sourceColumn}>
                                  {formatCellValue(row[mapping.targetField], mapping.dataType)}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma coluna foi mapeada para exibição
                    </div>
                  )}
                  
                  {importedData.length > 10 && (
                    <div className="text-center text-sm text-muted-foreground">
                      Mostrando 10 de {importedData.length} registros
                    </div>
                  )}
                </div>
              ) : (
                // Visualização de dados brutos
                <div className="space-y-4">
                  <div className="text-sm font-medium">Mapeamentos de Colunas:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {columnMappings.map((mapping) => (
                      <div key={mapping.sourceColumn} className="p-2 border rounded text-sm">
                        <div className="font-medium">{mapping.sourceColumnName}</div>
                        <div className="text-muted-foreground">
                          → {mapping.targetField || 'Não mapeado'} ({mapping.dataType})
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-sm font-medium">Dados Brutos (JSON):</div>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
                    {JSON.stringify(importedData.slice(0, 5), null, 2)}
                  </pre>
                  
                  {importedData.length > 5 && (
                    <div className="text-center text-sm text-muted-foreground">
                      Mostrando 5 de {importedData.length} registros no JSON
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Instruções de Uso */}
      <Card>
        <CardHeader>
          <CardTitle>Como Usar</CardTitle>
          <CardDescription>
            Siga estes passos para importar dados do Google Sheets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium">Configure as variáveis de ambiente</h4>
                <p className="text-sm text-muted-foreground">
                  Adicione suas credenciais do Google no arquivo .env:
                  <br />
                  <code className="text-xs bg-muted px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> e{' '}
                  <code className="text-xs bg-muted px-1 rounded">VITE_GOOGLE_API_KEY</code>
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium">Conecte com sua conta Google</h4>
                <p className="text-sm text-muted-foreground">
                  Clique em "Conectar com Google" na aba de Configuração
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium">Selecione sua planilha</h4>
                <p className="text-sm text-muted-foreground">
                  Cole o ID ou URL da planilha do Google Sheets e selecione a aba desejada
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                4
              </div>
              <div>
                <h4 className="font-medium">Importe os dados</h4>
                <p className="text-sm text-muted-foreground">
                  Na aba de Importação, visualize os dados, selecione as colunas e configure o mapeamento
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};