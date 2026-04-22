/**
 * DoughnutChart.jsx — Chart.js Doughnut chart wrapper using react-chartjs-2.
 *
 * Props:
 *   labels      {string[]}  — Segment labels
 *   datasets    {object[]}  — Chart.js dataset objects
 *   title       {string}    — Label used for aria / parent heading
 *   centerLabel {string}    — Text displayed in the centre of the doughnut
 *
 * The parent container must have a fixed height (e.g. h-64) for the chart
 * to render correctly with maintainAspectRatio: false.
 */
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

// ── Center-label plugin ─────────────────────────────────────────────────────
// Draws a single line of text in the donut hole after the chart renders.
const centerLabelPlugin = {
  id: 'centerLabel',
  afterDraw(chart) {
    const label = chart.options._centerLabel;
    if (!label) return;

    const { ctx, chartArea } = chart;
    if (!chartArea) return;

    const x = (chartArea.left + chartArea.right) / 2;
    const y = (chartArea.top + chartArea.bottom) / 2;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 14px Inter, ui-sans-serif, sans-serif';

    // Respect dark mode by reading the computed color variable
    const isDark = document.documentElement.classList.contains('dark');
    ctx.fillStyle = isDark ? '#F9FAFB' : '#111827';

    ctx.fillText(label, x, y);
    ctx.restore();
  },
};

// Register once (idempotent — Chart.js deduplicates by id)
ChartJS.register(centerLabelPlugin);

// Brand-aligned colour palette for segments
const SEGMENT_COLORS = [
  '#1A7A4A', // brand green
  '#16A34A',
  '#22C55E',
  '#4ADE80',
  '#86EFAC',
  '#059669',
  '#10B981',
  '#34D399',
];

export default function DoughnutChart({
  labels = [],
  datasets = [],
  title = '',
  centerLabel = '',
}) {
  // Apply defaults to any dataset that hasn't specified colours
  const normalisedDatasets = datasets.map((ds, i) => ({
    backgroundColor: SEGMENT_COLORS,
    hoverBackgroundColor: SEGMENT_COLORS.map((c) => c + 'CC'),
    borderWidth: 2,
    borderColor: 'transparent',
    hoverOffset: 6,
    ...ds,
  }));

  const data = { labels, datasets: normalisedDatasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    // Custom option consumed by centerLabelPlugin
    _centerLabel: centerLabel,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#6B7280',
          font: { size: 11 },
          padding: 12,
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#F9FAFB',
        bodyColor: '#D1FAE5',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` ${ctx.formattedValue} kg`,
        },
      },
    },
  };

  return (
    <Doughnut data={data} options={options} aria-label={title || 'Doughnut chart'} />
  );
}
