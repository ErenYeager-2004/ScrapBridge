/**
 *  • Live stat cards from GET /api/admin/stats
 *  • 3 tabs: Overview | Real-time Feed | Regional View
 *  • Overview: BarChart (request volume) + DoughnutChart (material distribution)
 *  • Overview: Urgent Actions list + Recent Ledger entries
 *  • Loading skeleton while fetching
 */
import { useState, useCallback } from 'react';
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
  RefreshCw,
  Truck,
  Banknote,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  UserCheck,
  Package,
  Filter
} from 'lucide-react';

import useFetch from '../../hooks/useFetch';
import { getDashboardStats } from '../../api/admin.api';
import { getAllRequests } from '../../api/requests.api';
import { getAllOrders } from '../../api/orders.api';
import StatusBadge from '../../components/common/StatusBadge';
import BarChart from '../../components/charts/BarChart';
import DoughnutChart from '../../components/charts/DoughnutChart';
import RecentFeedbackWidget from '../../components/admin/RecentFeedbackWidget';
import { formatCurrency, getRelativeTime } from '../../utils/formatters';

// Utility functions for data formatting and chart preparation

/**
 * Map dailyRequestCounts ({ day: "2026-04-20", count: n }[]) to the given number of days.
 */
function buildDailyChartData(dailyRequestCounts = [], daysToShow = 7) {
  const labels = [];
  const counts = [];
  const bgColors = [];
  const labelColors = [];
  const today = new Date();
  
  for (let i = daysToShow - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayString = d.toISOString().split('T')[0];
    
    const dayLabel = daysToShow > 7 
      ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : d.toLocaleDateString('en-US', { weekday: 'short' });

    labels.push(dayLabel);
    
    const record = dailyRequestCounts.find(r => r.day === dayString);
    counts.push(record ? record.count : 0);
    
    if (i === 0) {
      bgColors.push('#0F766E'); // Green for current day
      labelColors.push('#0F766E');
    } else {
      bgColors.push('#E5E7EB'); // Gray for other days
      labelColors.push('#9CA3AF'); // Gray labels
    }
  }
  
  return { labels, counts, bgColors, labelColors };
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
function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  theme = 'light',
  iconColorClass = '',
  iconBgClass = '',
  loading,
}) {
  const isDark = theme === 'dark-green';
  
  const cardBg = isDark
    ? 'bg-[#157a53] text-white'
    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white';
  const labelColor = isDark
    ? 'text-emerald-50'
    : 'text-gray-500 dark:text-gray-400';
  const valueColor = isDark ? 'text-white' : 'text-gray-900 dark:text-white';
  
  let trendBg = '';
  let trendText = '';
  if (isDark) {
    trendBg = 'bg-white/20';
    trendText = 'text-white';
  } else {
    if (trend?.type === 'positive') {
      trendBg = 'bg-indigo-50 dark:bg-indigo-900/30';
      trendText = 'text-indigo-600 dark:text-indigo-400';
    } else if (trend?.type === 'negative') {
      trendBg = 'bg-rose-50 dark:bg-rose-900/30';
      trendText = 'text-rose-600 dark:text-rose-400';
    } else {
      trendBg = 'bg-gray-100 dark:bg-gray-700';
      trendText = 'text-gray-600 dark:text-gray-300';
    }
  }

  return (
    <div className={`rounded-[1.75rem] p-6 shadow-sm flex flex-col justify-between h-40 border ${isDark ? 'border-transparent shadow-md' : 'border-gray-100 dark:border-gray-700'} ${cardBg}`}>
      <div className="flex justify-between items-start">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBgClass}`}>
          <Icon size={20} className={iconColorClass} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold ${trendBg} ${trendText}`}>
            {trend.type === 'positive' && <TrendingUp size={14} strokeWidth={2.5} />}
            {trend.type === 'negative' && <TrendingDown size={14} strokeWidth={2.5} />}
            {trend.type === 'neutral' && <ArrowRight size={14} strokeWidth={2.5} />}
            {trend.value}
          </div>
        )}
      </div>

      <div className="mt-4">
        {loading ? (
          <>
            <Skeleton className={`h-4 w-24 mb-2 ${isDark ? 'bg-white/20' : ''}`} />
            <Skeleton className={`h-8 w-32 ${isDark ? 'bg-white/20' : ''}`} />
          </>
        ) : (
          <>
            <p className={`text-[13px] font-semibold mb-1 ${labelColor}`}>{label}</p>
            <p className={`text-3xl font-extrabold tracking-tight ${valueColor}`}>{value}</p>
          </>
        )}
      </div>
    </div>
  );
}

