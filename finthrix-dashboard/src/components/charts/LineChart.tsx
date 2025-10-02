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
  Legend
);

interface LineChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      tension?: number;
    }[];
  };
  title?: string;
  height?: number;
}

const LineChartComponent: React.FC<LineChartProps> = ({ 
  data, 
  title = 'Gráfico de Linha',
  height = 300 
}) => {
  // Memoizar as opções do gráfico para evitar recriação desnecessária
  const options: ChartOptions<'line'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
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
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Período'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Valor (R$)'
        },
        ticks: {
          callback: function(value) {
            return `R$ ${Number(value).toLocaleString('pt-BR')}`;
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }), [title]);

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
const LineChart = memo(LineChartComponent);

export { LineChart };
export default LineChart;