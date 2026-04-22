import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Package, Image as ImageIcon, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import { getRequestById, quoteRequest, rejectRequest, completeRequest } from '../../api/requests.api';
import { getAllRequests } from '../../api/requests.api';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatDate, formatCurrency } from '../../utils/formatters';
import api from '../../api/axios';

export default function AdminRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  /* ── fetch request ── */
  const { data, loading, error, refetch } = useFetch(() => getRequestById(id), [id]);
  const request = data?.request ?? null;

  /* ── collectors list ── */
  const [collectors, setCollectors] = useState([]);
  useEffect(() => {
    api.get('/collectors').then((res) => setCollectors(res.data.collectors ?? [])).catch(() => {});
  }, []);

  /* ── quote form state ── */
  const [price, setPrice] = useState('');
  const [collectorId, setCollectorId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /* ── reject modal ── */
  const [rejectModal, setRejectModal] = useState(false);

  /* ── complete confirm ── */
  const [completeModal, setCompleteModal] = useState(false);

  /* ── populate form when request loads ── */
  useEffect(() => {
    if (request) {
      setPrice(request.adminPrice ?? '');
      setCollectorId(request.collectorId ?? '');
      setNotes(request.adminNotes ?? '');
    }
  }, [request]);

  /* ── handlers ── */
  const handleQuote = async () => {
    if (!price) return toast.error('Please enter a price.');
    setSubmitting(true);
    try {
      await quoteRequest(id, {
        adminPrice: parseFloat(price),
        collectorId: collectorId || undefined,
        adminNotes: notes || undefined,
      });
      toast.success('Quote submitted successfully!');
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.error ?? 'Failed to submit quote.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (reason) => {
    setRejectModal(false);
    setSubmitting(true);
    try {
      await rejectRequest(id, { rejectionReason: reason });
      toast.success('Request rejected.');
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.error ?? 'Failed to reject request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setCompleteModal(false);
    setSubmitting(true);
    try {
      await completeRequest(id);
      toast.success('Request marked as completed!');
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.error ?? 'Failed to complete request.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── render ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader size={20} className="animate-spin mr-2" /> Loading request…
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="p-8 text-center text-red-500">
        Request not found or failed to load.{' '}
        <button onClick={() => navigate(-1)} className="underline ml-1">Go back</button>
      </div>
    );
  }

  const items = Array.isArray(request.items) ? request.items : [];
  const photos = Array.isArray(request.photos) ? request.photos : [];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Back nav */}
      <button
        onClick={() => navigate('/admin/requests')}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
      >
        <ArrowLeft size={16} /> Back to All Requests
      </button>

      {/* Title row */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white font-mono">
          #{request.id.slice(0, 8)}
        </h1>
        <StatusBadge status={request.status} />
        <span className="ml-auto text-xs text-gray-400">{formatDate(request.createdAt)}</span>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── LEFT COLUMN (60%) ── */}
        <div className="lg:col-span-3 space-y-5">

          {/* User info */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <User size={14} /> User Information
            </h2>
            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <p><span className="font-medium">Name:</span> {request.user?.name ?? '—'}</p>
              <p><span className="font-medium">Email:</span> {request.user?.email ?? '—'}</p>
              <p><span className="font-medium">Phone:</span> {request.contactPhone || request.user?.phone || '—'}</p>
            </div>
          </section>

          {/* Pickup address */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin size={14} /> Pickup Address
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {request.pickupAddress || '—'}
            </p>
          </section>

          {/* Materials */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Package size={14} /> Materials
            </h2>
            {items.length === 0 ? (
              <p className="text-sm text-gray-400">No items listed.</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">Type</th>
                    <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">Est. Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2 text-gray-700 dark:text-gray-300 font-medium">{item.materialType}</td>
                      <td className="py-2 text-gray-500 dark:text-gray-400">{item.estimatedWeight} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Photos */}
          {photos.length > 0 && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ImageIcon size={14} /> Photos
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {photos.map((photoPath, i) => (
                  <a key={i} href={photoPath} target="_blank" rel="noopener noreferrer">
                    <img
                      src={photoPath}
                      alt={`scrap-photo-${i}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700 hover:opacity-80 transition-opacity"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── RIGHT COLUMN (40%) — Action Panel ── */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm sticky top-6">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Action Panel
            </h2>

            {/* ── PENDING: quote form ── */}
            {request.status === 'PENDING' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Quoted Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="admin-price-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 1200"
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Assign Collector
                  </label>
                  <select
                    id="collector-select"
                    value={collectorId}
                    onChange={(e) => setCollectorId(e.target.value)}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">— Select collector —</option>
                    {collectors.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Admin Notes (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any notes for the user…"
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    id="reject-request-btn"
                    onClick={() => setRejectModal(true)}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={15} /> Reject
                  </button>
                  <button
                    id="quote-assign-btn"
                    onClick={handleQuote}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {submitting ? <Loader size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                    Quote & Assign
                  </button>
                </div>
              </div>
            )}

            {/* ── QUOTED: awaiting user response ── */}
            {request.status === 'QUOTED' && (
              <div className="space-y-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-center">
                  <Clock size={20} className="mx-auto text-blue-500 mb-2" />
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Awaiting user response</p>
                  <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                    The user has been notified and will accept or reject the quote.
                  </p>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <p><span className="font-medium">Quoted Price:</span> {formatCurrency(request.adminPrice)}</p>
                  <p><span className="font-medium">Assigned Collector:</span> {request.collector?.name ?? 'Unassigned'}</p>
                  {request.adminNotes && (
                    <p><span className="font-medium">Notes:</span> {request.adminNotes}</p>
                  )}
                </div>
              </div>
            )}

            {/* ── SCHEDULED ── */}
            {request.status === 'SCHEDULED' && (
              <div className="space-y-3">
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Pickup Scheduled</p>
                  <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <p><span className="font-medium">Date:</span> {formatDate(request.scheduledDate)}</p>
                    <p><span className="font-medium">Collector:</span> {request.collector?.name ?? 'Unassigned'}</p>
                    <p><span className="font-medium">Price:</span> {formatCurrency(request.adminPrice)}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center">Waiting for the collector to mark this as collected.</p>
              </div>
            )}

            {/* ── COLLECTED: mark complete ── */}
            {request.status === 'COLLECTED' && (
              <div className="space-y-4">
                <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-4">
                  <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Scrap has been collected.</p>
                  <p className="text-xs text-cyan-500 dark:text-cyan-400 mt-1">
                    Collector: {request.collector?.name ?? '—'} | Price: {formatCurrency(request.adminPrice)}
                  </p>
                </div>
                <button
                  id="complete-request-btn"
                  onClick={() => setCompleteModal(true)}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                  Mark as Completed
                </button>
              </div>
            )}

            {/* ── COMPLETED ── */}
            {request.status === 'COMPLETED' && (
              <div className="space-y-3">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-center">
                  <CheckCircle size={24} className="mx-auto text-emerald-500 mb-2" />
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Request Completed</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    Final price paid: {formatCurrency(request.adminPrice)}
                  </p>
                </div>
                {request.receiptPath && (
                  <p className="text-xs text-gray-400 text-center">
                    Receipt: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{request.receiptPath}</code>
                  </p>
                )}
              </div>
            )}

            {/* ── REJECTED ── */}
            {request.status === 'REJECTED' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">Request Rejected</p>
                <p className="text-xs text-red-500 dark:text-red-400">
                  Reason: {request.rejectionReason || 'No reason provided.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject modal */}
      <ConfirmModal
        isOpen={rejectModal}
        title="Reject Request"
        message="Are you sure you want to reject this request? The user will be notified."
        showInput
        inputLabel="Rejection Reason (optional)"
        inputPlaceholder="Enter reason…"
        onConfirm={handleReject}
        onCancel={() => setRejectModal(false)}
      />

      {/* Complete modal */}
      <ConfirmModal
        isOpen={completeModal}
        title="Mark as Completed"
        message="This will mark the request as COMPLETED and create inventory records. This action cannot be undone."
        onConfirm={handleComplete}
        onCancel={() => setCompleteModal(false)}
      />
    </div>
  );
}