// Wrapper for chart sections with title and loading state
function ChartPanel({ title, subtitle, actionIcon: ActionIcon, children, loading, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex flex-col ${className}`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          {subtitle && <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {ActionIcon && (
          <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <ActionIcon size={20} />
          </button>
        )}
      </div>
      {loading ? (
        <Skeleton className="h-72 w-full" />
      ) : (
        <div className="flex-1 relative min-h-[250px]">{children}</div>
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
  const [daysFilter, setDaysFilter] = useState(7);
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchStats = useCallback(() => getDashboardStats(daysFilter), [daysFilter]);

  // Fetch dashboard statistics
  const { data: statsData, loading: statsLoading } = useFetch(fetchStats);
  const stats = statsData ?? {};

  // Fetch recent requests for activity panels
  const { data: reqData, loading: reqLoading } = useFetch(
    () => getAllRequests(),
    []
  );
  const allRequests = reqData?.requests ?? [];

  // Fetch recent orders
  const { data: ordData, loading: ordLoading } = useFetch(
    () => getAllOrders(),
    []
  );
  const allOrders = ordData?.orders ?? [];

  const panelLoading = reqLoading || ordLoading;

  

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
  const { labels: dailyLabels, counts: dailyCounts, bgColors, labelColors } = buildDailyChartData(
    stats.dailyRequestCounts,
    daysFilter
  );
  const barDatasets = [{ 
    data: dailyCounts,
    backgroundColor: bgColors,
    hoverBackgroundColor: bgColors,
    borderRadius: Number.MAX_VALUE,
    borderSkipped: 'bottom',
    barPercentage: 0.9, 
    categoryPercentage: 0.85, 
  }];

  // Material distribution data preparation
  const matDist = stats.materialDistribution ?? [];
  const doughnutLabels   = matDist.map((m) => formatMaterialLabel(m.materialType));
  const doughnutDatasets = [{ data: matDist.map((m) => m.totalWeight) }];
  const totalMaterialKg  = matDist.reduce((s, m) => s + m.totalWeight, 0);
  const doughnutCenterValue = totalMaterialKg
    ? (totalMaterialKg >= 1000 ? `${(totalMaterialKg / 1000).toFixed(1)}k` : `${totalMaterialKg.toFixed(0)}`)
    : '0';
  const doughnutCenterSubLabel = totalMaterialKg >= 1000 ? 'Tons Total' : 'kg Total';

  
  // 1. Quote Requests
  const quoteRequests = allRequests
    .filter(r => r.status === 'PENDING')
    .map(r => ({
      id: r.id,
      createdAt: r.createdAt,
      category: 'REQUESTS',
      title: `Quote Request: #RQ-${r.id.slice(0, 8).toUpperCase()}`,
      subtitle: `${formatMaterialLabel(r.items?.[0]?.materialType || 'Mixed')} - ${r.items?.reduce((sum, item) => sum + parseFloat(item.estimatedWeight || 0), 0) || 0} Kg • Submitted ${getRelativeTime(r.createdAt)}`,
      icon: FileText,
      iconColor: 'text-emerald-700 dark:text-emerald-400',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      actionLabel: 'View Details →',
      actionLink: `/admin/requests/${r.id}`,
      actionType: 'link'
    }));

  // 2. Quote Acceptance Pending
  const quotePending = allRequests
    .filter(r => r.status === 'QUOTED')
    .map(r => ({
      id: r.id,
      createdAt: r.createdAt,
      category: 'REQUESTS',
      title: `Quote Acceptance Pending: #RQ-${r.id.slice(0, 8).toUpperCase()}`,
      subtitle: `${r.user?.name ?? 'User'} received quote • Waiting for signature`,
      icon: UserCheck,
      iconColor: 'text-emerald-700 dark:text-emerald-400',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      actionLabel: 'View Details →',
      actionLink: `/admin/requests/${r.id}`,
      actionType: 'link'
    }));

  // 3. Awaiting Collector Assignment (user accepted, no collector yet)
  const awaitingAssignment = allRequests
    .filter(r => r.status === 'ACCEPTED')
    .map(r => ({
      id: r.id,
      createdAt: r.createdAt,
      category: 'ASSIGNMENT',
      title: `Awaiting Assignment: #${r.id.slice(0, 8).toUpperCase()}`,
      subtitle: `${r.user?.name ?? 'User'} • Pickup: ${r.scheduledDate ? new Date(r.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}`,
      icon: UserCheck,
      iconColor: 'text-teal-700 dark:text-teal-400',
      iconBg: 'bg-teal-100 dark:bg-teal-900/30',
      actionLabel: 'Assign Collector →',
      actionLink: `/admin/requests/${r.id}`,
      actionType: 'button',
      buttonColor: 'bg-teal-600 hover:bg-teal-700 text-white'
    }));

  // 4. Unassigned Collection
  const unassignedCollections = allRequests
    .filter(r => r.status === 'SCHEDULED' && !r.collectorId)
    .map(r => ({
      id: r.id,
      createdAt: r.createdAt,
      category: 'COLLECTIONS',
      title: `Unassigned Collection: #RQ-${r.id.slice(0, 8).toUpperCase()}`,
      subtitle: `Bulk pickup scheduled for ${new Date(r.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} in ${r.pickupAddress}`,
      icon: Truck,
      iconColor: 'text-rose-700 dark:text-rose-400',
      iconBg: 'bg-rose-100 dark:bg-rose-900/30',
      actionLabel: 'Assign Collector',
      actionLink: `/admin/requests/${r.id}`,
      actionType: 'button',
      buttonColor: 'bg-rose-700 hover:bg-rose-800 text-white'
    }));

  // 4. New Buyer Orders
  const newOrders = allOrders
    .filter(o => o.status === 'PLACED')
    .map(o => ({
      id: o.id,
      createdAt: o.createdAt,
      category: 'ORDERS',
      title: `Buyer Order: #ORD-${o.id.slice(0, 8).toUpperCase()}`,
      subtitle: `${o.buyer?.name ?? 'Buyer'} requested ${parseFloat(o.quantityKg)} Kg of ${formatMaterialLabel(o.inventory?.materialType || 'Material')}`,
      icon: Package,
      iconColor: 'text-blue-700 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      actionLabel: 'Confirm Order',
      actionLink: `/admin/orders`, 
      actionType: 'button',
      buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white'
    }));

  const allUrgentActions = [...quoteRequests, ...quotePending, ...awaitingAssignment, ...unassignedCollections, ...newOrders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filteredUrgentActions = allUrgentActions.filter(action => {
    if (actionFilter === 'ALL') return true;
    return action.category === actionFilter;
  });

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
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Days Filter Dropdown */}
          <select
            value={daysFilter}
            onChange={(e) => setDaysFilter(Number(e.target.value))}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl focus:ring-green-500 focus:border-green-500 block px-3 py-2 outline-none cursor-pointer shadow-sm"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
          {/* Tab switcher */}
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
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
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={RefreshCw}
          label="Active Requests"
          value={activeRequestsVal.toLocaleString()}
          trend={{ value: '-4%', type: 'negative' }}
          iconColorClass="text-rose-700 dark:text-rose-400"
          loading={statsLoading}
        />
        <StatCard
          icon={Truck}
          label="Pending Orders"
          value={systemAlertsVal.toLocaleString()}
          trend={{ value: '0%', type: 'neutral' }}
          iconColorClass="text-slate-500 dark:text-slate-400"
          loading={statsLoading}
        />
        <StatCard
          icon={Weight}
          label="Total Tonnage"
          value={tonnageDisplay}
          trend={{ value: '+8%', type: 'positive' }}
          iconColorClass="text-indigo-600 dark:text-indigo-400"
          loading={statsLoading}
        />
        <StatCard
          icon={Banknote}
          label="Total Revenue"
          value={formatCurrency(totalRevenueVal)}
          trend={{ value: '+28%', type: 'positive' }}
          theme="dark-green"
          iconColorClass="text-white"
          iconBgClass="bg-white/20"
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
              title="Request Volume"
              subtitle={`Daily logistics load over past ${daysFilter} days`}
              loading={statsLoading}
              className="lg:col-span-3"
            >
              {dailyLabels.length > 0 ? (
                <BarChart
                  labels={dailyLabels}
                  datasets={barDatasets}
                  tickColors={labelColors}
                  title="Request Volume"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-gray-400">
                  No request data for the last 7 days.
                </div>
              )}
            </ChartPanel>

            {/* Doughnut chart — 40% (2/5 cols) */}
            <ChartPanel
              title="Material Split"
              loading={statsLoading}
              className="lg:col-span-2"
            >
              {doughnutLabels.length > 0 ? (
                <DoughnutChart
                  labels={doughnutLabels}
                  datasets={doughnutDatasets}
                  title="Material Split"
                  centerValue={doughnutCenterValue}
                  centerSubLabel={doughnutCenterSubLabel}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-gray-400">
                  No inventory data yet.
                </div>
              )}
            </ChartPanel>
          </div>

          {/* Actionable Insights Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Urgent Actions */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col min-h-[400px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 gap-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Urgent Actions
                  </h3>
                  {allUrgentActions.length > 0 && (
                    <span className="text-[11px] bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 px-3 py-1 rounded-full font-bold uppercase tracking-wide">
                      {allUrgentActions.length} NEEDS ATTENTION
                    </span>
                  )}
                </div>
                
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg focus:ring-green-500 focus:border-green-500 block px-3 py-1.5 outline-none cursor-pointer"
                >
                  <option value="ALL">All Actions</option>
                  <option value="REQUESTS">Home Users</option>
                  <option value="ASSIGNMENT">Awaiting Assignment ({awaitingAssignment.length})</option>
                  <option value="COLLECTIONS">Pickups</option>
                  <option value="ORDERS">Buyers</option>
                </select>
              </div>

              {panelLoading ? (
                <div className="p-5 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredUrgentActions.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 py-12 text-gray-400">
                  <CheckCircle2 size={40} className="mb-3 text-green-400" />
                  <p className="text-base font-semibold text-gray-600 dark:text-gray-300">No urgent actions!</p>
                  <p className="text-sm mt-1">Everything is caught up.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50 dark:divide-gray-700/60 flex-1 overflow-y-auto max-h-[500px]">
                  {filteredUrgentActions.map((action) => (
                    <li key={action.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${action.iconBg}`}>
                            <action.icon size={22} className={action.iconColor} strokeWidth={2.5} />
                          </div>
                          <div>
                            <h4 className="text-[15px] font-bold text-gray-900 dark:text-white">
                              {action.title}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {action.subtitle}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 sm:ml-4">
                          {action.actionType === 'link' ? (
                            <button
                              onClick={() => navigate(action.actionLink)}
                              className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1"
                            >
                              {action.actionLabel}
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate(action.actionLink)}
                              className={`px-4 py-2 rounded-lg text-[13px] font-bold shadow-sm transition-colors ${action.buttonColor}`}
                            >
                              {action.actionLabel}
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recent Feedback */}
            <RecentFeedbackWidget />
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
