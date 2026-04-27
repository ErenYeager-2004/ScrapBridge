import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Package, Image as ImageIcon, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import { getRequestById, quoteRequest, rejectRequest, completeRequest } from '../../api/requests.api';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatDate, formatCurrency } from '../../utils/formatters';
import api from '../../api/axios';

export default function AdminRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  /* ── fetch request ── */
  const fetchRequest = useCallback(() => getRequestById(id), [id]);
  const { data, loading, error, refetch } = useFetch(fetchRequest);
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
  const [prevRequest, setPrevRequest] = useState(null);
  if (request && request !== prevRequest) {
    setPrevRequest(request);
    setPrice(request.adminPrice ?? '');
    setCollectorId(request.collectorId ?? '');
    setNotes(request.adminNotes ?? '');
  }

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
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            #{request.id.slice(0, 8)}
          </h1>
          <StatusBadge status={request.status} />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
          Processed on {formatDate(request.createdAt)}
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT COLUMN (2/3) ── */}
        <div className="lg:col-span-2 space-y-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* User info - Client Details */}
            <section className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700/50 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                <User size={16} className="text-green-600 dark:text-green-400" /> Client Details
              </h2>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gray-900 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {request.user?.name ? request.user.name.substring(0, 2).toUpperCase() : 'NA'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                    {request.user?.name ?? 'Unknown Client'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">ScrapBridge User</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 space-y-3">
                <div className="grid grid-cols-3 items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</span>
                  <span className="col-span-2 text-sm text-gray-800 dark:text-gray-200 font-medium text-right">{request.contactPhone || request.user?.phone || '—'}</span>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</span>
                  <span className="col-span-2 text-sm text-gray-800 dark:text-gray-200 font-medium text-right truncate" title={request.user?.email}>{request.user?.email ?? '—'}</span>
                </div>
              </div>
            </section>

            {/* Pickup address - Extraction Site */}
            <section className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700/50 p-6 shadow-sm flex flex-col">
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                <MapPin size={16} className="text-green-600 dark:text-green-400" /> Extraction Site
              </h2>
              
              <div className="flex-1 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 flex flex-col items-center justify-center text-white mb-4 shadow-inner relative overflow-hidden group">
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <MapPin size={48} className="text-white drop-shadow-md mb-2" strokeWidth={1.5} fill="#dc2626" />
                <span className="text-xs font-bold uppercase tracking-wider text-white/90 drop-shadow">Location</span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 flex-shrink-0">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                  {request.pickupAddress || '—'}
                </p>
              </div>
            </section>
          </div>

          {/* Materials - Manifest & Yield */}
          <section className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700/50 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Package size={16} className="text-green-600 dark:text-green-400" /> Manifest & Yield
              </h2>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total: {items.reduce((sum, item) => sum + (item.estimatedWeight || 0), 0)} kg
              </span>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                <p className="text-sm text-gray-500 dark:text-gray-400">No items listed in manifest.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-100 dark:border-gray-700/50">
                      <th className="text-left pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Material Grade</th>
                      <th className="text-left pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Weight</th>
                      <th className="text-left pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Purity</th>
                      <th className="text-right pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Est. Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {items.map((item, i) => (
                      <tr key={i} className="group hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                        <td className="py-5 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                              <Package size={14} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white leading-tight">{item.materialType}</p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">Scrap Material</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">{item.estimatedWeight} kg</td>
                        <td className="py-5 whitespace-nowrap">
                          <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                            Standard
                          </span>
                        </td>
                        <td className="py-5 text-right font-bold text-gray-900 dark:text-white whitespace-nowrap">
                          —
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Photos */}
            {photos.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700/50">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ImageIcon size={14} /> Attached Media
                </h3>
                <div className="flex flex-wrap gap-3">
                  {photos.map((photoPath, i) => (
                    <a key={i} href={photoPath} target="_blank" rel="noopener noreferrer" className="block relative group">
                      <img
                        src={photoPath}
                        alt={`Scrap ${i + 1}`}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border border-gray-200 dark:border-gray-600 group-hover:shadow-md transition-all duration-200 group-hover:ring-2 group-hover:ring-green-500 ring-offset-2 dark:ring-offset-gray-800"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ── RIGHT COLUMN (1/3) — Action Panel ── */}
        <div className="lg:col-span-1">
          {request.status === 'COMPLETED' ? (
            <div className="bg-[#0b6a41] rounded-[2rem] p-8 shadow-lg text-white sticky top-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner">
                  <CheckCircle size={28} className="text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-lg font-black mb-1 tracking-tight">Request Completed</h2>
                  <p className="text-green-100 text-xs font-medium">Funds transferred</p>
                </div>
                
                <div className="w-full pt-4 pb-2">
                  <p className="text-green-200 text-[10px] font-bold uppercase tracking-widest mb-1">Final Payout</p>
                  <p className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-md">
                    {formatCurrency(request.adminPrice).replace(/\.00$/, '')}
                    <span className="text-xl sm:text-2xl text-green-200/80 font-bold drop-shadow-none">.00</span>
                  </p>
                </div>

                
                <div className="pt-2 text-[10px] text-green-200/80 font-medium tracking-wide">
                  Transaction ID: TRX-{request.id.slice(0, 8).toUpperCase()}
                </div>
              </div>
            </div>
          ) : request.status === 'REJECTED' ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-[2rem] p-8 shadow-sm sticky top-6 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-800/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={32} />
              </div>
              <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Request Rejected</h2>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-sm text-red-600 dark:text-red-300 font-medium border border-red-100 dark:border-red-800">
                {request.rejectionReason || 'No reason provided.'}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700/50 p-6 sm:p-8 shadow-sm sticky top-6">
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                Action Panel
              </h2>

              {/* ── PENDING: quote form ── */}
              {request.status === 'PENDING' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
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
                      className="w-full border-2 border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 focus:outline-none focus:border-green-500 focus:bg-white dark:focus:bg-gray-800 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Assign Collector
                    </label>
                    <select
                      id="collector-select"
                      value={collectorId}
                      onChange={(e) => setCollectorId(e.target.value)}
                      className="w-full border-2 border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 focus:outline-none focus:border-green-500 focus:bg-white dark:focus:bg-gray-800 transition-colors appearance-none"
                    >
                      <option value="">— Select collector —</option>
                      {collectors.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Admin Notes (optional)
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any notes for the user…"
                      className="w-full border-2 border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 focus:outline-none focus:border-green-500 focus:bg-white dark:focus:bg-gray-800 transition-colors resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      id="reject-request-btn"
                      onClick={() => setRejectModal(true)}
                      disabled={submitting}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-colors disabled:opacity-50"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                    <button
                      id="quote-assign-btn"
                      onClick={handleQuote}
                      disabled={submitting}
                      className="flex-[2] flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors disabled:opacity-50 shadow-sm hover:shadow"
                    >
                      {submitting ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      Quote & Assign
                    </button>
                  </div>
                </div>
              )}

              {/* ── QUOTED: awaiting user response ── */}
              {request.status === 'QUOTED' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl p-6 text-center">
                    <Clock size={28} className="mx-auto text-blue-500 mb-3" />
                    <h3 className="text-base font-bold text-blue-800 dark:text-blue-300 mb-1">Awaiting Response</h3>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80 font-medium">
                      The user has been notified to accept or reject the quote.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quoted Price</span>
                      <span className="text-base font-black text-gray-900 dark:text-white">{formatCurrency(request.adminPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Collector</span>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{request.collector?.name ?? 'Unassigned'}</span>
                    </div>
                    {request.adminNotes && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Notes</span>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{request.adminNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── SCHEDULED ── */}
              {request.status === 'SCHEDULED' && (
                <div className="space-y-6">
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 rounded-2xl p-6 text-center">
                    <Clock size={28} className="mx-auto text-purple-500 mb-3" />
                    <h3 className="text-base font-bold text-purple-800 dark:text-purple-300 mb-1">Pickup Scheduled</h3>
                    <p className="text-xs text-purple-600/80 dark:text-purple-400/80 font-medium">
                      Waiting for the collector to mark this as collected.
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{formatDate(request.scheduledDate)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Collector</span>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{request.collector?.name ?? 'Unassigned'}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Price</span>
                      <span className="text-base font-black text-gray-900 dark:text-white">{formatCurrency(request.adminPrice)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── COLLECTED: mark complete ── */}
              {request.status === 'COLLECTED' && (
                <div className="space-y-6">
                  <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800/50 rounded-2xl p-6 text-center">
                    <Package size={28} className="mx-auto text-cyan-500 mb-3" />
                    <h3 className="text-base font-bold text-cyan-800 dark:text-cyan-300 mb-1">Scrap Collected</h3>
                    <p className="text-xs text-cyan-600/80 dark:text-cyan-400/80 font-medium">
                      Ready for final completion.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Collector</p>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{request.collector?.name ?? '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Price</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(request.adminPrice)}</p>
                    </div>
                  </div>

                  <button
                    id="complete-request-btn"
                    onClick={() => setCompleteModal(true)}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors shadow-sm hover:shadow disabled:opacity-50"
                  >
                    {submitting ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    Mark as Completed
                  </button>
                </div>
              )}
            </div>
          )}
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
