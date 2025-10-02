import React, { memo, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string | string[];
      borderColor: string | string[];
      borderWidth?: number;
    }[];
  };
  title?: string;
  height?: number;
  orientation?: 'vertical' | 'horizontal';
}

const BarChartComponent: React.FC<BarChartProps> = ({ 
  data, 
  title = 'Gráfico de Barras',
  height = 300,
  orientation = 'vertical'
}) => {
  // Memoizar as opções do gráfico para evitar recriação desnecessária
  const options: ChartOptions<'bar'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: orientation === 'horizontal' ? 'y' as const : 'x' as const,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y || context.parsed.x;
            return `${label}: R$ ${value.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: orientation === 'horizontal' ? 'Valor (R$)' : 'Categorias'
        },
        ticks: orientation === 'horizontal' ? {
          callback: function(value) {
            return `R$ ${Number(value).toLocaleString('pt-BR')}`;
          }
        } : undefined,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: orientation === 'horizontal' ? 'Categorias' : 'Valor (R$)'
        },
        ticks: orientation === 'vertical' ? {
          callback: function(value) {
            return `R$ ${Number(value).toLocaleString('pt-BR')}`;
          }
        } : undefined,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }), [title, orientation]);

  // Memoizar o estilo para evitar recriação
  const containerStyle = useMemo(() => ({ 
    height: `${height}px` 
  }), [height]);

  return (
    <div style={containerStyle}>
      <Bar data={data} options={options} />
    </div>
  );
};

// Exportar componente memoizado
const BarChart = memo(BarChartComponent);

export { BarChart };
export default BarChart;