import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Image as ImageIcon,
  CalendarDays,
  User,
  Download,
  CheckCircle,
  XCircle,
  Star,
  Clock,
  Check,
  Recycle,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import {
  getRequestById,
  respondToQuote,
  downloadReceipt,
} from "../../api/requests.api";
import { submitFeedback } from "../../api/feedback.api";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmModal from "../../components/common/ConfirmModal";
import StarRating from "../../components/common/StarRating";
import {
  formatDate,
  formatCurrency,
  formatWeight,
} from "../../utils/formatters";

const MATERIAL_LABELS = {
  IRON_STEEL: "Iron / Steel",
  COPPER: "Copper",
  ALUMINIUM: "Aluminium",
  BRASS: "Brass",
  PLASTIC: "Plastic",
  PAPER_CARDBOARD: "Paper / Cardboard",
  GLASS: "Glass",
  E_WASTE: "E-Waste",
  RUBBER: "Rubber",
  MIXED: "Mixed / Other",
};

const AFTER_QUOTED = ["SCHEDULED", "COLLECTED", "COMPLETED"];

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [responding, setResponding] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Feedback form state
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFB, setSubmittingFB] = useState(false);
  const [fbSubmitted, setFbSubmitted] = useState(false);

  const { data, loading, error, refetch } = useFetch(
    () => getRequestById(id),
    [id],
  );

  const req = data?.request ?? data;

  /* ──────────────────────────────────────── */

  const handleAccept = async () => {
    setAcceptModalOpen(false);
    setResponding(true);
    try {
      await respondToQuote(id, "accept");
      toast.success("Quote accepted! Pickup will be scheduled soon.");
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to accept quote");
    } finally {
      setResponding(false);
    }
  };

  const handleReject = async (reason) => {
    setRejectModalOpen(false);
    setResponding(true);
    try {
      await respondToQuote(id, "reject");
      toast.success("Quote rejected.");
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to reject quote");
    } finally {
      setResponding(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadReceipt(id);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ??
          "Failed to download receipt. Please try again.",
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (feedbackRating === 0) {
      toast.error("Please select a star rating before submitting.");
      return;
    }
    setSubmittingFB(true);
    try {
      await submitFeedback({
        requestId: id,
        rating: feedbackRating,
        comment: feedbackComment.trim() || undefined,
      });
      toast.success("Thank you for your feedback!");
      setFbSubmitted(true);
      refetch();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        toast.error("You have already submitted feedback for this request.");
      } else {
        toast.error(err?.response?.data?.error ?? "Failed to submit feedback.");
      }
    } finally {
      setSubmittingFB(false);
    }
  };

  /* ──────── render helpers ──────────────── */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-4 border-[#0A4728] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !req) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500">Failed to load request details.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-sm text-[#0A4728] font-bold hover:underline"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const isQuoted = req.status === "QUOTED";
  const isAccepted = req.status === "ACCEPTED";
  const isScheduled = AFTER_QUOTED.includes(req.status);
  const isCompleted = req.status === "COMPLETED";
  const isCompletedOrCollected = isCompleted || req.status === "COLLECTED";

  const STATUS_STEP = {
    PENDING: 0,
    QUOTED: 1,
    ACCEPTED: 2,
    SCHEDULED: 3,
    COLLECTED: 4,
    COMPLETED: 5,
  };
  const steps = [
    { label: "SUBMITTED", icon: Check },
    { label: "QUOTED", icon: Check },
    { label: "ACCEPTED", icon: Clock },
    { label: "SCHEDULED", icon: Calendar },
    { label: "COLLECTED", icon: Recycle },
  ];
  const currentStep = STATUS_STEP[req.status] ?? 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Back + header */}
      <div>
        <button
          onClick={() => navigate("/user/requests")}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back to Requests
        </button>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a1a1a] dark:text-white tracking-tight">
              #REQ-{req.id.slice(0, 8).toUpperCase()}
            </h1>
            <StatusBadge status={req.status} />
          </div>
          <div className="text-left md:text-right">
            <p className="text-[11px] md:text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wide mb-1">
              Submitted
            </p>
            <p className="text-sm md:text-base font-extrabold text-[#1a1a1a] dark:text-white">
              {formatDate(req.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Completion banner ── */}
      {isCompleted && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-[2rem] p-6 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <CheckCircle size={36} className="text-emerald-600 shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-emerald-800 dark:text-emerald-300">
              ✓ Pickup Completed!
            </h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
              Your scrap has been successfully collected. Your receipt is ready
              to download.
            </p>
          </div>
          {req.receiptPath && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0A4728] hover:bg-[#08361e] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-full text-sm font-bold transition-colors"
            >
              {downloading ? (
                "Preparing..."
              ) : (
                <>
                  <Download size={16} /> Download Receipt
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Stepper & Active Status Banner (Hidden if COMPLETED) */}
      {!isCompleted && (
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-8 mb-6">
          {/* Stepper */}
          <div className="flex items-start justify-between relative mb-8 px-2">
            <div className="absolute top-4 left-[5%] right-[5%] h-0.5 bg-gray-200 dark:bg-gray-700 z-0" />
            <div
              className="absolute top-4 left-[5%] h-0.5 bg-[#0A4728] z-0 transition-all duration-500 ease-in-out"
              style={{
                width: `${Math.min(100, Math.max(0, (currentStep / (steps.length - 1)) * 90))}%`,
              }}
            />

            {steps.map((step, idx) => {
              const isDone = idx < currentStep;
              const isActive = idx === currentStep;
              const StepIcon = step.icon;

              return (
                <div
                  key={step.label}
                  className="relative z-10 flex flex-col items-center"
                >
                  <div className="mb-3 bg-white dark:bg-gray-800">
                    {isDone || isActive ? (
                      <div className="w-9 h-9 rounded-full bg-[#0A4728] flex items-center justify-center shadow-sm">
                        {isDone ? (
                          <Check
                            size={16}
                            strokeWidth={3}
                            className="text-white"
                          />
                        ) : (
                          <StepIcon size={16} className="text-white" />
                        )}
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm">
                        <StepIcon
                          size={16}
                          className="text-gray-400 dark:text-gray-500"
                        />
                      </div>
                    )}
                  </div>
                  <p
                    className={`text-[10px] font-bold tracking-wider ${isDone || isActive ? "text-[#0A4728] dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Banner */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 shadow-sm border border-gray-100 dark:border-gray-700">
              <CalendarDays size={18} className="text-green-600" />
            </div>
            <div className="flex-1">
              {isQuoted && (
                <>
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                    Estimated Collection Date
                  </p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Pending Acceptance
                  </p>
                </>
              )}
              {isAccepted && (
                <>
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                    Estimated Collection Date
                  </p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Awaiting Assignment
                  </p>
                </>
              )}
              {isScheduled && (
                <>
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                    Collection Status
                  </p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {req.status}
                  </p>
                </>
              )}
              {!isQuoted && !isAccepted && !isScheduled && (
                <>
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                    Collection Status
                  </p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {req.status}
                  </p>
                </>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium md:text-right max-w-sm">
              {isQuoted &&
                "Review and accept the quote below to lock in scheduling options."}
              {isAccepted &&
                "The admin is assigning a collector and will confirm your pickup shortly."}
              {isScheduled &&
                req.status === "SCHEDULED" &&
                `Your pickup is scheduled for ${formatDate(req.scheduledDate)}.`}
              {req.status === "COLLECTED" &&
                "Your items have been successfully collected. Awaiting final processing."}
              {req.status === "PENDING" &&
                "Your request is pending review by an administrator."}
            </div>
          </div>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Materials Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Materials Breakdown
              </h2>
              <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full">
                {req.items?.length || 0} Categories
              </span>
            </div>

            <div className="space-y-3">
              {(req.items ?? []).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700">
                      <Recycle size={18} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {MATERIAL_LABELS[item.materialType] ??
                          item.materialType}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatWeight(item.estimatedWeight)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submitted Documentation */}
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-6">
              Submitted Documentation
            </h2>
            {req.photos && req.photos.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {req.photos.map((photoPath, idx) => (
                  <a
                    key={idx}
                    href={photoPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-32 h-32 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700"
                  >
                    <img
                      src={photoPath}
                      alt={`Scrap ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 py-2">
                <ImageIcon size={18} />
                No photos uploaded with this request.
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Official Quote */}
          {req.adminPrice !== null && req.adminPrice !== undefined && (
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">$</span>
                </div>
                <h2 className="text-[11px] font-bold text-gray-800 dark:text-gray-200 uppercase tracking-widest">
                  Official Quote
                </h2>
              </div>

              <div className="mb-6">
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Total Valuation
                </p>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {formatCurrency(req.adminPrice)}
                </p>
              </div>

              {isQuoted && (
                <div className="flex flex-col gap-3 mt-6">
                  <button
                    onClick={() => setAcceptModalOpen(true)}
                    disabled={responding}
                    className="w-full py-3 bg-[#0A4728] hover:bg-[#08361e] disabled:opacity-60 text-white font-bold rounded-full transition-colors text-sm"
                  >
                    Accept Quote
                  </button>
                  <button
                    onClick={() => setRejectModalOpen(true)}
                    disabled={responding}
                    className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 disabled:opacity-60 font-bold rounded-full transition-colors text-sm"
                  >
                    Reject Quote
                  </button>
                </div>
              )}
              {!isQuoted && isAccepted && (
                <div className="mt-4 px-4 py-3 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 text-xs font-bold rounded-xl text-center">
                  Quote Accepted
                </div>
              )}
            </div>
          )}

          {/* Pickup Logistics */}
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-widest mb-6">
              Pickup Logistics
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  Facility Address
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-relaxed">
                  {req.pickupAddress}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  Contact Phone
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {req.contactPhone}
                </p>
              </div>

              {req.notes && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30 mt-4">
                  <div className="flex gap-2">
                    <AlertTriangle
                      size={16}
                      className="text-amber-500 shrink-0 mt-0.5"
                    />
                    <p className="text-xs font-medium text-amber-800 dark:text-amber-200 leading-relaxed">
                      {req.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Admin Notes */}
          {req.adminNotes && (
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-widest mb-4">
                Admin Notes
              </h2>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                {req.adminNotes}
              </p>
            </div>
          )}

          {/* Collector Details */}
          {isScheduled && req.collector && (
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-widest mb-4">
                Assigned Collector
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                  <User size={18} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {req.collector.name}
                  </p>
                  <p className="text-xs font-medium text-gray-500">
                    {req.collector.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Feedback section (COMPLETED or COLLECTED only) */}
          {isCompletedOrCollected &&
            (() => {
              const existingFeedback = req.feedback;
              const hasSubmitted = fbSubmitted || !!existingFeedback;

              if (hasSubmitted) {
                // Read-only
                const displayRating =
                  existingFeedback?.rating ?? feedbackRating;
                const displayComment =
                  existingFeedback?.comment ?? feedbackComment;
                return (
                  <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Star
                        size={16}
                        className="text-amber-400 fill-amber-400"
                      />
                      <h2 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-widest">
                        Your Review
                      </h2>
                    </div>
                    <div className="space-y-3">
                      <StarRating value={displayRating} readOnly />
                      {displayComment && (
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed italic">
                          "{displayComment}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              }

              // Interactive feedback form
              return (
                <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Star size={16} className="text-green-600" />
                    <h2 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-widest">
                      Rate Your Experience
                    </h2>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <StarRating
                        value={feedbackRating}
                        onChange={setFeedbackRating}
                      />
                    </div>
                    <textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      rows={3}
                      placeholder="Share your feedback..."
                      className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none transition-all"
                    />
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={submittingFB || feedbackRating === 0}
                      className="w-full py-3 bg-[#0A4728] hover:bg-[#08361e] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-full text-sm transition-colors"
                    >
                      {submittingFB ? "Submitting..." : "Submit Feedback"}
                    </button>
                  </div>
                </div>
              );
            })()}
        </div>
      </div>

      {/* Accept modal */}
      <ConfirmModal
        isOpen={acceptModalOpen}
        title="Accept Quote?"
        message={`You are accepting a quote of ${formatCurrency(
          req.adminPrice || 0,
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
