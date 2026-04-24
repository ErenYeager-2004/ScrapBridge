import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  MapPin,
  Phone,
  FileText,
  Image as ImageIcon,
  CalendarClock,
  User,
  Download,
  CheckCircle,
  XCircle,
  Star,
  MessageSquare,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { getRequestById, respondToQuote, downloadReceipt } from '../../api/requests.api';
import { submitFeedback } from '../../api/feedback.api';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import StarRating from '../../components/common/StarRating';
import { formatDate, formatCurrency, formatWeight } from '../../utils/formatters';

const MATERIAL_LABELS = {
  IRON_STEEL:      'Iron / Steel',
  COPPER:          'Copper',
  ALUMINIUM:       'Aluminium',
  BRASS:           'Brass',
  PLASTIC:         'Plastic',
  PAPER_CARDBOARD: 'Paper / Cardboard',
  GLASS:           'Glass',
  E_WASTE:         'E-Waste',
  RUBBER:          'Rubber',
  MIXED:           'Mixed / Other',
};

const AFTER_QUOTED = ['SCHEDULED', 'COLLECTED', 'COMPLETED'];

export default function RequestDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [responding, setResponding]           = useState(false);
  const [downloading, setDownloading]         = useState(false);

  // Feedback form state
  const [feedbackRating,  setFeedbackRating]  = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFB,    setSubmittingFB]    = useState(false);
  const [fbSubmitted,     setFbSubmitted]     = useState(false);

  const { data, loading, error, refetch } = useFetch(
    () => getRequestById(id),
    [id]
  );

  const req = data?.request ?? data;

  /* ──────────────────────────────────────── */

  const handleAccept = async () => {
    setAcceptModalOpen(false);
    setResponding(true);
    try {
      await respondToQuote(id, 'accept');
      toast.success('Quote accepted! Pickup will be scheduled soon.');
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to accept quote');
    } finally {
      setResponding(false);
    }
  };

  const handleReject = async (reason) => {
    setRejectModalOpen(false);
    setResponding(true);
    try {
      await respondToQuote(id, 'reject');
      toast.success('Quote rejected.');
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to reject quote');
    } finally {
      setResponding(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadReceipt(id);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to download receipt. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (feedbackRating === 0) {
      toast.error('Please select a star rating before submitting.');
      return;
    }
    setSubmittingFB(true);
    try {
      await submitFeedback({
        requestId: id,
        rating:    feedbackRating,
        comment:   feedbackComment.trim() || undefined,
      });
      toast.success('Thank you for your feedback!');
      setFbSubmitted(true);
      refetch();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        toast.error('You have already submitted feedback for this request.');
      } else {
        toast.error(err?.response?.data?.error ?? 'Failed to submit feedback.');
      }
    } finally {
      setSubmittingFB(false);
    }
  };

  /* ──────── render helpers ──────────────── */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !req) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500">Failed to load request details.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-sm text-green-600 hover:underline"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const totalWeight = (req.items ?? []).reduce((s, i) => s + (i.estimatedWeight ?? 0), 0);
  const isQuoted    = req.status === 'QUOTED';
  const isScheduled = AFTER_QUOTED.includes(req.status);
  const isCompleted = req.status === 'COMPLETED';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      {/* Back + header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Back to My Requests
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Request{' '}
              <span className="font-mono text-base text-gray-500">
                #{req.id.slice(0, 8).toUpperCase()}
              </span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Submitted on {formatDate(req.createdAt)}
            </p>
          </div>
          <StatusBadge status={req.status} />
        </div>
      </div>

      {/* ── Quote Response Section (QUOTED only) ── */}
      {isQuoted && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-5">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
            Admin's Quote
          </p>
          <p className="text-3xl font-bold text-blue-900 dark:text-white mb-4">
            {formatCurrency(req.quotedPrice)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
            Please review and accept or reject this quote. Once accepted, the pickup will be
            scheduled.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setAcceptModalOpen(true)}
              disabled={responding}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              <CheckCircle size={16} /> Accept Quote
            </button>
            <button
              onClick={() => setRejectModalOpen(true)}
              disabled={responding}
              className="flex items-center gap-2 px-6 py-2.5 border-2 border-red-400 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60 font-semibold rounded-xl transition-colors text-sm"
            >
              <XCircle size={16} /> Reject Quote
            </button>
          </div>
        </div>
      )}

      {/* ── Materials table ── */}
      <Section title="Materials">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Material Type
                </th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Est. Weight
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {(req.items ?? []).map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/20">
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                    {MATERIAL_LABELS[item.materialType] ?? item.materialType}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                    {formatWeight(item.estimatedWeight)}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 dark:bg-gray-700/30 font-semibold">
                <td className="px-4 py-2.5 text-gray-700 dark:text-gray-200 text-xs uppercase">
                  Total
                </td>
                <td className="px-4 py-2.5 text-right text-green-700 dark:text-green-400">
                  {formatWeight(totalWeight)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── Pickup Details ── */}
      <Section title="Pickup Details">
        <div className="space-y-3 text-sm">
          <InfoRow Icon={MapPin} label="Address" value={req.pickupAddress} />
          <InfoRow Icon={Phone}  label="Contact" value={req.contactPhone} />
          {req.notes && <InfoRow Icon={FileText} label="Notes" value={req.notes} />}
        </div>
      </Section>

      {/* ── Photos ── */}
      {req.photos && req.photos.length > 0 && (
        <Section title="Photos">
          <div className="flex flex-wrap gap-3">
            {req.photos.map((photoPath, idx) => (
              <a
                key={idx}
                href={photoPath}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-video overflow-hidden rounded border border-gray-200 dark:border-gray-700"
              >
                <img
                  src={photoPath}
                  alt={`Scrap ${idx + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </a>
            ))}
          </div>
        </Section>
      )}

      {/* ── Admin Notes (QUOTED or later, if present) ── */}
      {(isQuoted || isScheduled) && req.adminNotes && (
        <Section title="Admin Notes">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {req.adminNotes}
          </p>
        </Section>
      )}

      {/* ── Scheduled Info ── */}
      {isScheduled && (
        <Section title="Schedule Information">
          <div className="space-y-3 text-sm">
            <InfoRow
              Icon={CalendarClock}
              label="Scheduled Date"
              value={req.scheduledDate ? formatDate(req.scheduledDate) : 'To be confirmed'}
            />
            {req.collector && (
              <InfoRow
                Icon={User}
                label="Collector"
                value={`${req.collector.name} (${req.collector.email})`}
              />
            )}
          </div>
        </Section>
      )}

      {/* ── Completion banner ── */}
      {isCompleted && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <CheckCircle size={36} className="text-emerald-600 shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-emerald-800 dark:text-emerald-300">
              ✓ Pickup Completed!
            </h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-0.5">
              Your scrap has been successfully collected. Your receipt is ready to download.
            </p>
          </div>
          {req.receiptPath && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors"
            >
              {downloading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Preparing…
                </>
              ) : (
                <>
                  <Download size={15} /> Download PDF Receipt
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* ── Feedback section (COMPLETED only) ── */}
      {isCompleted && (() => {
        const existingFeedback = req.feedback;
        const hasSubmitted = fbSubmitted || !!existingFeedback;

        if (hasSubmitted) {
          // Read-only "Your Review" card
          const displayRating  = existingFeedback?.rating  ?? feedbackRating;
          const displayComment = existingFeedback?.comment ?? feedbackComment;
          return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex items-center gap-2">
                <Star size={15} className="text-amber-400 fill-amber-400" />
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                  Your Review
                </h2>
              </div>
              <div className="px-5 py-5 space-y-3">
                <StarRating value={displayRating} readOnly />
                {displayComment && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                    "{displayComment}"
                  </p>
                )}
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Thank you for your feedback!
                </p>
              </div>
            </div>
          );
        }

        // Interactive feedback form
        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex items-center gap-2">
              <MessageSquare size={15} className="text-green-600" />
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                Rate Your Experience
              </h2>
            </div>
            <div className="px-5 py-5 space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                How satisfied were you with this pickup? Your feedback helps us improve.
              </p>
              <div className="flex items-center gap-3">
                <StarRating
                  value={feedbackRating}
                  onChange={setFeedbackRating}
                />
                {feedbackRating > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][feedbackRating]}
                  </span>
                )}
              </div>
              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                rows={3}
                placeholder="Share your experience (optional)…"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none transition"
              />
              <button
                onClick={handleSubmitFeedback}
                disabled={submittingFB || feedbackRating === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors"
              >
                {submittingFB ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Star size={15} /> Submit Review
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })()}

      {/* No-photo placeholder */}
      {(!req.photos || req.photos.length === 0) && (
        <Section title="Photos">
          <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 py-2">
            <ImageIcon size={18} />
            No photos uploaded with this request.
          </div>
        </Section>
      )}

      {/* Accept modal */}
      <ConfirmModal
        isOpen={acceptModalOpen}
        title="Accept Quote?"
        message={`You are accepting a quote of ${formatCurrency(
          req.quotedPrice
        )}. The pickup will be scheduled after confirmation.`}
        onConfirm={handleAccept}
        onCancel={() => setAcceptModalOpen(false)}
      />

      {/* Reject modal */}
      <ConfirmModal
        isOpen={rejectModalOpen}
        title="Reject Quote?"
        message="Please let us know why you are rejecting this quote (optional)."
        showInput
        inputLabel="Reason"
        inputPlaceholder="e.g. Quote too low…"
        onConfirm={handleReject}
        onCancel={() => setRejectModalOpen(false)}
      />
    </div>
  );
}

/* ── Small helpers ────────────────────────────────────────────── */

function Section({ title, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
          {title}
        </h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function InfoRow({ Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="mt-0.5 text-gray-400 shrink-0" />
      <div>
        <span className="text-xs text-gray-400 dark:text-gray-500 block">{label}</span>
        <span className="text-gray-800 dark:text-gray-200">{value || '—'}</span>
      </div>
    </div>
  );
}
