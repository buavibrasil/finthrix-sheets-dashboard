import { PDFTemplate, DEFAULT_PDF_TEMPLATES } from '@/types/pdfTemplates';

class PDFTemplateService {
  private templates: PDFTemplate[] = [...DEFAULT_PDF_TEMPLATES];
  private storageKey = 'finthrix_pdf_templates';

  constructor() {
    this.loadTemplatesFromStorage();
  }

  /**
   * Carrega templates do localStorage
   */
  private loadTemplatesFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const customTemplates = JSON.parse(stored);
        // Mescla templates padrão com customizados
        this.templates = [
          ...DEFAULT_PDF_TEMPLATES,
          ...customTemplates.filter((t: PDFTemplate) => 
            !DEFAULT_PDF_TEMPLATES.some(dt => dt.id === t.id)
          )
        ];
      }
    } catch (error) {
      console.warn('Erro ao carregar templates do localStorage:', error);
    }
  }

  /**
   * Salva templates customizados no localStorage
   */
  private saveTemplatesToStorage(): void {
    try {
      const customTemplates = this.templates.filter(t => 
        !DEFAULT_PDF_TEMPLATES.some(dt => dt.id === t.id)
      );
      localStorage.setItem(this.storageKey, JSON.stringify(customTemplates));
    } catch (error) {
      console.warn('Erro ao salvar templates no localStorage:', error);
    }
  }

  /**
   * Retorna todos os templates disponíveis
   */
  getAllTemplates(): PDFTemplate[] {
    return [...this.templates];
  }

  /**
   * Retorna um template por ID
   */
  getTemplateById(id: string): PDFTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  /**
   * Cria um novo template customizado
   */
  createTemplate(template: Omit<PDFTemplate, 'id'>): PDFTemplate {
    const newTemplate: PDFTemplate = {
      ...template,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.templates.push(newTemplate);
    this.saveTemplatesToStorage();
    
    return newTemplate;
  }

  /**
   * Atualiza um template existente
   */
  updateTemplate(id: string, updates: Partial<PDFTemplate>): PDFTemplate | null {
    const index = this.templates.findIndex(t => t.id === id);
    
    if (index === -1) {
      return null;
    }

    // Não permite editar templates padrão
    const isDefaultTemplate = DEFAULT_PDF_TEMPLATES.some(dt => dt.id === id);
    if (isDefaultTemplate) {
      throw new Error('Templates padrão não podem ser editados');
    }

    this.templates[index] = { ...this.templates[index], ...updates };
    this.saveTemplatesToStorage();
    
    return this.templates[index];
  }

  /**
   * Remove um template customizado
   */
  deleteTemplate(id: string): boolean {
    // Não permite deletar templates padrão
    const isDefaultTemplate = DEFAULT_PDF_TEMPLATES.some(dt => dt.id === id);
    if (isDefaultTemplate) {
      throw new Error('Templates padrão não podem ser removidos');
    }

    const index = this.templates.findIndex(t => t.id === id);
    
    if (index === -1) {
      return false;
    }

    this.templates.splice(index, 1);
    this.saveTemplatesToStorage();
    
    return true;
  }

  /**
   * Duplica um template existente
   */
  duplicateTemplate(id: string, newName?: string): PDFTemplate | null {
    const originalTemplate = this.getTemplateById(id);
    
    if (!originalTemplate) {
      return null;
    }

    const duplicatedTemplate = this.createTemplate({
      name: newName || `${originalTemplate.name} (Cópia)`,
      description: `Cópia de ${originalTemplate.description}`,
      preview: originalTemplate.preview,
      config: JSON.parse(JSON.stringify(originalTemplate.config)) // Deep clone
    });

    return duplicatedTemplate;
  }

  /**
   * Valida se um template está correto
   */
  validateTemplate(template: PDFTemplate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!template.name || template.name.trim().length === 0) {
      errors.push('Nome do template é obrigatório');
    }

    if (!template.config) {
      errors.push('Configuração do template é obrigatória');
      return { isValid: false, errors };
    }

    const { config } = template;

    // Validar margens
    if (config.margins.top < 0 || config.margins.right < 0 || 
        config.margins.bottom < 0 || config.margins.left < 0) {
      errors.push('Margens não podem ser negativas');
    }

    // Validar cores
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    Object.entries(config.colors).forEach(([key, color]) => {
      if (!colorRegex.test(color)) {
        errors.push(`Cor ${key} inválida: ${color}`);
      }
    });

    // Validar tamanhos de fonte
    if (config.header.fontSize < 8 || config.header.fontSize > 24) {
      errors.push('Tamanho da fonte do cabeçalho deve estar entre 8 e 24');
    }

    if (config.footer.fontSize < 6 || config.footer.fontSize > 16) {
      errors.push('Tamanho da fonte do rodapé deve estar entre 6 e 16');
    }

    if (config.content.fontSize < 8 || config.content.fontSize > 20) {
      errors.push('Tamanho da fonte do conteúdo deve estar entre 8 e 20');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Exporta templates para JSON
   */
  exportTemplates(templateIds?: string[]): string {
    const templatesToExport = templateIds 
      ? this.templates.filter(t => templateIds.includes(t.id))
      : this.templates.filter(t => !DEFAULT_PDF_TEMPLATES.some(dt => dt.id === t.id));

    return JSON.stringify(templatesToExport, null, 2);
  }

  /**
   * Importa templates de JSON
   */
  importTemplates(jsonData: string): { success: number; errors: string[] } {
    const errors: string[] = [];
    let success = 0;

    try {
      const templates: PDFTemplate[] = JSON.parse(jsonData);
      
      if (!Array.isArray(templates)) {
        throw new Error('Dados devem ser um array de templates');
      }

      templates.forEach((template, index) => {
        try {
          const validation = this.validateTemplate(template);
          
          if (!validation.isValid) {
            errors.push(`Template ${index + 1}: ${validation.errors.join(', ')}`);
            return;
          }

          // Gerar novo ID para evitar conflitos
          const newTemplate = {
            ...template,
            id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          };

          this.templates.push(newTemplate);
          success++;
        } catch (error) {
          errors.push(`Template ${index + 1}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      });

      if (success > 0) {
        this.saveTemplatesToStorage();
      }
    } catch (error) {
      errors.push(`Erro ao processar JSON: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }

    return { success, errors };
  }

  /**
   * Reseta para templates padrão
   */
  resetToDefaults(): void {
    this.templates = [...DEFAULT_PDF_TEMPLATES];
    localStorage.removeItem(this.storageKey);
  }
}

// Singleton instance
export const pdfTemplateService = new PDFTemplateService();
export default pdfTemplateService;