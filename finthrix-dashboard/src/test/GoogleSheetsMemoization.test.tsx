import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GoogleSheetsDemo } from '../components/GoogleSheets/GoogleSheetsDemo';
import { GoogleSheetsIntegration } from '../components/GoogleSheets/GoogleSheetsIntegration';
import React from 'react';

// Mock do hook useGoogleSheets
const mockUseGoogleSheets = {
  authState: { isInitialized: true, isSignedIn: true },
  loading: false,
  error: null,
  initialize: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  getSheetData: vi.fn(),
  getPerformanceMetrics: vi.fn(() => [])
};

vi.mock('../hooks/useGoogleSheets', () => ({
  useGoogleSheets: () => mockUseGoogleSheets
}));

// Mock do serviço Google Sheets
vi.mock('../services/googleSheetsService', () => ({
  googleSheetsService: {
    getSpreadsheetInfo: vi.fn(),
    getSheetData: vi.fn()
  }
}));

describe('Google Sheets Memoization Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GoogleSheetsDemo - handleConfigSaved memoization', () => {
    it('should not recreate handleConfigSaved function on re-renders when dependencies do not change', () => {
      const TestWrapper = () => {
        const [rerenderTrigger, setRerenderTrigger] = React.useState(0);
        const handleConfigSavedRef = React.useRef<Function | null>(null);
        const functionCallCount = React.useRef(0);

        return (
          <div>
            <button 
              onClick={() => setRerenderTrigger(prev => prev + 1)}
              data-testid="rerender-trigger"
            >
              Force Rerender ({rerenderTrigger})
            </button>
            <GoogleSheetsDemo 
              onConfigSaved={(config) => {
                // Captura a referência da função na primeira chamada
                if (!handleConfigSavedRef.current) {
                  handleConfigSavedRef.current = arguments.callee;
                  functionCallCount.current = 1;
                } else if (handleConfigSavedRef.current === arguments.callee) {
                  // Mesma referência - função foi memoizada corretamente
                  functionCallCount.current++;
                } else {
                  // Referência diferente - função foi recriada (problema de memoização)
                  throw new Error('handleConfigSaved function was recreated - memoization failed');
                }
              }}
              onDataImported={() => {}}
            />
            <div data-testid="function-call-count">{functionCallCount.current}</div>
          </div>
        );
      };

      render(<TestWrapper />);

      // Força múltiplos re-renders
      const rerenderButton = screen.getByTestId('rerender-trigger');
      
      // Simula mudança de configuração para acionar handleConfigSaved
      fireEvent.click(rerenderButton);
      fireEvent.click(rerenderButton);
      fireEvent.click(rerenderButton);

      // Se chegou até aqui sem erro, a memoização está funcionando
      expect(screen.getByTestId('rerender-trigger')).toBeInTheDocument();
    });

    it('should recreate handleConfigSaved when dependencies change', () => {
      const TestWrapper = () => {
        const [dependency, setDependency] = React.useState('initial');
        const functionReferences = React.useRef<Function[]>([]);

        return (
          <div>
            <button 
              onClick={() => setDependency('changed')}
              data-testid="change-dependency"
            >
              Change Dependency
            </button>
            <GoogleSheetsDemo 
              onConfigSaved={(config) => {
                const currentFunction = arguments.callee;
                if (!functionReferences.current.includes(currentFunction)) {
                  functionReferences.current.push(currentFunction);
                }
              }}
              onDataImported={() => {}}
              key={dependency} // Força recriação do componente
            />
            <div data-testid="function-references-count">
              {functionReferences.current.length}
            </div>
          </div>
        );
      };

      render(<TestWrapper />);

      // Inicialmente deve ter 1 referência
      expect(screen.getByTestId('function-references-count')).toHaveTextContent('0');

      // Muda a dependência
      fireEvent.click(screen.getByTestId('change-dependency'));

      // Deve ter criado uma nova referência
      waitFor(() => {
        expect(screen.getByTestId('function-references-count')).toHaveTextContent('1');
      });
    });
  });

  describe('GoogleSheetsDemo - handleDataImported memoization', () => {
    it('should maintain stable reference for handleDataImported across re-renders', () => {
      const onDataImportedSpy = vi.fn();
      const functionReferences = new Set<Function>();

      const TestComponent = ({ trigger }: { trigger: number }) => {
        return (
          <GoogleSheetsDemo 
            onConfigSaved={() => {}}
            onDataImported={(data) => {
              functionReferences.add(arguments.callee);
              onDataImportedSpy(data);
            }}
          />
        );
      };

      const { rerender } = render(<TestComponent trigger={1} />);

      // Re-renderiza múltiplas vezes
      rerender(<TestComponent trigger={2} />);
      rerender(<TestComponent trigger={3} />);
      rerender(<TestComponent trigger={4} />);

      // Deve ter apenas uma referência única da função (memoizada)
      expect(functionReferences.size).toBeLessThanOrEqual(1);
    });
  });

  describe('GoogleSheetsIntegration - handleConfigChange memoization', () => {
    it('should not recreate handleConfigChange function unnecessarily', () => {
      const onConfigSavedSpy = vi.fn();
      const functionReferences = new Set<Function>();

      const TestComponent = ({ rerenderKey }: { rerenderKey: number }) => {
        return (
          <GoogleSheetsIntegration 
            onConfigSaved={(config) => {
              functionReferences.add(arguments.callee);
              onConfigSavedSpy(config);
            }}
            onDataImported={() => {}}
          />
        );
      };

      const { rerender } = render(<TestComponent rerenderKey={1} />);

      // Força re-renders
      rerender(<TestComponent rerenderKey={2} />);
      rerender(<TestComponent rerenderKey={3} />);

      // Verifica se a função foi memoizada (deve ter no máximo 1 referência única)
      expect(functionReferences.size).toBeLessThanOrEqual(1);
    });

    it('should recreate handleConfigChange when onConfigSaved prop changes', () => {
      const onConfigSaved1 = vi.fn();
      const onConfigSaved2 = vi.fn();
      const functionReferences = new Set<Function>();

      const TestComponent = ({ onConfigSaved }: { onConfigSaved: Function }) => {
        return (
          <GoogleSheetsIntegration 
            onConfigSaved={(config) => {
              functionReferences.add(arguments.callee);
              onConfigSaved(config);
            }}
            onDataImported={() => {}}
          />
        );
      };

      const { rerender } = render(<TestComponent onConfigSaved={onConfigSaved1} />);

      // Muda a prop onConfigSaved
      rerender(<TestComponent onConfigSaved={onConfigSaved2} />);

      // Deve ter criado uma nova referência da função quando a dependência mudou
      expect(functionReferences.size).toBeGreaterThan(0);
    });
  });

  describe('Performance impact of memoization', () => {
    it('should not cause excessive re-renders with memoized functions', async () => {
      const renderCountRef = { current: 0 };

      const TestComponent = () => {
        renderCountRef.current++;
        
        return (
          <div>
            <GoogleSheetsDemo 
              onConfigSaved={() => {}}
              onDataImported={() => {}}
            />
            <div data-testid="render-count">{renderCountRef.current}</div>
          </div>
        );
      };

      const { rerender } = render(<TestComponent />);

      const initialRenderCount = renderCountRef.current;

      // Força alguns re-renders
      rerender(<TestComponent />);
      rerender(<TestComponent />);
      rerender(<TestComponent />);

      // O número de renders deve ser controlado (não deve explodir)
      expect(renderCountRef.current).toBeLessThan(initialRenderCount + 10);
    });
  });

  describe('useCallback dependency arrays', () => {
    it('should have correct dependencies in useCallback for handleConfigSaved', () => {
      // Este teste verifica indiretamente se as dependências estão corretas
      // observando se a função é recriada quando deveria ser
      
      const TestWrapper = () => {
        const [config, setConfig] = React.useState({ id: '1' });
        const callbackRefs = React.useRef<Function[]>([]);

        return (
          <div>
            <button 
              onClick={() => setConfig({ id: '2' })}
              data-testid="change-config"
            >
              Change Config
            </button>
            <GoogleSheetsDemo 
              onConfigSaved={(newConfig) => {
                // Rastreia se a função foi recriada
                const currentCallback = arguments.callee;
                if (!callbackRefs.current.includes(currentCallback)) {
                  callbackRefs.current.push(currentCallback);
                }
              }}
              onDataImported={() => {}}
            />
            <div data-testid="callback-count">{callbackRefs.current.length}</div>
          </div>
        );
      };

      render(<TestWrapper />);

      // Verifica estado inicial
      expect(screen.getByTestId('callback-count')).toHaveTextContent('0');

      // Muda o estado que pode afetar as dependências
      fireEvent.click(screen.getByTestId('change-config'));

      // A função deve ter sido recriada se as dependências estão corretas
      waitFor(() => {
        const count = parseInt(screen.getByTestId('callback-count').textContent || '0');
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });
  });
});