import { lazy } from 'react';

// Lazy loading das páginas principais
export const LazyDashboard = lazy(() => import('./Dashboard/Dashboard'));

// Exportações para facilitar importação
export { LazyDashboard as Dashboard };