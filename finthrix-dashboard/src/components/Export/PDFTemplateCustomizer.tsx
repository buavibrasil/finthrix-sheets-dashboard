import React, { useState } from 'react';
import { PDFTemplate } from '@/types/pdfTemplates';
import { pdfTemplateService } from '@/services/pdfTemplateService';
import { 
  Save, 
  RotateCcw, 
  Eye, 
  Palette, 
  Layout, 
  Image,
  Settings,
  FileText,
  BarChart3,
  Table
} from 'lucide-react';

interface PDFTemplateCustomizerProps {
  template: PDFTemplate;
  onSave: (template: PDFTemplate) => void;
  onCancel: () => void;
}

export const PDFTemplateCustomizer: React.FC<PDFTemplateCustomizerProps> = ({
  template,
  onSave,
  onCancel
}) => {
  const [editedTemplate, setEditedTemplate] = useState<PDFTemplate>({ ...template });
  const [activeTab, setActiveTab] = useState<'layout' | 'content' | 'style' | 'branding'>('layout');
  const [previewMode, setPreviewMode] = useState(false);

  const updateConfig = (path: string, value: any) => {
    const keys = path.split('.');
    const newConfig = { ...editedTemplate.config };
    
    let current: any = newConfig;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setEditedTemplate({
      ...editedTemplate,
      config: newConfig
    });
  };

  const handleSave = () => {
    try {
      let savedTemplate: PDFTemplate | null = null;
      
      // Se o template já existe, atualiza; senão, cria um novo
      if (editedTemplate.id && editedTemplate.id.startsWith('custom_')) {
        savedTemplate = pdfTemplateService.updateTemplate(editedTemplate.id, editedTemplate);
      } else {
        // Cria um novo template customizado
        savedTemplate = pdfTemplateService.createTemplate({
          name: editedTemplate.name,
          description: editedTemplate.description,
          preview: editedTemplate.preview,
          config: editedTemplate.config
        });
      }
      
      if (savedTemplate) {
        onSave(savedTemplate);
      }
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      alert('Erro ao salvar template');
    }
  };

  const handleReset = () => {
    if (window.confirm('Descartar todas as alterações?')) {
      setEditedTemplate({ ...template });
    }
  };

  const tabs = [
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'content', label: 'Conteúdo', icon: FileText },
    { id: 'style', label: 'Estilo', icon: Palette },
    { id: 'branding', label: 'Marca', icon: Image }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Settings className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Customizar Template
            </h2>
            <p className="text-sm text-gray-600">
              {editedTemplate.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              previewMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </button>
          
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Salvar</span>
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Tabs */}
        <div className="w-64 border-r border-gray-200 bg-gray-50">
          <div className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {previewMode ? (
            /* Preview */
            <div className="p-6">
              <div className="bg-gray-100 rounded-lg p-8">
                <div 
                  className="bg-white shadow-lg mx-auto rounded-lg overflow-hidden"
                  style={{
                    width: editedTemplate.config.orientation === 'landscape' ? '400px' : '300px',
                    height: editedTemplate.config.orientation === 'landscape' ? '283px' : '400px',
                    backgroundColor: editedTemplate.config.colors.background
                  }}
                >
                  {/* Header Preview */}
                  {editedTemplate.config.header.enabled && (
                    <div 
                      className="p-4 border-b"
                      style={{ 
                        backgroundColor: editedTemplate.config.colors.primary,
                        color: editedTemplate.config.colors.text
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-sm">
                            {editedTemplate.config.branding.companyName || 'Empresa'}
                          </h3>
                          <p className="text-xs opacity-80">Relatório Financeiro</p>
                        </div>
                        {editedTemplate.config.branding.companyLogo && (
                          <div className="w-8 h-8 bg-white rounded opacity-80"></div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Content Preview */}
                  <div className="p-4 space-y-3">

                    {editedTemplate.config.content.showCharts && (
                      <div className="text-xs">
                        <h4 className="font-medium mb-1 flex items-center">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Gráficos
                        </h4>
                        <div className="h-16 bg-gray-100 rounded flex items-center justify-center">
                          <BarChart3 className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                    )}

                    {editedTemplate.config.content.showDataTable && (
                      <div className="text-xs">
                        <h4 className="font-medium mb-1 flex items-center">
                          <Table className="h-3 w-3 mr-1" />
                          Dados
                        </h4>
                        <div className="space-y-1">
                          <div className="h-1 bg-gray-200 rounded"></div>
                          <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-1 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Preview */}
                  {editedTemplate.config.footer.enabled && (
                    <div 
                      className="absolute bottom-0 left-0 right-0 p-2 border-t text-xs text-center"
                      style={{ color: editedTemplate.config.colors.secondary }}
                    >
                      Página 1 • {new Date().toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Configuration Forms */
            <div className="p-6">
              {activeTab === 'layout' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Configurações de Layout
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Formato
                        </label>
                        <select
                          value={editedTemplate.config.format}
                          onChange={(e) => updateConfig('format', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="a4">A4</option>
                          <option value="letter">Letter</option>
                          <option value="legal">Legal</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Orientação
                        </label>
                        <select
                          value={editedTemplate.config.orientation}
                          onChange={(e) => updateConfig('orientation', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="portrait">Retrato</option>
                          <option value="landscape">Paisagem</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Margens</h4>
                    <div className="grid grid-cols-4 gap-4">
                      {['top', 'right', 'bottom', 'left'].map((margin) => (
                        <div key={margin}>
                          <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                            {margin === 'top' ? 'Superior' : 
                             margin === 'right' ? 'Direita' :
                             margin === 'bottom' ? 'Inferior' : 'Esquerda'}
                          </label>
                          <input
                            type="number"
                            value={editedTemplate.config.margins[margin as keyof typeof editedTemplate.config.margins]}
                            onChange={(e) => updateConfig(`margins.${margin}`, parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                            max="100"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'content' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Elementos do Conteúdo
                    </h3>
                    
                    <div className="space-y-4">
                      {[
                        { key: 'showKPIs', label: 'KPIs', desc: 'Inclui indicadores chave de performance' },
                        { key: 'showCharts', label: 'Gráficos', desc: 'Inclui visualizações gráficas dos dados' },
                        { key: 'showDataTable', label: 'Tabela de Dados', desc: 'Inclui tabelas detalhadas com os dados' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                          <input
                            type="checkbox"
                            checked={editedTemplate.config.content[item.key as keyof typeof editedTemplate.config.content] as boolean}
                            onChange={(e) => updateConfig(`content.${item.key}`, e.target.checked)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div>
                            <label className="text-sm font-medium text-gray-900">
                              {item.label}
                            </label>
                            <p className="text-sm text-gray-600">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Cabeçalho e Rodapé</h4>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={editedTemplate.config.header.enabled}
                          onChange={(e) => updateConfig('header.enabled', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="text-sm font-medium text-gray-900">
                          Incluir Cabeçalho
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={editedTemplate.config.footer.enabled}
                          onChange={(e) => updateConfig('footer.enabled', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="text-sm font-medium text-gray-900">
                          Incluir Rodapé
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'style' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Cores e Tipografia
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-md font-medium text-gray-900">Cores</h4>
                        
                        {[
                          { key: 'primary', label: 'Cor Primária' },
                          { key: 'secondary', label: 'Cor Secundária' },
                          { key: 'accent', label: 'Cor de Destaque' },
                          { key: 'background', label: 'Fundo' },
                          { key: 'text', label: 'Texto' }
                        ].map((color) => (
                          <div key={color.key} className="flex items-center space-x-3">
                            <input
                              type="color"
                              value={editedTemplate.config.colors[color.key as keyof typeof editedTemplate.config.colors]}
                              onChange={(e) => updateConfig(`colors.${color.key}`, e.target.value)}
                              className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                            />
                            <label className="text-sm font-medium text-gray-700">
                              {color.label}
                            </label>
                          </div>
                        ))}
                      </div>
                      

                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'branding' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Identidade da Marca
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome da Empresa
                        </label>
                        <input
                          type="text"
                          value={editedTemplate.config.branding.companyName}
                          onChange={(e) => updateConfig('branding.companyName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Digite o nome da empresa"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Logo da Empresa
                        </label>
                        <input
                          type="url"
                          value={editedTemplate.config.branding.companyLogo || ''}
                          onChange={(e) => updateConfig('branding.companyLogo', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://exemplo.com/logo.png"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Endereço
                        </label>
                        <input
                          type="text"
                          value={editedTemplate.config.branding.companyAddress || ''}
                          onChange={(e) => updateConfig('branding.companyAddress', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Endereço da empresa"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telefone
                        </label>
                        <input
                          type="tel"
                          value={editedTemplate.config.branding.companyPhone || ''}
                          onChange={(e) => updateConfig('branding.companyPhone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="+55 (11) 9999-9999"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={editedTemplate.config.branding.companyEmail || ''}
                          onChange={(e) => updateConfig('branding.companyEmail', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="contato@empresa.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFTemplateCustomizer;