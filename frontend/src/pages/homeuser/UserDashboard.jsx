import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ClipboardList,
  AlertTriangle,
  Plus,
  Eye,
  TrendingUp,
  Activity,
  Check,
  Leaf,
  Wind,
  TreePine,
  Star,
  MessageSquare,
  Recycle,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { getMyRequests } from '../../api/requests.api';
import { submitFeedback } from '../../api/feedback.api';
import StatusBadge from '../../components/common/StatusBadge';
import StarRating from '../../components/common/StarRating';
import { formatDate, formatCurrency } from '../../utils/formatters';

const MATERIAL_LABELS = {
  IRON_STEEL:      'Iron / Steel',
  STEEL:           'Steel',
  COPPER:          'Copper',
  ALUMINIUM:       'Aluminium',
  BRASS:           'Brass',
  PLASTIC:         'Plastic',
  PET_BOTTLES:     'PET Bottles',
  PAPER_CARDBOARD: 'Paper / Cardboard',
  CARDBOARD:       'Cardboard',
  PAPER:           'Paper',
  GLASS:           'Glass',
  E_WASTE:         'E-Waste',
  EWASTE:          'E-Waste',
  RUBBER:          'Rubber',
  MIXED:           'Mixed / Other',
};

function summariseItems(items = []) {
  if (!items || items.length === 0) return '—';
  const first = MATERIAL_LABELS[items[0]?.materialType] ?? items[0]?.materialType;
  const rest  = items.length - 1;
  return rest > 0 ? `${first} +${rest}` : first;
}

const ACTIVE_STATUSES = ['PENDING', 'QUOTED', 'SCHEDULED', 'COLLECTED'];

/** Status → step index (0-based) */
const STATUS_STEP = {
  PENDING:   0,
  QUOTED:    1,
  SCHEDULED: 2,
  COLLECTED: 3,
};

/** Format a datetime compactly: "Oct 12, 09:00" */
function fmtStep(dateString) {
  if (!dateString) return null;
  const d = new Date(dateString);
  return d.toLocaleString('en-IN', {
    month: 'short',
    day:   'numeric',
    hour:  '2-digit',
    minute:'2-digit',
    hour12: false,
  });
}

/**
 * ActivePickupStatus — 4-step stepper showing the most recent active request.
 */
