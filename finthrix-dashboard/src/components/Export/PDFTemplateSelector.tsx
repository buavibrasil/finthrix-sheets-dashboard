import React, { useState, useEffect } from 'react';
import { PDFTemplate } from '@/types/pdfTemplates';
import { pdfTemplateService } from '@/services/pdfTemplateService';
import { 
  FileText, 
  Copy, 
  Trash2, 
  Download, 
  Upload,
  Check
} from 'lucide-react';

interface PDFTemplateSelectorProps {
  selectedTemplateId?: string;
  onTemplateSelect: (template: PDFTemplate) => void;
  onClose?: () => void;
}

export const PDFTemplateSelector: React.FC<PDFTemplateSelectorProps> = ({
  selectedTemplateId,
  onTemplateSelect,
  onClose
}) => {
  const [templates, setTemplates] = useState<PDFTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        setSelectedTemplate(template);
      }
    }
  }, [selectedTemplateId, templates]);

  const loadTemplates = () => {
    setIsLoading(true);
    try {
      const allTemplates = pdfTemplateService.getAllTemplates();
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: PDFTemplate) => {
    setSelectedTemplate(template);
    onTemplateSelect(template);
  };

  const handleDuplicateTemplate = async (template: PDFTemplate) => {
    try {
      const duplicated = pdfTemplateService.duplicateTemplate(template.id);
      if (duplicated) {
        loadTemplates();
      }
    } catch (error) {
      console.error('Erro ao duplicar template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este template?')) {
      try {
        pdfTemplateService.deleteTemplate(templateId);
        loadTemplates();
        
        // Se o template deletado estava selecionado, limpar seleção
        if (selectedTemplate?.id === templateId) {
          setSelectedTemplate(null);
        }
      } catch (error) {
        console.error('Erro ao deletar template:', error);
        alert('Não é possível deletar templates padrão');
      }
    }
  };

  const handleExportTemplates = () => {
    try {
      const customTemplates = templates.filter(t => 
        !t.id.startsWith('executive') && 
        !t.id.startsWith('detailed') && 
        !t.id.startsWith('minimal')
      );
      
      if (customTemplates.length === 0) {
        alert('Nenhum template customizado para exportar');
        return;
      }

      const jsonData = pdfTemplateService.exportTemplates(customTemplates.map(t => t.id));
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `finthrix-templates-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar templates:', error);
    }
  };

  const handleImportTemplates = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const result = pdfTemplateService.importTemplates(jsonData);
        
        if (result.success > 0) {
          alert(`${result.success} template(s) importado(s) com sucesso!`);
          loadTemplates();
        }
        
        if (result.errors.length > 0) {
          alert(`Erros encontrados:\n${result.errors.join('\n')}`);
        }
      } catch (error) {
        alert('Erro ao importar templates. Verifique o formato do arquivo.');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Selecionar Template PDF
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Import/Export */}
          <label className="cursor-pointer p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100">
            <Upload className="h-5 w-5" />
            <input
              type="file"
              accept=".json"
              onChange={handleImportTemplates}
              className="hidden"
            />
          </label>
          
          <button
            onClick={handleExportTemplates}
            className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100"
            title="Exportar templates customizados"
          >
            <Download className="h-5 w-5" />
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedTemplate?.id === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleTemplateSelect(template)}
            >
              {/* Selection Indicator */}
              {selectedTemplate?.id === template.id && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}

              {/* Template Preview */}
              <div className="mb-3">
                <div 
                  className="w-full h-32 rounded border-2 border-dashed border-gray-300 flex items-center justify-center"
                  style={{ backgroundColor: template.config.colors.background }}
                >
                  <div className="text-center">
                    <div 
                      className="text-xs font-medium mb-1"
                      style={{ color: template.config.colors.primary }}
                    >
                      {template.config.orientation === 'landscape' ? '📄' : '📋'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {template.config.format.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="mb-3">
                <h3 className="font-medium text-gray-900 mb-1">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {template.description}
                </p>
              </div>

              {/* Template Features */}
              <div className="flex flex-wrap gap-1 mb-3">
                {template.config.header.enabled && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    Cabeçalho
                  </span>
                )}
                {template.config.footer.enabled && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    Rodapé
                  </span>
                )}
                {template.config.content.showCharts && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    Gráficos
                  </span>
                )}
                {template.config.content.showDataTable && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    Tabelas
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateTemplate(template);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded"
                    title="Duplicar template"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  
                  {!template.id.startsWith('executive') && 
                   !template.id.startsWith('detailed') && 
                   !template.id.startsWith('minimal') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                      title="Excluir template"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <span className="text-xs text-gray-500">
                  {template.config.orientation} • {template.config.format}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600">
          {templates.length} template(s) disponível(is)
        </div>
        
        <div className="flex items-center space-x-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
          )}
          
          <button
            onClick={() => selectedTemplate && onTemplateSelect(selectedTemplate)}
            disabled={!selectedTemplate}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Usar Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFTemplateSelector;