import { lazy } from 'react';

// Lazy loading dos componentes de gráfico
export const LazyLineChart = lazy(() => import('./LineChart'));
export const LazyPieChart = lazy(() => import('./PieChart'));
export const LazyBarChart = lazy(() => import('./BarChart'));
export const LazyAreaChart = lazy(() => import('./AreaChart'));

// Re-export do componente wrapper
export { LazyChart } from './LazyChart';