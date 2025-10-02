import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { KPI } from '@/types';

interface KPICardProps {
  kpi: KPI;
}

export const KPICard: React.FC<KPICardProps> = ({ kpi }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1).replace('.', ',')}%`;
  };

  const getTrendIcon = () => {
    switch (kpi.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4" aria-hidden="true" />;
      case 'down':
        return <TrendingDown className="h-4 w-4" aria-hidden="true" />;
      default:
        return <Minus className="h-4 w-4" aria-hidden="true" />;
    }
  };

  const getTrendColor = () => {
    switch (kpi.trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendDescription = () => {
    const changeText = formatPercentage(kpi.change);
    switch (kpi.trend) {
      case 'up':
        return `Aumento de ${changeText} em relação ao período anterior`;
      case 'down':
        return `Diminuição de ${changeText} em relação ao período anterior`;
      default:
        return `Sem alteração significativa, ${changeText}`;
    }
  };

  return (
    <article 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
      role="region"
      aria-labelledby={`kpi-title-${kpi.title.replace(/\s+/g, '-').toLowerCase()}`}
      aria-describedby={`kpi-trend-${kpi.title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 
            id={`kpi-title-${kpi.title.replace(/\s+/g, '-').toLowerCase()}`}
            className="text-sm font-medium text-gray-600"
          >
            {kpi.title}
          </h3>
          <p 
            className="text-2xl font-bold text-gray-900"
            aria-label={`Valor atual: ${formatCurrency(kpi.value)}`}
          >
            {formatCurrency(kpi.value)}
          </p>
          <div 
            className="flex items-center mt-2"
            id={`kpi-trend-${kpi.title.replace(/\s+/g, '-').toLowerCase()}`}
            aria-label={getTrendDescription()}
          >
            <span className={getTrendColor()} aria-hidden="true">
              {getTrendIcon()}
            </span>
            <span 
              className={`ml-1 text-sm font-medium ${getTrendColor()}`}
              aria-hidden="true"
            >
              {formatPercentage(kpi.change)}
            </span>
            <span className="sr-only">
              {getTrendDescription()}
            </span>
          </div>
        </div>
        <div 
          className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="text-blue-600 text-xl">{kpi.icon}</span>
        </div>
      </div>
    </article>
  );
};