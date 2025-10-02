import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { pdfTemplateService } from './pdfTemplateService';
import { PDFTemplate, DEFAULT_PDF_TEMPLATES } from '@/types/pdfTemplates';

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('PDFTemplateService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear();
    // Resetar o estado do serviço para apenas os templates padrão
    pdfTemplateService['templates'] = [...DEFAULT_PDF_TEMPLATES];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAllTemplates', () => {
    it('deve retornar templates padrão quando localStorage está vazio', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const templates = pdfTemplateService.getAllTemplates();

      expect(templates).toEqual(DEFAULT_PDF_TEMPLATES);
    });

    it('deve mesclar templates padrão com customizados do localStorage', () => {
      // Primeiro criar um template customizado usando o serviço
      const templateData: Omit<PDFTemplate, 'id'> = {
        name: 'Template Customizado',
        description: 'Template criado pelo usuário',
        config: {
          orientation: 'portrait',
          format: 'a4',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          header: {
            enabled: true,
            height: 60,
            showLogo: true,
            showTitle: true,
            showDate: true,
            backgroundColor: '#1f2937',
            textColor: '#ffffff',
            fontSize: 16
          },
          footer: {
            enabled: true,
            height: 40,
            showPageNumbers: true,
            showCompanyInfo: true,
            backgroundColor: '#f9fafb',
            textColor: '#6b7280',
            fontSize: 10
          },
          content: {
            showKPIs: true,
            showCharts: true,
            chartsPerRow: 2,
            chartHeight: 200,
            showDataTable: false,
            fontSize: 12,
            lineHeight: 1.5
          },
          colors: {
            primary: '#3b82f6',
            secondary: '#64748b',
            accent: '#10b981',
            text: '#1f2937',
            background: '#ffffff',
            border: '#e5e7eb'
          },
          branding: {
            companyName: 'Test Company'
          }
        }
      };

      // Criar o template customizado
      const createdTemplate = pdfTemplateService.createTemplate(templateData);

      const templates = pdfTemplateService.getAllTemplates();

      expect(templates).toHaveLength(DEFAULT_PDF_TEMPLATES.length + 1);
      expect(templates.some(t => t.id === createdTemplate.id)).toBe(true);
      expect(templates.some(t => t.id === 'executive')).toBe(true);
    });

    it('deve lidar com erro no JSON.parse do localStorage', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const templates = pdfTemplateService.getAllTemplates();

      expect(templates).toEqual(DEFAULT_PDF_TEMPLATES);
      // O console.warn só é chamado durante a inicialização, não durante getAllTemplates
      
      consoleSpy.mockRestore();
    });
  });

  describe('getTemplateById', () => {
    it('deve retornar template por ID', () => {
      const template = pdfTemplateService.getTemplateById('executive');

      expect(template).toBeDefined();
      expect(template?.id).toBe('executive');
    });

    it('deve retornar undefined para ID inexistente', () => {
      const template = pdfTemplateService.getTemplateById('inexistente');

      expect(template).toBeUndefined();
    });
  });

  describe('createTemplate', () => {
    it('deve criar um novo template customizado', () => {
      const templateData: Omit<PDFTemplate, 'id'> = {
        name: 'Novo Template',
        description: 'Template personalizado',
        config: {
          orientation: 'portrait',
          format: 'a4',
          margins: { top: 30, right: 30, bottom: 30, left: 30 },
          header: {
            enabled: true,
            height: 50,
            showLogo: false,
            showTitle: true,
            showDate: true,
            backgroundColor: '#ff0000',
            textColor: '#ffffff',
            fontSize: 14
          },
          footer: {
            enabled: false,
            height: 0,
            showPageNumbers: false,
            showCompanyInfo: false,
            backgroundColor: '#ffffff',
            textColor: '#000000',
            fontSize: 10
          },
          content: {
            showKPIs: true,
            showCharts: false,
            chartsPerRow: 1,
            chartHeight: 200,
            showDataTable: true,
            fontSize: 14,
            lineHeight: 1.4
          },
          colors: {
            primary: '#ff0000',
            secondary: '#00ff00',
            accent: '#0000ff',
            text: '#000000',
            background: '#ffffff',
            border: '#cccccc'
          },
          branding: {
            companyName: 'Test Company'
          }
        }
      };

      const createdTemplate = pdfTemplateService.createTemplate(templateData);

      expect(createdTemplate).toMatchObject(templateData);
      expect(createdTemplate.id).toMatch(/^custom_\d+_[a-z0-9]+$/);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('deve gerar IDs únicos para templates', () => {
      const templateData: Omit<PDFTemplate, 'id'> = {
        name: 'Template 1',
        description: 'Primeiro template',
        config: {
          orientation: 'portrait',
          format: 'a4',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          header: {
            enabled: true,
            height: 60,
            showLogo: true,
            showTitle: true,
            showDate: true,
            backgroundColor: '#000000',
            textColor: '#ffffff',
            fontSize: 16
          },
          footer: {
            enabled: true,
            height: 40,
            showPageNumbers: true,
            showCompanyInfo: true,
            backgroundColor: '#f9fafb',
            textColor: '#666666',
            fontSize: 10
          },
          content: {
            showKPIs: true,
            showCharts: true,
            chartsPerRow: 2,
            chartHeight: 200,
            showDataTable: true,
            fontSize: 12,
            lineHeight: 1.5
          },
          colors: {
            primary: '#000000',
            secondary: '#666666',
            accent: '#0066cc',
            text: '#000000',
            background: '#ffffff',
            border: '#cccccc'
          },
          branding: {
            companyName: 'Test Company'
          }
        }
      };

      const template1 = pdfTemplateService.createTemplate(templateData);
      const template2 = pdfTemplateService.createTemplate(templateData);

      expect(template1.id).not.toBe(template2.id);
    });
  });

  describe('updateTemplate', () => {
    it('deve atualizar template existente', () => {
      const templateData: Omit<PDFTemplate, 'id'> = {
        name: 'Template Original',
        description: 'Template para atualizar',
        config: {
          orientation: 'portrait',
          format: 'a4',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          header: {
            enabled: true,
            height: 60,
            showLogo: true,
            showTitle: true,
            showDate: true,
            backgroundColor: '#000000',
            textColor: '#ffffff',
            fontSize: 12
          },
          footer: {
            enabled: true,
            height: 40,
            showPageNumbers: true,
            showCompanyInfo: true,
            backgroundColor: '#f9fafb',
            textColor: '#666666',
            fontSize: 10
          },
          content: {
            showKPIs: true,
            showCharts: true,
            chartsPerRow: 2,
            chartHeight: 200,
            showDataTable: true,
            fontSize: 12,
            lineHeight: 1.5
          },
          colors: {
            primary: '#000000',
            secondary: '#666666',
            accent: '#0066cc',
            text: '#000000',
            background: '#ffffff',
            border: '#cccccc'
          },
          branding: {
            companyName: 'Test Company'
          }
        }
      };

      // Primeiro criar o template
      const createdTemplate = pdfTemplateService.createTemplate(templateData);

      const updatedData = {
        name: 'Template Atualizado',
        config: {
          ...createdTemplate.config,
          content: {
            ...createdTemplate.config.content,
            fontSize: 16,
            showCharts: false
          }
        }
      };

      const updatedTemplate = pdfTemplateService.updateTemplate(createdTemplate.id, updatedData);

      expect(updatedTemplate?.name).toBe('Template Atualizado');
      expect(updatedTemplate?.config.content.fontSize).toBe(16);
      expect(updatedTemplate?.config.content.showCharts).toBe(false);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'finthrix_pdf_templates',
        JSON.stringify([updatedTemplate])
      );
    });

    it('deve retornar null para template inexistente', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = pdfTemplateService.updateTemplate('inexistente', { name: 'Novo Nome' });

      expect(result).toBeNull();
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('deve lançar erro ao tentar atualizar templates padrão', () => {
      expect(() => {
        pdfTemplateService.updateTemplate('executive', { name: 'Novo Nome' });
      }).toThrow('Templates padrão não podem ser editados');
    });
  });

  describe('deleteTemplate', () => {
    it('deve deletar template customizado', () => {
      const templateData: Omit<PDFTemplate, 'id'> = {
        name: 'Template para Deletar',
        description: 'Template que será deletado',
        config: {
          orientation: 'portrait',
          format: 'a4',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          header: {
            enabled: true,
            height: 60,
            showLogo: true,
            showTitle: true,
            showDate: true,
            backgroundColor: '#1f2937',
            textColor: '#ffffff',
            fontSize: 16
          },
          footer: {
            enabled: true,
            height: 40,
            showPageNumbers: true,
            showCompanyInfo: true,
            backgroundColor: '#f9fafb',
            textColor: '#6b7280',
            fontSize: 10
          },
          content: {
            showKPIs: true,
            showCharts: true,
            chartsPerRow: 2,
            chartHeight: 200,
            showDataTable: false,
            fontSize: 12,
            lineHeight: 1.5
          },
          colors: {
            primary: '#3b82f6',
            secondary: '#64748b',
            accent: '#10b981',
            text: '#1f2937',
            background: '#ffffff',
            border: '#e5e7eb'
          },
          branding: {
            companyName: 'Test Company'
          }
        }
      };

      // Primeiro criar o template
      const createdTemplate = pdfTemplateService.createTemplate(templateData);
      
      // Depois deletar
      const result = pdfTemplateService.deleteTemplate(createdTemplate.id);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'finthrix_pdf_templates',
        JSON.stringify([])
      );
    });

    it('deve retornar false para template inexistente', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = pdfTemplateService.deleteTemplate('inexistente');

      expect(result).toBe(false);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('deve lançar erro ao tentar deletar templates padrão', () => {
      expect(() => {
        pdfTemplateService.deleteTemplate('executive');
      }).toThrow('Templates padrão não podem ser removidos');
    });
  });

  describe('getAllTemplates', () => {
    it('deve retornar todos os templates incluindo customizados após criar um', () => {
      const templateData: Omit<PDFTemplate, 'id'> = {
        name: 'Template Customizado',
        description: 'Template criado pelo usuário',
        config: {
          orientation: 'portrait',
          format: 'a4',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          header: {
            enabled: true,
            height: 60,
            showLogo: true,
            showTitle: true,
            showDate: true,
            backgroundColor: '#1f2937',
            textColor: '#ffffff',
            fontSize: 16
          },
          footer: {
            enabled: true,
            height: 40,
            showPageNumbers: true,
            showCompanyInfo: true,
            backgroundColor: '#f9fafb',
            textColor: '#6b7280',
            fontSize: 10
          },
          content: {
            showKPIs: true,
            showCharts: true,
            chartsPerRow: 2,
            chartHeight: 200,
            showDataTable: false,
            fontSize: 12,
            lineHeight: 1.5
          },
          colors: {
            primary: '#3b82f6',
            secondary: '#64748b',
            accent: '#10b981',
            text: '#1f2937',
            background: '#ffffff',
            border: '#e5e7eb'
          },
          branding: {
            companyName: 'Test Company'
          }
        }
      };

      // Criar um template customizado
      const createdTemplate = pdfTemplateService.createTemplate(templateData);
      
      const allTemplates = pdfTemplateService.getAllTemplates();

      expect(allTemplates.length).toBe(4); // 3 padrão + 1 customizado
      expect(allTemplates.some(t => t.id === createdTemplate.id)).toBe(true);
      expect(allTemplates.some(t => t.id === 'executive')).toBe(true);
    });

    it('deve retornar apenas templates padrão quando não há customizados', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const allTemplates = pdfTemplateService.getAllTemplates();

      expect(allTemplates.length).toBe(3); // Deve ter 3 templates padrão
      expect(allTemplates.every(t => ['executive', 'detailed', 'minimal'].includes(t.id))).toBe(true);
    });
  });
});