import React, { useState, useEffect } from 'react';
import { useGoogleSheets } from '../../hooks/useGoogleSheets';
import { SpreadsheetInfo, SheetInfo, RangeData, ColumnMapping } from '../../types/googleSheets';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { 
  Loader2, 
  Download, 
  Eye, 
  AlertCircle, 
  CheckCircle, 
  Table,
  ArrowRight
} from 'lucide-react';

interface GoogleSheetsImportProps {
  spreadsheet?: SpreadsheetInfo;
  sheet?: SheetInfo;
  range?: string;
  onDataImported?: (data: any[], mappings: ColumnMapping[]) => void;
  onPreviewData?: (data: any[]) => void;
  columnMappings?: ColumnMapping[];
}

export const GoogleSheetsImport: React.FC<GoogleSheetsImportProps> = ({
  spreadsheet,
  sheet,
  range,
  onDataImported,
  onPreviewData,
  columnMappings = []
}) => {
  const { readRange, isOperationLoading, error } = useGoogleSheets();
  
  const [previewData, setPreviewData] = useState<RangeData | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasHeader, setHasHeader] = useState(true);
  const [selectedColumns, setSelectedColumns] = useState<number[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>(columnMappings);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  // Reseta o estado quando a planilha/aba muda
  useEffect(() => {
    setPreviewData(null);
    setIsPreviewMode(false);
    setSelectedColumns([]);
    setImportedCount(null);
  }, [spreadsheet?.id, sheet?.id, range]);

  // Atualiza os mapeamentos quando as colunas selecionadas mudam
  useEffect(() => {
    if (previewData && previewData.values.length > 0) {
      const headerRow = hasHeader ? previewData.values[0] : [];
      const newMappings: ColumnMapping[] = selectedColumns.map((colIndex) => {
        const existingMapping = mappings.find(m => m.sourceColumn === colIndex);
        return existingMapping || {
          sourceColumn: colIndex,
          sourceColumnName: headerRow[colIndex]?.toString() || `Coluna ${colIndex + 1}`,
          targetField: '',
          dataType: 'string',
          required: false
        };
      });
      setMappings(newMappings);
    }
  }, [selectedColumns, previewData, hasHeader]);

  const loadPreview = async () => {
    if (!spreadsheet || !sheet) return;

    setIsPreviewMode(true);
    
    try {
      const rangeToUse = range || `${sheet.title}!A1:Z100`; // Limita a 100 linhas para preview
      const data = await readRange(spreadsheet.id, rangeToUse);
      
      if (data) {
        setPreviewData(data);
        
        // Seleciona todas as colunas por padrão se houver dados
        if (data.values.length > 0) {
          const columnCount = Math.max(...data.values.map(row => row.length));
          setSelectedColumns(Array.from({ length: columnCount }, (_, i) => i));
        }

        if (onPreviewData) {
          onPreviewData(data.values);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar preview:', err);
    }
  };

  const handleColumnToggle = (columnIndex: number) => {
    setSelectedColumns(prev => 
      prev.includes(columnIndex)
        ? prev.filter(i => i !== columnIndex)
        : [...prev, columnIndex].sort((a, b) => a - b)
    );
  };

  const handleMappingChange = (columnIndex: number, field: keyof ColumnMapping, value: any) => {
    setMappings(prev => prev.map(mapping => 
      mapping.sourceColumn === columnIndex
        ? { ...mapping, [field]: value }
        : mapping
    ));
  };

  const processAndImportData = () => {
    if (!previewData || selectedColumns.length === 0) return;

    const dataRows = hasHeader ? previewData.values.slice(1) : previewData.values;
    
    // Processa os dados baseado nos mapeamentos
    const processedData = dataRows.map((row, index) => {
      const processedRow: any = { _rowIndex: index };
      
      mappings.forEach(mapping => {
        const cellValue = row[mapping.sourceColumn];
        let processedValue = cellValue;

        // Aplica conversão de tipo
        switch (mapping.dataType) {
          case 'number':
            processedValue = cellValue ? parseFloat(cellValue.toString()) : null;
            break;
          case 'boolean':
            processedValue = ['true', '1', 'sim', 'yes'].includes(cellValue?.toString().toLowerCase());
            break;
          case 'date':
            processedValue = cellValue ? new Date(cellValue.toString()) : null;
            break;
          default:
            processedValue = cellValue?.toString() || '';
        }

        if (mapping.targetField) {
          processedRow[mapping.targetField] = processedValue;
        }
      });

      return processedRow;
    });

    setImportedCount(processedData.length);

    if (onDataImported) {
      onDataImported(processedData, mappings);
    }
  };

  const getColumnPreview = (columnIndex: number): string[] => {
    if (!previewData) return [];
    
    const startRow = hasHeader ? 1 : 0;
    return previewData.values
      .slice(startRow, startRow + 5)
      .map(row => row[columnIndex]?.toString() || '')
      .filter(Boolean);
  };

  if (!spreadsheet || !sheet) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center space-y-2">
            <Table className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              Selecione uma planilha e aba para importar dados
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Informações da Planilha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Importar Dados</span>
          </CardTitle>
          <CardDescription>
            Planilha: {spreadsheet.name} • Aba: {sheet.title}
            {range && ` • Intervalo: ${range}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={loadPreview}
              disabled={isOperationLoading}
              variant="outline"
            >
              {isOperationLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar Dados
                </>
              )}
            </Button>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-header"
                checked={hasHeader}
                onCheckedChange={(checked) => setHasHeader(!!checked)}
              />
              <Label htmlFor="has-header">Primeira linha contém cabeçalhos</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview dos Dados */}
      {isPreviewMode && previewData && (
        <Card>
          <CardHeader>
            <CardTitle>Seleção de Colunas</CardTitle>
            <CardDescription>
              Selecione as colunas que deseja importar e configure o mapeamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {previewData.values.length > 0 && 
                Array.from({ length: Math.max(...previewData.values.map(row => row.length)) }, (_, i) => i)
                  .map(columnIndex => {
                    const headerValue = hasHeader ? previewData.values[0][columnIndex] : `Coluna ${columnIndex + 1}`;
                    const isSelected = selectedColumns.includes(columnIndex);
                    const preview = getColumnPreview(columnIndex);
                    const mapping = mappings.find(m => m.sourceColumn === columnIndex);

                    return (
                      <div key={columnIndex} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleColumnToggle(columnIndex)}
                          />
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{headerValue}</h4>
                              <Badge variant="outline">Coluna {String.fromCharCode(65 + columnIndex)}</Badge>
                            </div>
                            
                            {preview.length > 0 && (
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Exemplos: </span>
                                {preview.slice(0, 3).join(', ')}
                                {preview.length > 3 && '...'}
                              </div>
                            )}

                            {isSelected && mapping && (
                              <div className="grid grid-cols-2 gap-2 mt-3">
                                <div>
                                  <Label className="text-xs">Campo de Destino</Label>
                                  <input
                                    type="text"
                                    className="w-full p-1 text-sm border rounded"
                                    placeholder="nome_do_campo"
                                    value={mapping.targetField}
                                    onChange={(e) => handleMappingChange(columnIndex, 'targetField', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Tipo de Dados</Label>
                                  <select
                                    className="w-full p-1 text-sm border rounded"
                                    value={mapping.dataType}
                                    onChange={(e) => handleMappingChange(columnIndex, 'dataType', e.target.value)}
                                  >
                                    <option value="string">Texto</option>
                                    <option value="number">Número</option>
                                    <option value="boolean">Verdadeiro/Falso</option>
                                    <option value="date">Data</option>
                                  </select>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
              }
            </div>

            {selectedColumns.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {selectedColumns.length} coluna(s) selecionada(s) • 
                  {previewData.values.length - (hasHeader ? 1 : 0)} linha(s) de dados
                </div>
                
                <Button onClick={processAndImportData}>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Importar Dados
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resultado da Importação */}
      {importedCount !== null && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            {importedCount} registro(s) importado(s) com sucesso!
          </AlertDescription>
        </Alert>
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