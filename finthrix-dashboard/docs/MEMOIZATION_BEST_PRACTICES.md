# Guia de Melhores Práticas para Memoização

## Introdução

Este guia estabelece as melhores práticas para implementação de memoização no Finthrix Dashboard, baseado nas lições aprendidas durante a otimização do sistema Google Sheets.

## Princípios Fundamentais

### 1. Memoize com Propósito
- **Faça**: Memoize apenas quando há benefício real de performance
- **Não faça**: Memoize por padrão sem análise prévia
- **Razão**: Memoização tem overhead de memória e complexidade

### 2. Dependências Corretas
- **Faça**: Inclua todas as dependências necessárias
- **Não faça**: Omita dependências para "forçar" estabilidade
- **Razão**: Dependências incorretas causam bugs sutis

### 3. Medição Antes da Otimização
- **Faça**: Use ferramentas de profiling antes de otimizar
- **Não faça**: Otimize baseado em suposições
- **Razão**: Otimização prematura pode piorar a performance

## useCallback - Quando e Como Usar

### ✅ Casos Apropriados

#### 1. Event Handlers Passados como Props
```typescript
// ✅ BOM: Evita re-render de componentes filhos
const handleSubmit = useCallback((data: FormData) => {
  onSubmit(data);
}, [onSubmit]);

return <ExpensiveChild onSubmit={handleSubmit} />;
```

#### 2. Dependências de Outros Hooks
```typescript
// ✅ BOM: Evita loops infinitos em useEffect
const fetchData = useCallback(async () => {
  const result = await api.getData();
  setData(result);
}, [api]);

useEffect(() => {
  fetchData();
}, [fetchData]); // fetchData é estável
```

#### 3. Funções Custosas Computacionalmente
```typescript
// ✅ BOM: Evita recálculos desnecessários
const processLargeDataset = useCallback((rawData: any[]) => {
  return rawData
    .filter(item => item.isValid)
    .map(item => complexTransformation(item))
    .sort((a, b) => expensiveComparison(a, b));
}, []);
```

### ❌ Casos Inapropriados

#### 1. Funções Simples Não Passadas como Props
```typescript
// ❌ RUIM: Overhead desnecessário
const handleClick = useCallback(() => {
  console.log('clicked');
}, []);

// ✅ BOM: Função simples sem memoização
const handleClick = () => {
  console.log('clicked');
};
```

#### 2. Dependências que Mudam Frequentemente
```typescript
// ❌ RUIM: Callback recriado constantemente
const handleSearch = useCallback((query: string) => {
  search(query, filters, sortBy, page, limit);
}, [filters, sortBy, page, limit]); // Mudam frequentemente

// ✅ BOM: Use ref para valores que mudam frequentemente
const filtersRef = useRef(filters);
filtersRef.current = filters;

const handleSearch = useCallback((query: string) => {
  search(query, filtersRef.current);
}, []);
```

#### 3. Callbacks Inline Simples
```typescript
// ❌ RUIM: Complexidade desnecessária
const handleToggle = useCallback(() => setIsOpen(!isOpen), [isOpen]);

// ✅ BOM: Use função de atualização
const handleToggle = () => setIsOpen(prev => !prev);
```

## Padrões de Implementação

### 1. Event Handlers com Props
```typescript
interface ComponentProps {
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

function MyComponent({ onSave, onCancel }: ComponentProps) {
  // ✅ Memoize callbacks que são passados como props
  const handleSave = useCallback((data: any) => {
    // Validação local
    if (validateData(data)) {
      onSave?.(data);
    }
  }, [onSave]);

  const handleCancel = useCallback(() => {
    // Lógica de limpeza local
    resetForm();
    onCancel?.();
  }, [onCancel]);

  return (
    <Form onSave={handleSave} onCancel={handleCancel} />
  );
}
```

### 2. Hooks Customizados
```typescript
function useDataFetcher(url: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Memoize função retornada pelo hook
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetch(url);
      setData(await result.json());
    } finally {
      setLoading(false);
    }
  }, [url]);

  return { data, loading, fetchData };
}
```

