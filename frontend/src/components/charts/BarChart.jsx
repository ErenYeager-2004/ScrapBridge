/**
 * BarChart.jsx — Chart.js Bar chart wrapper using react-chartjs-2.
 *
 * Props:
 *   labels   {string[]}  — X-axis labels
 *   datasets {object[]}  — Chart.js dataset objects
 *   title    {string}    — Displayed above the chart by the parent, not by Chart.js
 *
 * The parent container must have a fixed height (e.g. h-64) for the chart
 * to render correctly with maintainAspectRatio: false.
 */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const DEFAULT_COLOR = '#1A7A4A';

export default function BarChart({ labels = [], datasets = [], title = '', tickColors }) {
  // Apply default colour to any dataset that hasn't specified one
  const normalisedDatasets = datasets.map((ds) => ({
    backgroundColor: ds.backgroundColor || DEFAULT_COLOR,
    borderRadius: ds.borderRadius || 6,
    borderSkipped: ds.borderSkipped !== undefined ? ds.borderSkipped : false,
    hoverBackgroundColor: ds.hoverBackgroundColor || '#15643C',
    ...ds,
  }));

  const data = { labels, datasets: normalisedDatasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#F9FAFB',
        bodyColor: '#D1FAE5',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          title: (items) => items[0]?.label ?? '',
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: tickColors || '#9CA3AF', font: { size: 12, weight: '600' } },
        border: { display: false },
      },
      y: {
        display: false,
        beginAtZero: true,
      },
    },
  };

  return <Bar data={data} options={options} aria-label={title || 'Bar chart'} />;
}
