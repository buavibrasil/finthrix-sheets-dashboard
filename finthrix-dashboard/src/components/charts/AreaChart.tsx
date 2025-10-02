import React, { memo, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AreaChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill?: boolean | string;
      tension?: number;
    }[];
  };
  title?: string;
  height?: number;
  stacked?: boolean;
}

const AreaChartComponent: React.FC<AreaChartProps> = ({ 
  data, 
  title = 'Gráfico de Área',
  height = 300,
  stacked = false
}) => {
  // Memoizar as opções do gráfico para evitar recriação desnecessária
  const options: ChartOptions<'line'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
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
            const value = context.parsed.y;
            return `${label}: R$ ${value.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`;
          },
          footer: function(tooltipItems) {
            if (stacked && tooltipItems.length > 1) {
              const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
              return `Total: R$ ${total.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`;
            }
            return '';
          }
        }
      },
      filler: {
        propagate: false
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Período'
        },
        stacked: stacked,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Valor (R$)'
        },
        stacked: stacked,
        ticks: {
          callback: function(value) {
            return `R$ ${Number(value).toLocaleString('pt-BR')}`;
          }
        },
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
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2
      },
      line: {
        borderWidth: 2
      }
    }
  }), [title, stacked]);

  // Memoizar o estilo para evitar recriação
  const containerStyle = useMemo(() => ({ 
    height: `${height}px` 
  }), [height]);

  return (
    <div style={containerStyle}>
      <Line data={data} options={options} />
    </div>
  );
};

// Exportar componente memoizado
const AreaChart = memo(AreaChartComponent);

export { AreaChart };
export default AreaChart;