# Sistema de Monitoramento de Performance

## Visão Geral

O sistema de monitoramento de performance foi implementado para rastrear e analisar o desempenho dos componentes React em tempo real, fornecendo insights valiosos sobre operações críticas e identificando gargalos de performance.

## Arquitetura

### Componentes Principais

#### 1. usePerformanceMonitor Hook
Hook customizado que fornece funcionalidades de monitoramento para componentes React.

```typescript
const {
  startTimer,
  endTimer,
  measureAsync,
  measureSync,
  getComponentMetrics,
  getAverageTime
} = usePerformanceMonitor('ComponentName', options);
```

#### 2. PerformanceCollector (Singleton)
Classe responsável por coletar, armazenar e gerenciar métricas de performance globalmente.

```typescript
const collector = PerformanceCollector.getInstance();
```

### Estrutura de Dados

#### PerformanceMetric
```typescript
interface PerformanceMetric {
  componentName: string;    // Nome do componente
  operation: string;        // Nome da operação
  duration: number;         // Duração em milissegundos
  timestamp: number;        // Timestamp da operação
  metadata?: Record<string, any>; // Dados adicionais
}
```

#### PerformanceMonitorOptions
```typescript
interface PerformanceMonitorOptions {
  enabled?: boolean;        // Habilita/desabilita monitoramento
  threshold?: number;       // Threshold mínimo para reportar (ms)
  maxMetrics?: number;      // Máximo de métricas em memória
}
```

## Uso Prático

### 1. Monitoramento Básico

```typescript
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

function MyComponent() {
  const { startTimer, endTimer } = usePerformanceMonitor('MyComponent');

  const handleOperation = () => {
    startTimer('userAction');
    // ... operação custosa
    endTimer('userAction');
  };

  return <button onClick={handleOperation}>Execute</button>;
}
```

### 2. Monitoramento de Operações Assíncronas

```typescript
const { measureAsync } = usePerformanceMonitor('DataComponent');

const fetchData = useCallback(async () => {
  const data = await measureAsync('fetchData', async () => {
    return await api.getData();
  });
  setData(data);
}, [measureAsync]);
```

### 3. Monitoramento de Operações Síncronas

```typescript
const { measureSync } = usePerformanceMonitor('CalculationComponent');

const processData = useCallback((rawData) => {
  return measureSync('dataProcessing', () => {
    return complexCalculation(rawData);
  });
}, [measureSync]);
```

### 4. Análise de Métricas

```typescript
const { getComponentMetrics, getAverageTime } = usePerformanceMonitor('MyComponent');

// Obter todas as métricas do componente
const metrics = getComponentMetrics();

// Obter tempo médio de uma operação específica
const avgTime = getAverageTime('specificOperation');
```

## Configuração

### Opções de Configuração

#### Threshold (Limiar)
Define o tempo mínimo para que uma operação seja registrada:

```typescript
const monitor = usePerformanceMonitor('Component', { 
  threshold: 100 // Só registra operações > 100ms
});
```

#### Habilitação Condicional
Controla quando o monitoramento está ativo:

```typescript
const monitor = usePerformanceMonitor('Component', { 
  enabled: process.env.NODE_ENV === 'development'
});
```

#### Limite de Métricas
Define quantas métricas manter em memória:

```typescript
const monitor = usePerformanceMonitor('Component', { 
  maxMetrics: 50 // Mantém apenas as 50 métricas mais recentes
});
```

## Integração com Google Sheets

### Implementação Atual

O sistema está integrado ao `useGoogleSheets` hook para monitorar operações críticas:

```typescript
// useGoogleSheets.ts
const { measureAsync, getComponentMetrics } = usePerformanceMonitor('GoogleSheets', {
  enabled: true,
  threshold: 50
});

const initialize = useCallback(async () => {
  await measureAsync('initialize', () => googleSheetsService.initialize());
}, [measureAsync]);

const signIn = useCallback(async () => {
  await measureAsync('signIn', () => googleSheetsService.signIn());
}, [measureAsync]);
```

### Métricas Coletadas

1. **initialize**: Tempo de inicialização do serviço
2. **signIn**: Tempo de autenticação
3. **signOut**: Tempo de logout
4. **getSheetData**: Tempo de busca de dados
5. **getSpreadsheetInfo**: Tempo de busca de informações da planilha

## Ambientes

