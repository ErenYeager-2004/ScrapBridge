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
  MapPin,
  Calendar,
  Clock,
  Info,
  Lightbulb,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
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

const ACTIVE_STATUSES = ['PENDING', 'QUOTED', 'ACCEPTED', 'SCHEDULED', 'COLLECTED'];

/** Status → step index (0-based) */
const STATUS_STEP = {
  PENDING:   0,
  QUOTED:    1,
  ACCEPTED:  2,
  SCHEDULED: 3,
  COLLECTED: 4,
  COMPLETED: 5, // all steps complete
};

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
    { label: 'SUBMITTED', icon: Check },
    { label: 'QUOTED',    icon: Check },
    { label: 'ACCEPTED',  icon: Clock },
    { label: 'SCHEDULED', icon: Calendar },
    { label: 'COLLECTED', icon: Recycle },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-8 flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Pickup Status</h2>
          <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mt-1">
            Request ID: <span className="font-bold text-gray-700 dark:text-gray-300">#{request.id.slice(0, 8).toUpperCase()}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Material Type</p>
          <div className="flex items-center justify-end gap-1.5 text-gray-800 dark:text-gray-200 font-semibold text-sm">
            <MapPin size={14} className="text-green-600" />
            {primaryMaterial}
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-start justify-between relative mb-10 mt-4 px-2">
        {/* Connector Line Base */}
        <div className="absolute top-4 left-[5%] right-[5%] h-0.5 bg-gray-200 dark:bg-gray-700 z-0" />
        
        {/* Connector Line Active */}
        <div 
          className="absolute top-4 left-[5%] h-0.5 bg-green-600 z-0 transition-all duration-500 ease-in-out"
          style={{ width: `${Math.min(100, Math.max(0, (currentStep / (steps.length - 1)) * 90))}%` }}
        />

        {steps.map((step, idx) => {
          const isDone    = idx < currentStep;
          const isActive  = idx === currentStep;
          const StepIcon  = step.icon;

          return (
            <div key={step.label} className="relative z-10 flex flex-col items-center">
              <div className="mb-3 bg-white dark:bg-gray-800">
                {isDone || isActive ? (
                  <div className="w-9 h-9 rounded-full bg-[#116940] flex items-center justify-center shadow-sm">
                    {isDone ? (
                      <Check size={16} strokeWidth={3} className="text-white" />
                    ) : (
                      <StepIcon size={16} className="text-white" />
                    )}
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm">
                    <StepIcon size={16} className="text-gray-400 dark:text-gray-500" />
                  </div>
                )}
              </div>
              <p className={`text-[10px] font-bold tracking-wider ${isDone || isActive ? 'text-green-700 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottom Info Box */}
      <div className="mt-auto bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 shadow-sm border border-gray-100 dark:border-gray-700">
          <Info size={18} className="text-green-600" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Estimated Collection Date</p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {request.scheduledDate ? formatDate(request.scheduledDate) : 'Awaiting confirmation...'}
          </p>
        </div>
        <button 
          onClick={() => navigate(`/user/requests/${request.id}`)}
          className="text-xs font-bold text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Feedback form state
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

  const activeRequest = requests
    .filter((r) => ACTIVE_STATUSES.includes(r.status))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] ?? null;

  const totalKgRecycled = requests
    .filter((r) => r.status === 'COMPLETED')
    .reduce((total, r) => {
      const items = Array.isArray(r.items) ? r.items : [];
      return total + items.reduce((s, item) => s + (Number(item.estimatedWeight) || 0), 0);
    }, 0);
  const co2Saved   = +(totalKgRecycled * 1.5).toFixed(1);
  const treesEquiv = Math.max(0, Math.round(co2Saved / 22));

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
      refetch(); 
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
      sub:      '+12% from last month',
      Icon:     ClipboardList,
      iconColor:'text-emerald-600 dark:text-emerald-400',
      iconBg:   'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label:    'Active / Pending',
      value:    activePending < 10 ? `0${activePending}` : activePending,
      sub:      'Currently in process',
      Icon:     Activity,
      iconColor:'text-emerald-600 dark:text-emerald-400',
      iconBg:   'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label:    'Total Earnings',
      value:    formatCurrency(totalEarnings),
      sub:      'Withdrawal available',
      Icon:     TrendingUp,
      iconColor:'text-emerald-600 dark:text-emerald-400',
      iconBg:   'bg-emerald-50 dark:bg-emerald-900/20',
    },
  ];

  const hasActiveOperations = activeRequest || quotedRequests.length > 0;
  const hasInsights = totalKgRecycled > 0 || pendingFeedbackRequest;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

      {/* ── Unified Hero Banner ── */}
      <div className="relative overflow-hidden bg-[#0A4728] rounded-[2rem] p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}. Ready to recycle today?
          </h1>
          <p className="text-green-100/90 text-sm md:text-base mb-8 max-w-xl">
            Your waste management journey has diverted <span className="font-bold text-white">{totalKgRecycled}kg</span> of waste from landfills this month. Keep up the great work!
          </p>
          <button
            onClick={() => navigate('/user/new-request')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-[#0A4728] rounded-full text-sm font-bold transition-all shadow-lg"
          >
            <div className="w-5 h-5 rounded-full border-2 border-[#0A4728] flex items-center justify-center">
              <Plus size={12} strokeWidth={3} />
            </div>
            Submit New Pickup Request
          </button>
        </div>
        {/* Subtle Background Pattern/Watermark */}
        <div className="absolute right-0 bottom-0 pointer-events-none opacity-5 select-none text-[8rem] font-bold leading-none translate-x-1/4 translate-y-1/4 text-white">
          SUSTAINABILITY
        </div>
        <div className="absolute top-0 right-10 pointer-events-none opacity-20 transform rotate-12 scale-150">
          <Leaf size={200} className="text-green-500" strokeWidth={1} />
        </div>
      </div>

      {/* ── Stat cards ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-[2rem] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STAT_CARDS.map(({ label, value, sub, Icon, iconColor, iconBg }) => (
            <div
              key={label}
              className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center"
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">{label}</p>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white leading-none">{value}</p>
                <p className="text-xs text-green-600 dark:text-green-500 font-semibold mt-2">{sub}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon size={20} className={iconColor} strokeWidth={2.5} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Dynamic 2-Column Layout (Operations / Insights) ── */}
      {!loading && (hasActiveOperations || hasInsights) && (
        <div className={`grid grid-cols-1 ${hasActiveOperations ? 'lg:grid-cols-5' : 'lg:grid-cols-2'} gap-6 items-start`}>
          
          {/* Zone 1: Operations (Left) */}
          {hasActiveOperations && (
            <div className={`${hasActiveOperations ? 'lg:col-span-3' : ''} flex flex-col gap-6`}>
              {/* Active Pickup */}
              {activeRequest && <ActivePickupStatus request={activeRequest} />}
              
              {/* Pending Action Required — single widget, one row per quoted request */}
              {quotedRequests.length > 0 && (
                <div className="bg-[#FFFDF4] dark:bg-amber-900/10 rounded-[2rem] p-8 shadow-sm border border-[#FDF6D9] dark:border-amber-800/50">
                  <div className="flex items-center gap-2 mb-6">
                    <AlertTriangle size={16} className="text-amber-600 dark:text-amber-500" />
                    <h2 className="text-[11px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">
                      Pending Action Required
                    </h2>
                  </div>
                  <div className="flex flex-col gap-3">
                    {quotedRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-gray-800 rounded-[2rem] sm:rounded-full px-6 py-4 shadow-sm border border-gray-100 dark:border-gray-700 gap-4"
                      >
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Request ID</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">#{req.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <div className="text-right flex items-center gap-6">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            Quote: <span className="text-green-600">{formatCurrency(req.adminPrice)}</span>
                          </p>
                          <button
                            onClick={() => navigate(`/user/requests/${req.id}`)}
                            className="px-5 py-2.5 bg-[#0A4728] hover:bg-[#08361e] text-white text-xs font-bold rounded-full transition-colors whitespace-nowrap"
                          >
                            View & Respond
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Zone 2: Insights (Right) */}
          <div className={`${hasActiveOperations ? 'lg:col-span-2' : 'w-full grid grid-cols-1 md:grid-cols-2 gap-6'} flex flex-col gap-6`}>
            {totalKgRecycled > 0 && (
              <EcoImpactWidget
                totalKg={totalKgRecycled}
                co2Saved={co2Saved}
                treesEquiv={treesEquiv}
              />
            )}
            {pendingFeedbackRequest ? (
              <PendingFeedbackWidget
                request={pendingFeedbackRequest}
                rating={feedbackRating}
                setRating={setFeedbackRating}
                comment={feedbackComment}
                setComment={setFeedbackComment}
                onSubmit={handleDashboardFeedback}
                submitting={submittingFB}
              />
            ) : totalKgRecycled > 0 && (
              /* Fallback Widget if no feedback is needed */
              <EcoTipWidget />
            )}
          </div>

        </div>
      )}

      {/* ── Recent Requests ── */}
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Requests
            </h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
              A detailed view of your last 5 recycling transactions.
            </p>
          </div>
          <button
            onClick={() => navigate('/user/requests')}
            className="text-xs font-bold text-[#0A4728] dark:text-green-400 hover:text-green-600 transition-colors flex items-center gap-1"
          >
            View all <span className="text-lg leading-none">›</span>
          </button>
        </div>

        <div>
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
            </div>
          )}

          {!loading && recentRequests.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left px-4 pb-4 text-[10px] font-bold text-gray-800 dark:text-gray-400 uppercase tracking-widest">Request ID</th>
                  <th className="text-left px-4 pb-4 text-[10px] font-bold text-gray-800 dark:text-gray-400 uppercase tracking-widest">Materials</th>
                  <th className="text-left px-4 pb-4 text-[10px] font-bold text-gray-800 dark:text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="text-right px-4 pb-4 text-[10px] font-bold text-gray-800 dark:text-gray-400 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {recentRequests.map((req) => (
                  <tr key={req.id} className="group">
                    <td className="px-4 py-5 font-bold text-xs text-[#0A4728] dark:text-green-400">
                      #{req.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-semibold text-xs">
                        <Recycle size={14} className="text-gray-400" />
                        {summariseItems(req.items)}
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-5 text-right text-gray-500 dark:text-gray-400 text-xs font-semibold">
                      {formatDate(req.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
      value: `${totalKg % 1 === 0 ? totalKg : totalKg.toFixed(1)} Kg`,
      color: 'text-white',
      bg:    'bg-white/10',
    },
    {
      Icon:  Wind,
      label: 'CO₂ Offset',
      value: `${co2Saved} Kg`,
      color: 'text-white',
      bg:    'bg-white/10',
    },
    {
      Icon:  TreePine,
      label: 'Trees Equivalent',
      value: treesEquiv > 0 ? `${treesEquiv} Trees` : '< 1 Tree',
      color: 'text-white',
      bg:    'bg-white/10',
    },
  ];

  return (
    <div className="bg-[#118A4F] rounded-[2rem] p-8 shadow-sm text-white flex flex-col h-full relative overflow-hidden">
      <h2 className="text-lg font-bold mb-6">Your Eco Impact</h2>
      
      <div className="space-y-4 mb-8">
        {metrics.map(({ Icon, label, value, bg }) => (
          <div key={label} className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
              <Icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-green-100 uppercase tracking-widest mb-0.5">{label}</p>
              <p className="text-lg font-extrabold text-white leading-none">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Goal Progress */}
      <div className="mt-auto">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-green-100 uppercase tracking-widest">Monthly Goal</span>
          <span className="text-[10px] font-bold text-white">85%</span>
        </div>
        <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full" style={{ width: '85%' }} />
        </div>
      </div>
    </div>
  );
}

/* ── PendingFeedbackWidget ───────────────────────────────────── */

function PendingFeedbackWidget({ request, rating, setRating, comment, setComment, onSubmit, submitting }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-8 flex flex-col h-full">
      <h2 className="text-[11px] font-bold text-gray-800 dark:text-gray-200 uppercase tracking-widest mb-4">Service Feedback</h2>
      <div className="mb-5">
        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">How was your last collection experience?</p>
        <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
          Order #{request.id.slice(0, 8).toUpperCase()} • Completed on {formatDate(request.updatedAt)}
        </p>
      </div>
      
      <div className="flex items-center gap-1 mb-6">
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div className="flex-1">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Leave a comment..."
          className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none transition-all mb-4"
        />
      </div>

      <button
        onClick={onSubmit}
        disabled={submitting || rating === 0}
        className="w-full py-3 bg-[#0A4728] hover:bg-[#08361e] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-full text-sm transition-colors mt-auto"
      >
        {submitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </div>
  );
}

/* ── EcoTipWidget (Fallback) ─────────────────────────────────── */

function EcoTipWidget() {
  const tips = [
    "Recycling one aluminum can saves enough energy to run a TV for three hours.",
    "Recycling paper saves 60% of the energy needed to make paper from new wood.",
    "A single recycled plastic bottle saves enough energy to power a 60W bulb for 6 hours.",
    "Electronic waste contains precious metals; recycling it reduces toxic mining.",
    "Every ton of recycled steel saves 1.5 tons of iron ore and 0.5 tons of coal."
  ];
  // Stable random selection based on current date (changes daily)
  const tipIndex = new Date().getDate() % tips.length;
  const tip = tips[tipIndex];

  return (
    <div className="bg-[#f0f9f4] dark:bg-green-900/10 rounded-[2rem] shadow-sm border border-green-100 dark:border-green-800/50 p-8 flex flex-col h-full justify-center">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800/50 flex items-center justify-center shrink-0">
          <Lightbulb size={20} className="text-[#0A4728] dark:text-green-400" />
        </div>
        <h2 className="text-[11px] font-bold text-[#0A4728] dark:text-green-500 uppercase tracking-widest">Did You Know?</h2>
      </div>
      <p className="text-sm font-semibold text-green-900 dark:text-green-100 leading-relaxed">
        "{tip}"
      </p>
    </div>
  );
}