### 3. Integrações com Serviços
```typescript
function useGoogleSheets() {
  // ✅ Memoize operações de serviço
  const initialize = useCallback(async () => {
    await googleSheetsService.initialize();
  }, []);

  const signIn = useCallback(async () => {
    await googleSheetsService.signIn();
  }, []);

  // ✅ Memoize com dependências corretas
  const getSheetData = useCallback(async (sheetId: string) => {
    return await googleSheetsService.getSheetData(sheetId);
  }, []);

  return { initialize, signIn, getSheetData };
}
```

## Gerenciamento de Dependências

### 1. Dependências Primitivas
```typescript
// ✅ BOM: Dependências primitivas são estáveis
const handleFilter = useCallback((items: Item[]) => {
  return items.filter(item => 
    item.category === selectedCategory &&
    item.price >= minPrice &&
    item.price <= maxPrice
  );
}, [selectedCategory, minPrice, maxPrice]);
```

### 2. Dependências de Objetos
```typescript
// ❌ RUIM: Objeto recriado a cada render
const config = { apiKey, baseUrl, timeout };
const fetchData = useCallback(async () => {
  return await api.fetch(config);
}, [config]); // config muda sempre

// ✅ BOM: Dependências primitivas
const fetchData = useCallback(async () => {
  const config = { apiKey, baseUrl, timeout };
  return await api.fetch(config);
}, [apiKey, baseUrl, timeout]);

// ✅ MELHOR: Use useMemo para objetos estáveis
const config = useMemo(() => ({
  apiKey, baseUrl, timeout
}), [apiKey, baseUrl, timeout]);

const fetchData = useCallback(async () => {
  return await api.fetch(config);
}, [config]);
```

### 3. Dependências de Funções
```typescript
// ❌ RUIM: Função não memoizada como dependência
const processData = (data: any[]) => { /* ... */ };

const handleSubmit = useCallback(async (formData: any) => {
  const processed = processData(formData.items);
  await submitData(processed);
}, [processData]); // processData muda sempre

// ✅ BOM: Memoize a função dependência
const processData = useCallback((data: any[]) => {
  // lógica de processamento
}, []);

const handleSubmit = useCallback(async (formData: any) => {
  const processed = processData(formData.items);
  await submitData(processed);
}, [processData]);
```

## Debugging e Profiling

### 1. React DevTools Profiler
```typescript
// Use o Profiler para identificar re-renders desnecessários
function ExpensiveComponent({ onAction }: Props) {
  console.log('ExpensiveComponent rendered'); // Debug log
  
  return (
    <div>
      {/* componente custoso */}
    </div>
  );
}
```

### 2. Custom Hook para Debug
```typescript
function useWhyDidYouUpdate(name: string, props: Record<string, any>) {
  const previous = useRef<Record<string, any>>();
  
  useEffect(() => {
    if (previous.current) {
      const allKeys = Object.keys({ ...previous.current, ...props });
      const changedProps: Record<string, any> = {};
      
      allKeys.forEach(key => {
        if (previous.current![key] !== props[key]) {
          changedProps[key] = {
            from: previous.current![key],
            to: props[key]
          };
        }
      });
      
      if (Object.keys(changedProps).length) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }
    
    previous.current = props;
  });
}

// Uso
function MyComponent(props: Props) {
  useWhyDidYouUpdate('MyComponent', props);
  // ...
}
```

### 3. Performance Monitoring
```typescript
function useCallbackWithMetrics<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  name: string
): T {
  const { measureSync } = usePerformanceMonitor('Callbacks');
  
  return useCallback((...args: Parameters<T>) => {
    return measureSync(name, () => callback(...args));
  }, deps) as T;
}

// Uso
const handleExpensiveOperation = useCallbackWithMetrics(
  (data: any[]) => {
    return expensiveCalculation(data);
  },
  [dependency1, dependency2],
  'expensiveOperation'
);
```

## Testes de Memoização

### 1. Teste de Estabilidade de Referência
```typescript
import { renderHook } from '@testing-library/react';

test('callback should be stable when dependencies do not change', () => {
  const mockFn = vi.fn();
  
  const { result, rerender } = renderHook(
    ({ onAction }) => useCallback(() => onAction(), [onAction]),
    { initialProps: { onAction: mockFn } }
  );
  
  const firstCallback = result.current;
  
  // Re-render com as mesmas props
  rerender({ onAction: mockFn });
  
  // Callback deve ser a mesma referência
  expect(result.current).toBe(firstCallback);
});
```