### Desenvolvimento
- Logs detalhados no console
- Todas as métricas são registradas
- Alertas visuais para operações lentas

```typescript
// Em desenvolvimento
console.log('[Performance] ComponentName.operation: 150ms', metadata);
```

### Produção
- Logs silenciosos
- Apenas operações críticas são reportadas
- Integração com serviços de monitoramento externos

```typescript
// Em produção
if (metric.duration > 100) {
  console.warn(`[Performance Alert] Slow operation detected: ${metric.componentName}.${metric.operation} took ${metric.duration}ms`);
}
```

## Análise e Relatórios

### Métricas Disponíveis

#### Por Componente
```typescript
const metrics = getComponentMetrics();
// Retorna todas as métricas do componente atual
```

#### Tempo Médio
```typescript
const avgTime = getAverageTime('operationName');
// Retorna o tempo médio de uma operação específica
```

#### Métricas Globais
```typescript
const allMetrics = collector.getMetrics();
// Retorna todas as métricas do sistema
```

### Análise de Tendências

#### Identificação de Gargalos
1. Operações com tempo médio > 200ms
2. Operações com alta variabilidade
3. Componentes com muitas operações lentas

#### Otimização Baseada em Dados
1. Priorizar otimizações em operações mais lentas
2. Implementar cache para operações frequentes
3. Dividir operações complexas em menores

## Testes

### Estrutura de Testes

Os testes estão organizados em categorias:

1. **Timer functionality**: Testa start/end de timers
2. **Async measurement**: Testa medição de operações assíncronas
3. **Sync measurement**: Testa medição de operações síncronas
4. **Metrics collection**: Testa coleta e análise de métricas
5. **Configuration options**: Testa opções de configuração

### Executando Testes

```bash
# Executar todos os testes de performance
npm test -- src/test/usePerformanceMonitor.test.ts

# Executar testes em modo watch
npm test -- --watch src/test/usePerformanceMonitor.test.ts
```

## Melhores Práticas

### 1. Nomeação de Operações
- Use nomes descritivos e consistentes
- Prefira verbos que descrevem a ação: `fetchData`, `processResults`
- Evite nomes genéricos como `operation1`, `task`

### 2. Granularidade
- Monitore operações significativas (> 10ms)
- Evite monitorar operações muito granulares
- Foque em operações críticas para o usuário

### 3. Metadata
- Inclua contexto relevante nos metadados
- Use para debugging e análise posterior
- Evite dados sensíveis nos metadados

### 4. Thresholds
- Configure thresholds apropriados para cada componente
- Ajuste baseado no contexto da aplicação
- Revise periodicamente baseado em dados coletados

## Troubleshooting

### Problemas Comuns

#### 1. Métricas Não Coletadas
- Verifique se `enabled: true`
- Confirme se a duração está acima do threshold
- Verifique se o timer foi iniciado corretamente

#### 2. Performance Degradada
- Reduza o número de operações monitoradas
- Aumente o threshold
- Limite o número máximo de métricas

#### 3. Memória Crescente
- Configure `maxMetrics` adequadamente
- Implemente limpeza periódica
- Monitore o uso de memória em produção

### Debug

#### Logs de Debug
```typescript
// Habilitar logs detalhados
const monitor = usePerformanceMonitor('Component', { 
  enabled: true,
  threshold: 0 // Registra todas as operações
});
```

#### Análise de Métricas
```typescript
// Analisar métricas coletadas
const metrics = getComponentMetrics();
console.table(metrics.map(m => ({
  operation: m.operation,
  duration: m.duration,
  timestamp: new Date(m.timestamp).toISOString()
})));
```

## Roadmap

### Próximas Funcionalidades

1. **Dashboard de Métricas**: Interface visual para análise
2. **Alertas Automáticos**: Notificações para operações lentas
3. **Integração com APM**: Conexão com ferramentas como DataDog
4. **Análise de Tendências**: Gráficos de performance ao longo do tempo
5. **Comparação de Versões**: Análise de impacto de mudanças

### Melhorias Planejadas

1. **Sampling**: Reduzir overhead em produção
2. **Compressão**: Otimizar armazenamento de métricas
3. **Exportação**: Facilitar análise externa
4. **Filtros Avançados**: Busca e filtragem de métricas

---

**Última Atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Mantenedor**: Equipe de Arquitetura