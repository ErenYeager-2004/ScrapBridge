/**
 *  • Live stat cards from GET /api/admin/stats
 *  • 3 tabs: Overview | Real-time Feed | Regional View
 *  • Overview: BarChart (request volume) + DoughnutChart (material distribution)
 *  • Overview: Urgent Actions list + Recent Ledger entries
 *  • Loading skeleton while fetching
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Weight,
  ClipboardList,
  IndianRupee,
  BellDot,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  BarChart2,
  Globe,
  Rss,
} from 'lucide-react';

import useFetch from '../../hooks/useFetch';
import { getDashboardStats } from '../../api/admin.api';
import { getAllRequests } from '../../api/requests.api';
import StatusBadge from '../../components/common/StatusBadge';
import BarChart from '../../components/charts/BarChart';
import DoughnutChart from '../../components/charts/DoughnutChart';
import { formatDate, formatCurrency, getRelativeTime } from '../../utils/formatters';

// Utility functions for data formatting and chart preparation

/**
 * Map weeklyRequestCounts ({ week: "2026-16", count: n }[]) to simple W1-W4 labels.
 * Takes the last ≤4 distinct week entries.
 */
function buildWeeklyChartData(weeklyRequestCounts = []) {
  const sorted = [...weeklyRequestCounts].sort((a, b) =>
    a.week < b.week ? -1 : 1
  );
  const last4 = sorted.slice(-4);
  const labels = last4.map((_, i) => `W${i + 1}`);
  const counts = last4.map((r) => r.count);
  return { labels, counts };
}

/**
 * Nicely format DB enum material type strings for chart display.
 * E.g. "ALUMINIUM_CANS" → "Aluminium Cans"
 */
function formatMaterialLabel(type = '') {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

// UI Components for the Dashboard
function Skeleton({ className = '' }) {
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse ${className}`}
    />
  );
}

// Single stat display card
function StatCard({ icon: Icon, label, value, colorClass, loading }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="min-w-0">
        {loading ? (
          <>
            <Skeleton className="h-7 w-24 mb-1" />
            <Skeleton className="h-3 w-20" />
          </>
        ) : (
          <>
            <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </>
        )}
      </div>
    </div>
  );
}

// Wrapper for chart sections with title and loading state
function ChartPanel({ title, children, loading, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex flex-col ${className}`}>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</h3>
      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="h-64 relative">{children}</div>
      )}
    </div>
  );
}

