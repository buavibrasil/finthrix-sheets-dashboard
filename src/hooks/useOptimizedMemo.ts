import { useMemo, useRef } from 'react';

/**
 * Hook para memoização otimizada com cache inteligente
 * Evita recálculos desnecessários e melhora a performance
 */

/**
 * Hook para memoização de cálculos financeiros
 * Otimizado especificamente para dados financeiros que mudam com frequência
 * 
 * @param data - Dados de entrada
 * @param calculator - Função de cálculo
 * @param dependencies - Dependências adicionais
 * @returns Resultado memoizado
 */
export function useFinancialMemo<T, R>(
  data: T[],
  calculator: (data: T[]) => R,
  dependencies: any[] = []
): R {
  const cacheRef = useRef<Map<string, R>>(new Map());
  
  return useMemo(() => {
    // Criar chave de cache baseada nos dados e dependências
    const cacheKey = JSON.stringify({
      dataLength: data.length,
      dataHash: data.length > 0 ? JSON.stringify(data[0]) + JSON.stringify(data[data.length - 1]) : '',
      deps: dependencies
    });
    
    // Verificar se já temos o resultado em cache
    if (cacheRef.current.has(cacheKey)) {
      return cacheRef.current.get(cacheKey)!;
    }
    
    // Calcular novo resultado
    const result = calculator(data);
    
    // Armazenar no cache (limitar tamanho do cache)
    if (cacheRef.current.size > 10) {
      const firstKey = cacheRef.current.keys().next().value;
      cacheRef.current.delete(firstKey);
    }
    
    cacheRef.current.set(cacheKey, result);
    return result;
  }, [data, calculator, dependencies]);
}

/**
 * Hook para memoização de filtros
 * Otimizado para operações de filtro que podem ser custosas
 * 
 * @param data - Array de dados para filtrar
 * @param filters - Objeto com filtros aplicados
 * @param filterFunction - Função de filtro
 * @returns Dados filtrados memoizados
 */
export function useFilteredMemo<T>(
  data: T[],
  filters: Record<string, any>,
  filterFunction: (item: T, filters: Record<string, any>) => boolean
): T[] {
  return useMemo(() => {
    // Se não há filtros ativos, retornar dados originais
    const activeFilters = Object.entries(filters).filter(([_, value]) => 
      value !== '' && value !== 'all' && value !== null && value !== undefined
    );
    
    if (activeFilters.length === 0) {
      return data;
    }
    
    // Aplicar filtros
    return data.filter(item => filterFunction(item, filters));
  }, [data, filters, filterFunction]);
}

/**
 * Hook para memoização de agrupamentos
 * Otimizado para operações de agrupamento de dados
 * 
 * @param data - Array de dados para agrupar
 * @param groupBy - Função ou chave para agrupamento
 * @returns Dados agrupados memoizados
 */
export function useGroupedMemo<T, K extends string | number>(
  data: T[],
  groupBy: ((item: T) => K) | keyof T
): Record<K, T[]> {
  return useMemo(() => {
    const groupFunction = typeof groupBy === 'function' 
      ? groupBy 
      : (item: T) => item[groupBy] as K;
    
    return data.reduce((acc, item) => {
      const key = groupFunction(item);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<K, T[]>);
  }, [data, groupBy]);
}

/**
 * Hook para memoização de cálculos agregados
 * Otimizado para somas, médias e outros cálculos agregados
 * 
 * @param data - Array de dados
 * @param aggregations - Objeto com funções de agregação
 * @returns Resultados agregados memoizados
 */
export function useAggregatedMemo<T>(
  data: T[],
  aggregations: Record<string, (data: T[]) => number>
): Record<string, number> {
  return useMemo(() => {
    const results: Record<string, number> = {};
    
    for (const [key, aggregateFunction] of Object.entries(aggregations)) {
      results[key] = aggregateFunction(data);
    }
    
    return results;
  }, [data, aggregations]);
}