### 2. Teste de Mudança de Dependência
```typescript
test('callback should change when dependency changes', () => {
  const mockFn1 = vi.fn();
  const mockFn2 = vi.fn();
  
  const { result, rerender } = renderHook(
    ({ onAction }) => useCallback(() => onAction(), [onAction]),
    { initialProps: { onAction: mockFn1 } }
  );
  
  const firstCallback = result.current;
  
  // Re-render com prop diferente
  rerender({ onAction: mockFn2 });
  
  // Callback deve ser uma nova referência
  expect(result.current).not.toBe(firstCallback);
});
```

### 3. Teste de Performance
```typescript
test('memoized callback should prevent unnecessary re-renders', () => {
  const ChildComponent = vi.fn(() => null);
  
  function ParentComponent({ onAction }: { onAction: () => void }) {
    const memoizedCallback = useCallback(() => {
      onAction();
    }, [onAction]);
    
    return <ChildComponent onClick={memoizedCallback} />;
  }
  
  const mockAction = vi.fn();
  const { rerender } = render(<ParentComponent onAction={mockAction} />);
  
  const initialRenderCount = ChildComponent.mock.calls.length;
  
  // Re-render com a mesma prop
  rerender(<ParentComponent onAction={mockAction} />);
  
  // Child não deve ter re-renderizado
  expect(ChildComponent.mock.calls.length).toBe(initialRenderCount);
});
```

## Checklist de Revisão

### Antes de Implementar Memoização
- [ ] Identifiquei um problema real de performance?
- [ ] Medi o impacto atual com profiling?
- [ ] A função é passada como prop ou dependência?
- [ ] As dependências são estáveis ou mudam frequentemente?

### Durante a Implementação
- [ ] Incluí todas as dependências necessárias?
- [ ] Evitei dependências de objetos/arrays inline?
- [ ] Considerei usar useRef para valores que mudam frequentemente?
- [ ] Adicionei testes para verificar a estabilidade?

### Após a Implementação
- [ ] Verifiquei que o problema foi resolvido?
- [ ] Medi o impacto da otimização?
- [ ] Documentei a decisão e o contexto?
- [ ] Adicionei monitoramento de performance?

## Antipadrões Comuns

### 1. Memoização Excessiva
```typescript
// ❌ RUIM: Memoização desnecessária
const Component = () => {
  const simpleValue = useCallback(() => 'constant', []);
  const anotherValue = useCallback(() => Math.PI, []);
  const handleClick = useCallback(() => console.log('click'), []);
  
  return <div onClick={handleClick}>{simpleValue()}</div>;
};
```

### 2. Dependências Incorretas
```typescript
// ❌ RUIM: Dependência omitida
const [count, setCount] = useState(0);
const handleIncrement = useCallback(() => {
  setCount(count + 1); // count não está nas dependências
}, []); // ESLint irá avisar sobre isso

// ✅ BOM: Use função de atualização
const handleIncrement = useCallback(() => {
  setCount(prev => prev + 1);
}, []);
```

### 3. Objetos como Dependências
```typescript
// ❌ RUIM: Objeto inline como dependência
const handleSubmit = useCallback((data) => {
  api.submit(data, { headers: { 'Content-Type': 'application/json' } });
}, [{ headers: { 'Content-Type': 'application/json' } }]); // Sempre diferente

// ✅ BOM: Extrair objeto estável
const defaultHeaders = { 'Content-Type': 'application/json' };
const handleSubmit = useCallback((data) => {
  api.submit(data, { headers: defaultHeaders });
}, []);
```

## Conclusão

A memoização é uma ferramenta poderosa para otimização de performance, mas deve ser usada com cuidado e propósito. Sempre meça antes de otimizar, implemente testes adequados e monitore o impacto das mudanças.

Lembre-se: **código claro e correto é mais importante que código otimizado**. Otimize apenas quando necessário e sempre documente suas decisões.

---

**Última Atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Próxima Revisão**: Abril 2025