function ActivePickupStatus({ request }) {
  const navigate = useNavigate();
  const currentStep = STATUS_STEP[request.status] ?? 0;

  const primaryMaterial =
    MATERIAL_LABELS[
      (Array.isArray(request.items) ? request.items[0]?.materialType : null) ||
      (typeof request.items === 'string'
        ? (() => { try { return JSON.parse(request.items)[0]?.materialType; } catch { return null; } })()
        : null)
    ] ?? 'Mixed';

  const steps = [
    {
      label:    'Submitted',
      subLabel: fmtStep(request.createdAt) ?? '—',
    },
    {
      label:    'Quoted',
      subLabel: currentStep >= 1 ? (fmtStep(request.updatedAt) ?? '—') : '—',
    },
    {
      label:    'Scheduled',
      subLabel: request.scheduledDate
        ? fmtStep(request.scheduledDate)
        : currentStep === 2
          ? 'Confirming…'
          : 'Pending',
    },
    {
      label:    'Collected',
      subLabel: currentStep >= 3 ? fmtStep(request.updatedAt) : 'Pending',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Active Pickup Status
          </h2>
          <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mt-0.5">
            #{request.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
            {primaryMaterial}
          </span>
          <button
            onClick={() => navigate(`/user/requests/${request.id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Eye size={12} /> View
          </button>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-start">
        {steps.map((step, idx) => {
          const isDone    = idx < currentStep;
          const isActive  = idx === currentStep;
          const isPending = idx > currentStep;

          return (
            <div key={step.label} className="flex-1 flex flex-col items-center relative">
              {/* Connector line (left side) */}
              {idx > 0 && (
                <div
                  className={`absolute top-4 right-1/2 w-full h-0.5 ${
                    isDone ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                  style={{ transform: 'translateY(-50%)' }}
                />
              )}

              {/* Step circle */}
              <div className="relative z-10 mb-2">
                {isDone ? (
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                    <Check size={14} strokeWidth={3} className="text-white" />
                  </div>
                ) : isActive ? (
                  <div className="w-8 h-8 rounded-full border-2 border-green-600 flex items-center justify-center bg-white dark:bg-gray-800">
                    <div className="w-3 h-3 rounded-full bg-green-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center bg-white dark:bg-gray-800">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-500" />
                  </div>
                )}
              </div>

              {/* Labels */}
              <p
                className={`text-xs font-semibold text-center ${
                  isActive
                    ? 'text-green-600 dark:text-green-400'
                    : isDone
                      ? 'text-gray-700 dark:text-gray-200'
                      : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {step.label}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center mt-0.5">
                {step.subLabel}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const navigate = useNavigate();

  // Feedback form state (for the dashboard widget)
  const [feedbackRating,  setFeedbackRating]  = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFB,    setSubmittingFB]    = useState(false);

  const { data, loading, refetch } = useFetch(getMyRequests);
  const requests = data?.requests ?? data ?? [];

  /* ── derived stats ───────────────────── */
  const total         = requests.length;
  const activePending = requests.filter((r) => ACTIVE_STATUSES.includes(r.status)).length;
  const totalEarnings = requests
    .filter((r) => r.status === 'COMPLETED' && r.adminPrice)
    .reduce((acc, r) => acc + Number(r.adminPrice), 0);

  const quotedRequests = requests.filter((r) => r.status === 'QUOTED');
  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Active pickup (most recently updated)
  const activeRequest = requests
    .filter((r) => ACTIVE_STATUSES.includes(r.status))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] ?? null;

  // Eco Impact — derived from completed requests
  const totalKgRecycled = requests
    .filter((r) => r.status === 'COMPLETED')
    .reduce((total, r) => {
      const items = Array.isArray(r.items) ? r.items : [];
      return total + items.reduce((s, item) => s + (Number(item.estimatedWeight) || 0), 0);
    }, 0);
  const co2Saved   = +(totalKgRecycled * 1.5).toFixed(1);
  const treesEquiv = Math.max(0, Math.round(co2Saved / 22));

  // Pending feedback — most recent COMPLETED request with no feedback yet
  const pendingFeedbackRequest = requests
    .filter((r) => r.status === 'COMPLETED' && !r.feedback)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] ?? null;

  /* ── handlers ───────────────────────── */
  const handleDashboardFeedback = async () => {
    if (feedbackRating === 0) {
      toast.error('Please select a star rating first.');
      return;
    }
    setSubmittingFB(true);
    try {
      await submitFeedback({
        requestId: pendingFeedbackRequest.id,
        rating:    feedbackRating,
        comment:   feedbackComment.trim() || undefined,
      });
      toast.success('Thank you for your feedback! 🌟');
      setFeedbackRating(0);
      setFeedbackComment('');
      refetch(); // re-fetches with feedback included → widget auto-disappears
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        toast.error('You already rated this request.');
        refetch();
      } else {
        toast.error(err?.response?.data?.error ?? 'Failed to submit feedback.');
      }
    } finally {
      setSubmittingFB(false);
    }
  };

  /* ─── stat cards config ──────────────── */
  const STAT_CARDS = [
    {
      label:    'Total Requests',
      value:    total,
      Icon:     ClipboardList,
      color:    'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
      iconBg:   'bg-blue-100 dark:bg-blue-800/40',
    },
    {
      label:    'Active / Pending',
      value:    activePending,
      Icon:     Activity,
      color:    'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
      iconBg:   'bg-amber-100 dark:bg-amber-800/40',
    },
    {
      label:    'Total Earnings',
      value:    formatCurrency(totalEarnings),
      Icon:     TrendingUp,
      color:    'bg-green-50 dark:bg-green-900/20 text-green-700',
      iconBg:   'bg-green-100 dark:bg-green-800/40',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Overview of your pickup requests and earnings.
        </p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STAT_CARDS.map(({ label, value, Icon, color, iconBg }) => (
            <div
              key={label}
              className={`rounded-2xl p-5 flex items-center gap-4 ${color} border border-transparent`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</p>
                <p className="text-2xl font-bold mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 2-Column: Active Pickup Status (left) + Eco/Feedback (right) ── */}
      {!loading && (activeRequest || totalKgRecycled > 0 || pendingFeedbackRequest) && (
        activeRequest ? (
          /* With active request: stepper takes 60%, right column takes 40% */
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
            <div className="lg:col-span-3">
              <ActivePickupStatus request={activeRequest} />
            </div>
            <div className="lg:col-span-2 flex flex-col gap-4">
              {totalKgRecycled > 0 && (
                <EcoImpactWidget
                  totalKg={totalKgRecycled}
                  co2Saved={co2Saved}
                  treesEquiv={treesEquiv}
                />
              )}
              {pendingFeedbackRequest && (
                <PendingFeedbackWidget
                  request={pendingFeedbackRequest}
                  rating={feedbackRating}
                  setRating={setFeedbackRating}
                  comment={feedbackComment}
                  setComment={setFeedbackComment}
                  onSubmit={handleDashboardFeedback}
                  submitting={submittingFB}
                />
              )}
            </div>
          </div>
        ) : (
          /* No active request: show eco + feedback side by side */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {totalKgRecycled > 0 && (
              <EcoImpactWidget
                totalKg={totalKgRecycled}
                co2Saved={co2Saved}
                treesEquiv={treesEquiv}
              />
            )}
            {pendingFeedbackRequest && (
              <PendingFeedbackWidget
                request={pendingFeedbackRequest}
                rating={feedbackRating}
                setRating={setFeedbackRating}
                comment={feedbackComment}
                setComment={setFeedbackComment}
                onSubmit={handleDashboardFeedback}
                submitting={submittingFB}
              />
            )}
          </div>
        )
      )}

      {/* ── Pending Action Alert ── */}
      {!loading && quotedRequests.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <AlertTriangle size={18} />
            <h2 className="font-semibold text-sm">Pending Action Required</h2>
          </div>
          <div className="space-y-2">
            {quotedRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border border-amber-100 dark:border-amber-800 gap-3 flex-wrap"
              >
                <div>
                  <span className="text-xs font-mono text-gray-500">
                    #{req.id.slice(0, 8).toUpperCase()}
                  </span>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white mt-0.5">
                    Quote:{' '}
                    <span className="text-green-600">{formatCurrency(req.quotedPrice)}</span>
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/user/requests/${req.id}`)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                >
                  View &amp; Respond
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick Action ── */}
      <div>
        <button
          onClick={() => navigate('/user/new-request')}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl text-base font-semibold transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/30"
        >
          <Plus size={20} />
          Submit New Pickup Request
        </button>
      </div>

      {/* ── Recent Requests ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Recent Requests
          </h2>
          <button
            onClick={() => navigate('/user/requests')}
            className="text-sm text-green-600 hover:text-green-700 hover:underline font-medium"
          >
            View all →
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-7 h-7 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && recentRequests.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <ClipboardList size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                No requests yet. Submit your first pickup request!
              </p>
              <button
                onClick={() => navigate('/user/new-request')}
                className="mt-1 px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                + Submit New Request
              </button>
            </div>
          )}

          {!loading && recentRequests.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Materials
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {recentRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500 dark:text-gray-400">
                      #{req.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700 dark:text-gray-200">
                      {summariseItems(req.items)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                      {formatDate(req.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => navigate(`/user/requests/${req.id}`)}
                        className="flex items-center gap-1.5 ml-auto px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-700 dark:text-gray-200 hover:text-green-700 rounded-lg transition-colors"
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && recentRequests.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Showing {recentRequests.length} most recent request
                {recentRequests.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── EcoImpactWidget ─────────────────────────────────────────── */

function EcoImpactWidget({ totalKg, co2Saved, treesEquiv }) {
  const metrics = [
    {
      Icon:  Recycle,
      label: 'Scrap Recycled',
      value: `${totalKg % 1 === 0 ? totalKg : totalKg.toFixed(1)} kg`,
      color: 'text-green-700 dark:text-green-400',
      bg:    'bg-green-50 dark:bg-green-900/20',
      ring:  'bg-green-100 dark:bg-green-800/40',
    },
    {
      Icon:  Wind,
      label: 'CO₂ Offset',
      value: `${co2Saved} kg`,
      color: 'text-blue-700 dark:text-blue-400',
      bg:    'bg-blue-50 dark:bg-blue-900/20',
      ring:  'bg-blue-100 dark:bg-blue-800/40',
    },
    {
      Icon:  TreePine,
      label: 'Trees Equivalent',
      value: treesEquiv > 0 ? `~${treesEquiv}` : '< 1',
      color: 'text-emerald-700 dark:text-emerald-400',
      bg:    'bg-emerald-50 dark:bg-emerald-900/20',
      ring:  'bg-emerald-100 dark:bg-emerald-800/40',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex items-center gap-2">
        <Leaf size={15} className="text-green-600" />
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
          Your Eco Impact
        </h2>
      </div>
      <div className="px-5 py-4 space-y-3">
        {metrics.map(({ Icon, label, value, color, bg, ring }) => (
          <div key={label} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${bg}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ring}`}>
              <Icon size={15} className={color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">{label}</p>
              <p className={`text-sm font-bold ${color}`}>{value}</p>
            </div>
          </div>
        ))}
        <p className="text-[10px] text-gray-400 dark:text-gray-500 pt-1">
          * CO₂ estimate: 1 kg scrap ≈ 1.5 kg CO₂ saved. 1 tree absorbs ~22 kg CO₂/yr.
        </p>
      </div>
    </div>
  );
}

/* ── PendingFeedbackWidget ───────────────────────────────────── */

function PendingFeedbackWidget({ request, rating, setRating, comment, setComment, onSubmit, submitting }) {
  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex items-center gap-2">
        <Star size={14} className="text-amber-400 fill-amber-400" />
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
          Rate Your Recent Pickup
        </h2>
      </div>
      <div className="px-5 py-4 space-y-3">
        <p className="text-xs font-mono text-gray-400 dark:text-gray-500">
          Order #{request.id.slice(0, 8).toUpperCase()}
          <span className="ml-2 text-gray-300 dark:text-gray-600">·</span>
          <span className="ml-2 not-italic font-sans">{formatDate(request.createdAt)}</span>
        </p>
        <div className="flex items-center gap-2">
          <StarRating value={rating} onChange={setRating} />
          {rating > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500">{LABELS[rating]}</span>
          )}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          placeholder="Optional comments…"
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none transition"
        />
        <button
          onClick={onSubmit}
          disabled={submitting || rating === 0}
          className="w-full flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors"
        >
          {submitting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <MessageSquare size={13} /> Submit Review
            </>
          )}
        </button>
      </div>
    </div>
  );
}
