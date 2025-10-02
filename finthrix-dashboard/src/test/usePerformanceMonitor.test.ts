import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePerformanceMonitor, PerformanceCollector } from '../hooks/usePerformanceMonitor';

// Mock do performance.now()
const mockPerformanceNow = vi.fn();
Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow
  },
  writable: true
});

describe('usePerformanceMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
    // Limpa as métricas antes de cada teste
    const collector = PerformanceCollector.getInstance();
    collector.clearMetrics();
    // Reset maxMetrics para o valor padrão
    collector['maxMetrics'] = 100;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Timer functionality', () => {
    it('should start and end timers correctly', () => {
      const { result } = renderHook(() => 
        usePerformanceMonitor('TestComponent')
      );

      mockPerformanceNow.mockReturnValueOnce(100); // Start time
      act(() => {
        result.current.startTimer('testOperation');
      });

      mockPerformanceNow.mockReturnValueOnce(250); // End time
      act(() => {
        result.current.endTimer('testOperation');
      });

      const metrics = result.current.getComponentMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        componentName: 'TestComponent',
        operation: 'testOperation',
        duration: 150 // 250 - 100
      });
    });

    it('should handle missing timer gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const { result } = renderHook(() => 
        usePerformanceMonitor('TestComponent')
      );

      act(() => {
        result.current.endTimer('nonExistentOperation');
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Performance] Timer not found for operation: nonExistentOperation'
      );
      
      consoleSpy.mockRestore();
    });

    it('should respect threshold setting', () => {
      const { result } = renderHook(() => 
        usePerformanceMonitor('TestComponent', { threshold: 100 })
      );

      // Operação rápida (abaixo do threshold)
      mockPerformanceNow.mockReturnValueOnce(0);
      act(() => {
        result.current.startTimer('fastOperation');
      });

      mockPerformanceNow.mockReturnValueOnce(50); // 50ms duration
      act(() => {
        result.current.endTimer('fastOperation');
      });

      // Operação lenta (acima do threshold)
      mockPerformanceNow.mockReturnValueOnce(100);
      act(() => {
        result.current.startTimer('slowOperation');
      });

      mockPerformanceNow.mockReturnValueOnce(250); // 150ms duration
      act(() => {
        result.current.endTimer('slowOperation');
      });

      const metrics = result.current.getComponentMetrics();
      expect(metrics).toHaveLength(1); // Apenas a operação lenta deve ser registrada
      expect(metrics[0].operation).toBe('slowOperation');
    });
  });

  describe('Async measurement', () => {
    it('should measure async operations correctly', async () => {
      const { result } = renderHook(() => 
        usePerformanceMonitor('TestComponent')
      );

      const asyncOperation = vi.fn().mockResolvedValue('success');
      
      mockPerformanceNow.mockReturnValueOnce(100); // Start
      mockPerformanceNow.mockReturnValueOnce(300); // End

      const resultValue = await act(async () => {
        return await result.current.measureAsync('asyncTest', asyncOperation);
      });

      expect(resultValue).toBe('success');
      expect(asyncOperation).toHaveBeenCalledOnce();

      const metrics = result.current.getComponentMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        componentName: 'TestComponent',
        operation: 'asyncTest',
        duration: 200,
        metadata: { success: true }
      });
    });

    it('should handle async operation errors', async () => {
      const { result } = renderHook(() => 
        usePerformanceMonitor('TestComponent')
      );

      const error = new Error('Test error');
      const asyncOperation = vi.fn().mockRejectedValue(error);
      
      mockPerformanceNow.mockReturnValueOnce(100);
      mockPerformanceNow.mockReturnValueOnce(200);

      await expect(
        act(async () => {
          return await result.current.measureAsync('asyncError', asyncOperation);
        })
      ).rejects.toThrow('Test error');

      const metrics = result.current.getComponentMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        componentName: 'TestComponent',
        operation: 'asyncError',
        duration: 100,
        metadata: { 
          success: false, 
          error: 'Test error' 
        }
      });
    });
  });

  describe('Sync measurement', () => {
    it('should measure sync operations correctly', () => {
      const { result } = renderHook(() => 
        usePerformanceMonitor('TestComponent')
      );

      const syncOperation = vi.fn().mockReturnValue('sync result');
      
      mockPerformanceNow.mockReturnValueOnce(50);
      mockPerformanceNow.mockReturnValueOnce(150);

      const resultValue = act(() => {
        return result.current.measureSync('syncTest', syncOperation);
      });

      expect(resultValue).toBe('sync result');
      expect(syncOperation).toHaveBeenCalledOnce();

      const metrics = result.current.getComponentMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        componentName: 'TestComponent',
        operation: 'syncTest',
        duration: 100,
        metadata: { success: true }
      });
    });

    it('should handle sync operation errors', () => {
      const { result } = renderHook(() => 
        usePerformanceMonitor('TestComponent')
      );

      const error = new Error('Sync error');
      const syncOperation = vi.fn().mockImplementation(() => {
        throw error;
      });
      
      mockPerformanceNow.mockReturnValueOnce(0);
      mockPerformanceNow.mockReturnValueOnce(75);

      expect(() => {
        act(() => {
          result.current.measureSync('syncError', syncOperation);
        });
      }).toThrow('Sync error');

      const metrics = result.current.getComponentMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        componentName: 'TestComponent',
        operation: 'syncError',
        duration: 75,
        metadata: { 
          success: false, 
          error: 'Sync error' 
        }
      });
    });
  });

  describe('Metrics collection', () => {
    it('should collect and retrieve component metrics', () => {
      const { result } = renderHook(() => 
        usePerformanceMonitor('TestComponent', { threshold: 0 })
      );

      // Adiciona uma métrica
      mockPerformanceNow.mockReturnValueOnce(0);
      act(() => result.current.startTimer('testOp'));
      
      mockPerformanceNow.mockReturnValueOnce(150);
      act(() => result.current.endTimer('testOp'));

      // Verifica se a métrica foi coletada
      const metrics = result.current.getComponentMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        componentName: 'TestComponent',
        operation: 'testOp',
        duration: 150
      });
    });

    it('should calculate average times for operations', () => {
      const { result } = renderHook(() => 
        usePerformanceMonitor('TestComponent', { threshold: 0 })
      );

      // Adiciona primeira métrica: 100ms
      mockPerformanceNow.mockReturnValueOnce(0);
      act(() => result.current.startTimer('repeatedOp'));
      mockPerformanceNow.mockReturnValueOnce(100);
      act(() => result.current.endTimer('repeatedOp'));

      // Adiciona segunda métrica: 200ms
      mockPerformanceNow.mockReturnValueOnce(200);
      act(() => result.current.startTimer('repeatedOp'));
      mockPerformanceNow.mockReturnValueOnce(400);
      act(() => result.current.endTimer('repeatedOp'));

      const averageTime = result.current.getAverageTime('repeatedOp');
      expect(averageTime).toBe(150); // (100 + 200) / 2
    });
  });

  describe('Configuration options', () => {
    it('should respect enabled flag', () => {
      const { result } = renderHook(() => 
        usePerformanceMonitor('TestComponent', { enabled: false })
      );

      mockPerformanceNow.mockReturnValueOnce(0);
      act(() => result.current.startTimer('disabledTest'));
      
      mockPerformanceNow.mockReturnValueOnce(100);
      act(() => result.current.endTimer('disabledTest'));

      const metrics = result.current.getComponentMetrics();
      expect(metrics).toHaveLength(0); // Nenhuma métrica deve ser coletada
    });

    it('should respect maxMetrics configuration', () => {
      const { result } = renderHook(() => 
        usePerformanceMonitor('TestComponent', { maxMetrics: 2 })
      );

      // Adiciona 3 métricas (mais que o máximo)
      for (let i = 0; i < 3; i++) {
        mockPerformanceNow.mockReturnValueOnce(i * 100);
        act(() => result.current.startTimer(`op${i}`));
        
        mockPerformanceNow.mockReturnValueOnce(i * 100 + 50);
        act(() => result.current.endTimer(`op${i}`));
      }

      const allMetrics = result.current.collector.getMetrics();
      expect(allMetrics.length).toBeLessThanOrEqual(2); // Deve respeitar o limite
    });
  });
});