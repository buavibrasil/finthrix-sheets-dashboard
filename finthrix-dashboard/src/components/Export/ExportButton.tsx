import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Loader2, Settings } from 'lucide-react';
import exportService, { type ExportData, type ExportOptions } from '@/services/exportService';
import { PDFTemplateSelector } from './PDFTemplateSelector';
import { PDFTemplateCustomizer } from './PDFTemplateCustomizer';
import { PDFTemplate } from '@/types/pdfTemplates';

interface ExportButtonProps {
  data: ExportData;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  className = '',
  variant = 'primary',
  size = 'md'
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showTemplateCustomizer, setShowTemplateCustomizer] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeCharts: true,
    includeTransactions: true,
    includeAccountsPayable: true,
    includeKPIs: true,
    format: 'pdf'
  });

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const options: ExportOptions = {
        ...exportOptions,
        pdfTemplate: exportOptions.format === 'pdf' && selectedTemplate ? selectedTemplate : undefined
      };

      // Usa o método principal de exportação
      await exportService.export(data, options);
    } catch (error) {
      console.error('Erro na exportação:', error);
      alert('Erro ao exportar relatório. Tente novamente.');
    } finally {
      setIsExporting(false);
      setShowOptions(false);
    }
  };

  const handleTemplateSelect = (template: PDFTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateSelector(false);
  };

  const handleTemplateCustomize = (template: PDFTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateCustomizer(false);
  };

  const openTemplateSelector = () => {
    setShowTemplateSelector(true);
    setShowOptions(false);
  };

  const openTemplateCustomizer = () => {
    if (selectedTemplate) {
      setShowTemplateCustomizer(true);
      setShowOptions(false);
    } else {
      // Se não há template selecionado, abrir o seletor primeiro
      setShowTemplateSelector(true);
      setShowOptions(false);
    }
  };

  const toggleOption = (option: keyof ExportOptions) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isExporting}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        aria-expanded={showOptions}
        aria-haspopup="dialog"
        aria-label={isExporting ? 'Exportando relatório, aguarde...' : 'Abrir opções de exportação de relatório'}
        aria-describedby={isExporting ? 'export-status' : undefined}
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
        ) : (
          <Download className="w-4 h-4 mr-2" aria-hidden="true" />
        )}
        <span aria-hidden={!isExporting}>
          {isExporting ? 'Exportando...' : 'Exportar Relatório'}
        </span>
        {isExporting && (
          <span id="export-status" className="sr-only">
            Processando exportação do relatório, aguarde...
          </span>
        )}
      </button>

      {showOptions && (
        <div 
          className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-options-title"
          aria-describedby="export-options-description"
        >
          <div className="p-4">
            <h3 
              id="export-options-title"
              className="text-lg font-semibold text-gray-900 mb-4"
            >
              Opções de Exportação
            </h3>
            <p 
              id="export-options-description" 
              className="sr-only"
            >
              Selecione o formato e as opções para exportar o relatório financeiro
            </p>

            {/* Formato */}
            <fieldset className="mb-4">
              <legend id="format-legend" className="block text-sm font-medium text-gray-700 mb-2">
                Formato do arquivo
              </legend>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-labelledby="format-legend">
                <button
                  onClick={() => setExportOptions(prev => ({ ...prev, format: 'pdf' }))}
                  className={`flex items-center justify-center px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
                    exportOptions.format === 'pdf'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  role="radio"
                  aria-checked={exportOptions.format === 'pdf'}
                  aria-label="Formato PDF - Documento portátil"
                >
                  <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
                  PDF
                </button>
                <button
                  onClick={() => setExportOptions(prev => ({ ...prev, format: 'excel' }))}
                  className={`flex items-center justify-center px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
                    exportOptions.format === 'excel'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  role="radio"
                  aria-checked={exportOptions.format === 'excel'}
                  aria-label="Formato Excel - Planilha eletrônica"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" aria-hidden="true" />
                  Excel
                </button>
                <button
                  onClick={() => setExportOptions(prev => ({ ...prev, format: 'csv' }))}
                  className={`flex items-center justify-center px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
                    exportOptions.format === 'csv'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  role="radio"
                  aria-checked={exportOptions.format === 'csv'}
                  aria-label="Formato CSV - Valores separados por vírgula"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" aria-hidden="true" />
                  CSV
                </button>
                <button
                  onClick={() => setExportOptions(prev => ({ ...prev, format: 'json' }))}
                  className={`flex items-center justify-center px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
                    exportOptions.format === 'json'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  role="radio"
                  aria-checked={exportOptions.format === 'json'}
                  aria-label="Formato JSON - Dados estruturados"
                >
                  <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
                  JSON
                </button>
              </div>
            </fieldset>

            {/* Templates PDF */}
            {exportOptions.format === 'pdf' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template PDF
                </label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedTemplate ? selectedTemplate.name : 'Template Padrão'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {selectedTemplate ? selectedTemplate.description : 'Usar template padrão do sistema'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={openTemplateSelector}
                        className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-white"
                        title="Selecionar template"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={openTemplateCustomizer}
                        className="p-2 text-gray-500 hover:text-purple-600 rounded-lg hover:bg-white"
                        title="Customizar template"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Configurações específicas para CSV */}
            {exportOptions.format === 'csv' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Configurações CSV
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.csvOptions?.includeHeaders !== false}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        csvOptions: { ...prev.csvOptions, includeHeaders: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Incluir cabeçalhos</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-700">Separador:</label>
                    <select
                      value={exportOptions.csvOptions?.delimiter || ','}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        csvOptions: { ...prev.csvOptions, delimiter: e.target.value }
                      }))}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value=",">Vírgula (,)</option>
                      <option value=";">Ponto e vírgula (;)</option>
                      <option value="\t">Tab</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Configurações específicas para JSON */}
            {exportOptions.format === 'json' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Configurações JSON
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.jsonOptions?.pretty !== false}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        jsonOptions: { ...prev.jsonOptions, pretty: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Formatação legível</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.jsonOptions?.includeMetadata !== false}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        jsonOptions: { ...prev.jsonOptions, includeMetadata: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Incluir metadados</span>
                  </label>
                </div>
              </div>
            )}

            {/* Conteúdo */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Incluir no Relatório
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeKPIs}
                    onChange={() => toggleOption('includeKPIs')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Indicadores (KPIs)</span>
                </label>
                
                {exportOptions.format === 'pdf' && (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeCharts}
                      onChange={() => toggleOption('includeCharts')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Gráficos</span>
                  </label>
                )}
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeTransactions}
                    onChange={() => toggleOption('includeTransactions')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Transações</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeAccountsPayable}
                    onChange={() => toggleOption('includeAccountsPayable')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Contas a Pagar</span>
                </label>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowOptions(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar {exportOptions.format === 'pdf' ? 'PDF' : 'Excel'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para fechar o modal */}
      {showOptions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowOptions(false)}
        />
      )}

      {/* Modal de Seleção de Template */}
      {showTemplateSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-w-4xl w-full mx-4">
            <PDFTemplateSelector
              selectedTemplateId={selectedTemplate?.id}
              onTemplateSelect={handleTemplateSelect}
              onClose={() => setShowTemplateSelector(false)}
            />
          </div>
        </div>
      )}

      {/* Modal de Customização de Template */}
      {showTemplateCustomizer && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-w-6xl w-full mx-4">
            <PDFTemplateCustomizer
              template={selectedTemplate}
              onSave={handleTemplateCustomize}
              onCancel={() => setShowTemplateCustomizer(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};