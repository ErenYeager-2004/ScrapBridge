/**
 * LineChart.jsx — Chart.js Line chart wrapper using react-chartjs-2.
 *
 * Props:
 *   labels   {string[]}  — X-axis labels
 *   datasets {object[]}  — Chart.js dataset objects
 *   title    {string}    — Label used for aria / parent heading
 *
 * Smooth curve (tension: 0.4). maintainAspectRatio: false.
 * The parent container must have a fixed height (e.g. h-64).
 */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

const DEFAULT_COLOR = '#1A7A4A';

export default function LineChart({ labels = [], datasets = [], title = '' }) {
  const normalisedDatasets = datasets.map((ds) => ({
    borderColor: DEFAULT_COLOR,
    backgroundColor: 'rgba(26,122,74,0.10)',
    pointBackgroundColor: DEFAULT_COLOR,
    pointBorderColor: '#fff',
    pointRadius: 4,
    pointHoverRadius: 6,
    fill: true,
    tension: 0.4,
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
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#9CA3AF', font: { size: 12 } },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(156,163,175,0.12)' },
        ticks: { color: '#9CA3AF', font: { size: 12 } },
        border: { display: false },
        beginAtZero: true,
      },
    },
  };

  return <Line data={data} options={options} aria-label={title || 'Line chart'} />;
}
