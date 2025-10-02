import React, { memo, useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth?: number;
    }[];
  };
  title?: string;
  height?: number;
}

const PieChartComponent: React.FC<PieChartProps> = ({ 
  data, 
  title = 'Gráfico de Pizza',
  height = 300 
}) => {
  // Memoizar as opções do gráfico para evitar recriação desnecessária
  const options: ChartOptions<'pie'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      },
      title: {
        display: !!title,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((acc: number, curr: number) => acc + curr, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: R$ ${value.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })} (${percentage}%)`;
          }
        }
      }
    }
  }), [title]);

  // Memoizar o estilo para evitar recriação
  const containerStyle = useMemo(() => ({ 
    height: `${height}px` 
  }), [height]);

  return (
    <div style={containerStyle}>
      <Pie data={data} options={options} />
    </div>
  );
};

// Exportar componente memoizado
const PieChart = memo(PieChartComponent);

export { PieChart };
export default PieChart;