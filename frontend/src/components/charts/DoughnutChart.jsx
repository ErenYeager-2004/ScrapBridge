/**
 * DoughnutChart.jsx — Chart.js Doughnut chart wrapper using react-chartjs-2.
 *
 * Props:
 *   labels         {string[]}  — Segment labels
 *   datasets       {object[]}  — Chart.js dataset objects
 *   title          {string}    — Label used for aria / parent heading
 *   centerValue    {string}    — Large bold text displayed in the centre
 *   centerSubLabel {string}    — Small text displayed below the centre value
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
    const { _centerValue, _centerSubLabel } = chart.options;
    if (!_centerValue && !_centerSubLabel) return;

    const { ctx, chartArea } = chart;
    if (!chartArea) return;

    const x = (chartArea.left + chartArea.right) / 2;
    const y = (chartArea.top + chartArea.bottom) / 2;

    ctx.save();
    ctx.textAlign = 'center';
    
    // Respect dark mode by reading the computed color variable
    const isDark = document.documentElement.classList.contains('dark');
    const valueColor = isDark ? '#F9FAFB' : '#111827';
    const subColor = isDark ? '#9CA3AF' : '#6B7280';

    if (_centerValue) {
      ctx.textBaseline = _centerSubLabel ? 'bottom' : 'middle';
      ctx.font = '900 32px Inter, ui-sans-serif, sans-serif';
      ctx.fillStyle = valueColor;
      ctx.fillText(_centerValue, x, _centerSubLabel ? y + 2 : y);
    }

    if (_centerSubLabel) {
      ctx.textBaseline = _centerValue ? 'top' : 'middle';
      ctx.font = 'bold 12px Inter, ui-sans-serif, sans-serif';
      ctx.fillStyle = subColor;
      ctx.fillText(_centerSubLabel, x, _centerValue ? y + 6 : y);
    }

    ctx.restore();
  },
};

// Register once (idempotent — Chart.js deduplicates by id)
ChartJS.register(centerLabelPlugin);

// Brand-aligned colour palette for segments
const SEGMENT_COLORS = [
  '#047857', // Dark Green
  '#DBEAFE', // Light Blue
  '#B91C1C', // Rust Red
  '#F3F4F6', // Light Grey
  '#FBBF24', // Yellow
  '#8B5CF6', // Purple
];

export default function DoughnutChart({
  labels = [],
  datasets = [],
  title = '',
  centerValue = '',
  centerSubLabel = '',
}) {
  // Apply defaults to any dataset that hasn't specified colours
  const normalisedDatasets = datasets.map((ds, i) => ({
    backgroundColor: SEGMENT_COLORS,
    hoverBackgroundColor: SEGMENT_COLORS.map((c) => c + 'CC'),
    borderWidth: 0, // Mockup has no borders between segments
    hoverOffset: 4,
    ...ds,
  }));

  const data = { labels, datasets: normalisedDatasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%', // Thinner ring as per mockup
    // Custom options consumed by centerLabelPlugin
    _centerValue: centerValue,
    _centerSubLabel: centerSubLabel,
    plugins: {
      legend: {
        display: false, // Custom legend below
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

  const total = datasets[0]?.data.reduce((sum, val) => sum + val, 0) || 1;

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1 min-h-[180px]">
        <Doughnut data={data} options={options} aria-label={title || 'Doughnut chart'} />
      </div>
      
      {/* Custom Legend */}
      <div className="mt-8 space-y-4 px-2">
        {labels.map((label, i) => {
          const value = datasets[0]?.data[i] || 0;
          const percentage = Math.round((value / total) * 100);
          const color = normalisedDatasets[0].backgroundColor[i % SEGMENT_COLORS.length];
          return (
            <div key={label} className="flex items-center justify-between text-[15px]">
              <div className="flex items-center gap-3">
                <span 
                  className="w-3.5 h-3.5 rounded-full block" 
                  style={{ backgroundColor: color }} 
                />
                <span className="font-bold text-gray-700 dark:text-gray-300">
                  {label}
                </span>
              </div>
              <span className="font-extrabold text-gray-900 dark:text-white">
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