// Tab navigation button component
function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
        ${active
          ? 'bg-green-600 text-white shadow-sm'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
        }`}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

// Generic placeholder for empty or upcoming features
function PlaceholderPanel({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 dark:text-gray-600">
      <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Icon size={26} className="opacity-50" />
      </div>
      <p className="text-base font-semibold text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-sm mt-1 max-w-xs">{description}</p>
    </div>
  );
}

/**
 * Main AdminDashboard Component
 */

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch dashboard statistics
  const { data: statsData, loading: statsLoading } = useFetch(
    () => getDashboardStats(),
    []
  );
  const stats = statsData ?? {};

  // Fetch recent requests for activity panels
  const { data: reqData, loading: reqLoading } = useFetch(
    () => getAllRequests(),
    []
  );
  const allRequests = reqData?.requests ?? [];

  const panelLoading = reqLoading;

  // Calculated stat values for display

  // Total Tonnage = sum of all weights in the Inventory (created from completed requests)
  const totalTonnage = (stats.materialDistribution ?? []).reduce(
    (sum, m) => sum + (m.totalWeight ?? 0),
    0
  );
  const tonnageDisplay =
    totalTonnage >= 1000
      ? `${(totalTonnage / 1000).toFixed(2)} T`
      : `${totalTonnage.toFixed(1)} kg`;

  const activeRequestsVal = stats.activeRequestsCount ?? 0;
  const totalRevenueVal   = stats.totalRevenue ?? 0;
  const systemAlertsVal   = stats.pendingOrdersCount ?? 0;

  // Prepare chart datasets
  const { labels: weekLabels, counts: weekCounts } = buildWeeklyChartData(
    stats.weeklyRequestCounts
  );
  const barDatasets = [{ data: weekCounts }];

  // Material distribution data preparation
  const matDist = stats.materialDistribution ?? [];
  const doughnutLabels   = matDist.map((m) => formatMaterialLabel(m.materialType));
  const doughnutDatasets = [{ data: matDist.map((m) => m.totalWeight) }];
  const totalMaterialKg  = matDist.reduce((s, m) => s + m.totalWeight, 0);
  const doughnutCenter   = totalMaterialKg
    ? `${(totalMaterialKg / 1000).toFixed(1)} T`
    : '0 kg';

  // Filter requests for the action panels
  const pendingRequests = allRequests
    .filter((r) => r.status === 'PENDING')
    .slice(0, 6);

  const recentCompleted = [...allRequests]
    .filter((r) => r.status === 'COMPLETED')
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);


  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

      {/* Dashboard Header and Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Live overview of ScrapBridge operations.
          </p>
        </div>
        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={BarChart2}
            label="Overview"
          />
          <TabButton
            active={activeTab === 'realtime'}
            onClick={() => setActiveTab('realtime')}
            icon={Rss}
            label="Real-time Feed"
          />
          <TabButton
            active={activeTab === 'regional'}
            onClick={() => setActiveTab('regional')}
            icon={Globe}
            label="Regional View"
          />
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Weight}
          label="Total Tonnage Collected"
          value={tonnageDisplay}
          colorClass="bg-emerald-600"
          loading={statsLoading}
        />
        <StatCard
          icon={ClipboardList}
          label="Active Requests"
          value={activeRequestsVal}
          colorClass="bg-violet-500"
          loading={statsLoading}
        />
        <StatCard
          icon={IndianRupee}
          label="Total Revenue"
          value={formatCurrency(totalRevenueVal)}
          colorClass="bg-green-600"
          loading={statsLoading}
        />
        <StatCard
          icon={BellDot}
          label="System Alerts (Pending Orders)"
          value={systemAlertsVal}
          colorClass={systemAlertsVal > 0 ? 'bg-amber-500' : 'bg-gray-400'}
          loading={statsLoading}
        />
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <>
          {/* Visual Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* Bar chart — 60% (3/5 cols) */}
            <ChartPanel
              title="Request Volume (30 Days)"
              loading={statsLoading}
              className="lg:col-span-3"
            >
              {weekLabels.length > 0 ? (
                <BarChart
                  labels={weekLabels}
                  datasets={barDatasets}
                  title="Request Volume (30 Days)"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-gray-400">
                  No request data for the last 30 days.
                </div>
              )}
            </ChartPanel>

            {/* Doughnut chart — 40% (2/5 cols) */}
            <ChartPanel
              title="Material Distribution"
              loading={statsLoading}
              className="lg:col-span-2"
            >
              {doughnutLabels.length > 0 ? (
                <DoughnutChart
                  labels={doughnutLabels}
                  datasets={doughnutDatasets}
                  title="Material Distribution"
                  centerLabel={doughnutCenter}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-gray-400">
                  No inventory data yet.
                </div>
              )}
            </ChartPanel>
          </div>

          {/* Actionable Insights Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Urgent Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-500" />
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Urgent Actions
                  </h3>
                  {pendingRequests.length > 0 && (
                    <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                      {pendingRequests.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => navigate('/admin/requests?status=PENDING')}
                  className="text-xs text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
                >
                  View all <ArrowRight size={12} />
                </button>
              </div>

              {panelLoading ? (
                <div className="p-5 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <CheckCircle2 size={32} className="mb-2 text-green-400" />
                  <p className="text-sm font-medium">No pending requests!</p>
                  <p className="text-xs mt-0.5">All caught up.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50 dark:divide-gray-700/60">
                  {pendingRequests.map((r) => (
                    <li key={r.id}>
                      <button
                        onClick={() => navigate(`/admin/requests/${r.id}`)}
                        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors text-left group"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {r.user?.name ?? 'Unknown user'}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {Array.isArray(r.items) && r.items.length > 0
                              ? r.items.map((i) => formatMaterialLabel(i.materialType)).join(', ')
                              : 'No items'}
                            {' · '}
                            {formatDate(r.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                            PENDING
                          </span>
                          <ArrowRight
                            size={14}
                            className="text-gray-300 group-hover:text-green-500 transition-colors"
                          />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recent Ledger Entries */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Recent Ledger Entries
                  </h3>
                </div>
                <button
                  onClick={() => navigate('/admin/requests?status=COMPLETED')}
                  className="text-xs text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
                >
                  View all <ArrowRight size={12} />
                </button>
              </div>

              {panelLoading ? (
                <div className="p-5 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : recentCompleted.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <ClipboardList size={32} className="mb-2 opacity-40" />
                  <p className="text-sm font-medium">No completed requests yet.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50 dark:divide-gray-700/60">
                  {recentCompleted.map((r) => (
                    <li key={r.id}>
                      <button
                        onClick={() => navigate(`/admin/requests/${r.id}`)}
                        className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors text-left group"
                      >
                        {/* Green pulse dot */}
                        <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 animate-ping" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {r.user?.name ?? 'Unknown'}
                            </p>
                            <p className="text-xs font-semibold text-green-600 dark:text-green-400 flex-shrink-0 ml-2">
                              {r.adminPrice ? formatCurrency(r.adminPrice) : '—'}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-0.5">
                            <p className="text-xs text-gray-400 truncate">
                              {Array.isArray(r.items) && r.items.length > 0
                                ? r.items.map((i) => formatMaterialLabel(i.materialType)).join(', ')
                                : 'Completed pickup'}
                            </p>
                            <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                              {getRelativeTime(r.updatedAt)}
                            </p>
                          </div>
                        </div>

                        <ArrowRight
                          size={14}
                          className="text-gray-300 group-hover:text-green-500 transition-colors flex-shrink-0"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}

      {/* Real-time Feed Placeholder */}
      {activeTab === 'realtime' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <PlaceholderPanel
            icon={Rss}
            title="Real-time Feed"
            description="Live event stream for new requests, status changes, and system events. Coming in a future phase."
          />
        </div>
      )}

      {/* Regional View Placeholder */}
      {activeTab === 'regional' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <PlaceholderPanel
            icon={Globe}
            title="Regional View"
            description="Geographic distribution of pickups across India. Requires map integration — coming in a future phase."
          />
        </div>
      )}
    </div>
  );
}
