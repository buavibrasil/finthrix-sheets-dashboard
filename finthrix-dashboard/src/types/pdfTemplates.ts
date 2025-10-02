export interface PDFTemplate {
  id: string;
  name: string;
  description: string;
  preview?: string;
  config: PDFTemplateConfig;
}

export interface PDFTemplateConfig {
  // Layout
  orientation: 'portrait' | 'landscape';
  format: 'a4' | 'a3' | 'letter' | 'legal';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  
  // Header
  header: {
    enabled: boolean;
    height: number;
    showLogo: boolean;
    showTitle: boolean;
    showDate: boolean;
    backgroundColor: string;
    textColor: string;
    fontSize: number;
  };
  
  // Footer
  footer: {
    enabled: boolean;
    height: number;
    showPageNumbers: boolean;
    showCompanyInfo: boolean;
    backgroundColor: string;
    textColor: string;
    fontSize: number;
  };
  
  // Content
  content: {
    showKPIs: boolean;
    showCharts: boolean;
    chartsPerRow: 1 | 2;
    chartHeight: number;
    showDataTable: boolean;
    fontSize: number;
    lineHeight: number;
  };
  
  // Colors and Styling
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
    border: string;
  };
  
  // Branding
  branding: {
    companyName: string;
    companyLogo?: string;
    companyAddress?: string;
    companyPhone?: string;
    companyEmail?: string;
  };
}

export const DEFAULT_PDF_TEMPLATES: PDFTemplate[] = [
  {
    id: 'executive',
    name: 'Executivo',
    description: 'Template limpo e profissional para relatórios executivos',
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
        companyName: 'FinThrix',
        companyAddress: 'São Paulo, SP',
        companyEmail: 'contato@finthrix.com'
      }
    }
  },
  {
    id: 'detailed',
    name: 'Detalhado',
    description: 'Template completo com todos os dados e gráficos',
    config: {
      orientation: 'landscape',
      format: 'a4',
      margins: { top: 15, right: 15, bottom: 15, left: 15 },
      header: {
        enabled: true,
        height: 50,
        showLogo: true,
        showTitle: true,
        showDate: true,
        backgroundColor: '#059669',
        textColor: '#ffffff',
        fontSize: 14
      },
      footer: {
        enabled: true,
        height: 30,
        showPageNumbers: true,
        showCompanyInfo: false,
        backgroundColor: '#ffffff',
        textColor: '#374151',
        fontSize: 9
      },
      content: {
        showKPIs: true,
        showCharts: true,
        chartsPerRow: 2,
        chartHeight: 180,
        showDataTable: true,
        fontSize: 10,
        lineHeight: 1.4
      },
      colors: {
        primary: '#059669',
        secondary: '#6b7280',
        accent: '#f59e0b',
        text: '#374151',
        background: '#ffffff',
        border: '#d1d5db'
      },
      branding: {
        companyName: 'FinThrix Analytics',
        companyAddress: 'São Paulo, SP - Brasil',
        companyPhone: '+55 (11) 9999-9999',
        companyEmail: 'analytics@finthrix.com'
      }
    }
  },
  {
    id: 'minimal',
    name: 'Minimalista',
    description: 'Template simples focado apenas nos dados essenciais',
    config: {
      orientation: 'portrait',
      format: 'a4',
      margins: { top: 30, right: 30, bottom: 30, left: 30 },
      header: {
        enabled: false,
        height: 0,
        showLogo: false,
        showTitle: false,
        showDate: false,
        backgroundColor: '#ffffff',
        textColor: '#000000',
        fontSize: 12
      },
      footer: {
        enabled: false,
        height: 0,
        showPageNumbers: false,
        showCompanyInfo: false,
        backgroundColor: '#ffffff',
        textColor: '#6b7280',
        fontSize: 8
      },
      content: {
        showKPIs: true,
        showCharts: true,
        chartsPerRow: 1,
        chartHeight: 250,
        showDataTable: false,
        fontSize: 14,
        lineHeight: 1.6
      },
      colors: {
        primary: '#000000',
        secondary: '#6b7280',
        accent: '#3b82f6',
        text: '#000000',
        background: '#ffffff',
        border: '#e5e7eb'
      },
      branding: {
        companyName: 'Dashboard Report'
      }
    }
  }
];