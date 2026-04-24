import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Package, Calendar, Image as ImageIcon, CheckCircle, Loader } from 'lucide-react';
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import { getRequestById, collectRequest } from '../../api/requests.api';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatDate, formatCurrency } from '../../utils/formatters';

export default function PickupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collectModal, setCollectModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchRequest = useCallback(() => getRequestById(id), [id]);
  const { data, loading, error, refetch } = useFetch(fetchRequest);
  const request = data?.request ?? null;

  const handleCollect = async () => {
    setCollectModal(false);
    setSubmitting(true);
    try {
      await collectRequest(id);
      toast.success('Pickup marked as collected!');
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.error ?? 'Failed to mark as collected.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader size={20} className="animate-spin mr-2" /> Loading pickup…
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="p-8 text-center text-red-500">
        Pickup not found or failed to load.{' '}
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
        onClick={() => navigate('/collector/pickups')}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
      >
        <ArrowLeft size={16} /> Back to My Pickups
      </button>

      {/* Title row */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white font-mono">
          #{request.id.slice(0, 8)}
        </h1>
        <StatusBadge status={request.status} />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-3 space-y-5">

          {/* User contact */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <User size={14} /> User Contact
            </h2>
            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <p><span className="font-medium">Name:</span> {request.user?.name ?? '—'}</p>
              <p><span className="font-medium">Phone:</span> {request.contactPhone || request.user?.phone || '—'}</p>
              <p><span className="font-medium">Email:</span> {request.user?.email ?? '—'}</p>
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

          {/* Scheduled date */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar size={14} /> Schedule
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {request.scheduledDate
                ? formatDate(request.scheduledDate)
                : <span className="italic text-gray-400">Not yet scheduled</span>}
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
                      alt={`Scrap ${i + 1}`}
                      className="w-24 h-24 object-cover rounded-xl border border-gray-200 dark:border-gray-600 hover:opacity-80 transition-opacity"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── RIGHT COLUMN — Action Panel ── */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm sticky top-6">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Action
            </h2>

            {/* Quoted price info */}
            {request.adminPrice && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-sm">
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Agreed Price</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(request.adminPrice)}
                </p>
              </div>
            )}

            {/* SCHEDULED → Mark as Collected */}
            {request.status === 'SCHEDULED' && (
              <button
                id="mark-collected-btn"
                onClick={() => setCollectModal(true)}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 active:scale-[0.98] rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-green-500/20"
              >
                {submitting ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                Mark as Collected
              </button>
            )}

            {/* COLLECTED: already done */}
            {request.status === 'COLLECTED' && (
              <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-4 text-center">
                <CheckCircle size={22} className="mx-auto text-cyan-500 mb-2" />
                <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">Marked as Collected</p>
                <p className="text-xs text-cyan-500 dark:text-cyan-400 mt-1">Waiting for admin to complete.</p>
              </div>
            )}

            {/* COMPLETED */}
            {request.status === 'COMPLETED' && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-center">
                <CheckCircle size={22} className="mx-auto text-emerald-500 mb-2" />
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Pickup Completed</p>
              </div>
            )}

            {/* Other statuses */}
            {!['SCHEDULED', 'COLLECTED', 'COMPLETED'].includes(request.status) && (
              <div className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                No actions available for status: <strong>{request.status}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm collect modal */}
      <ConfirmModal
        isOpen={collectModal}
        title="Mark as Collected"
        message="Confirm that you have physically collected the scrap. This cannot be undone."
        onConfirm={handleCollect}
        onCancel={() => setCollectModal(false)}
      />
    </div>
  );
}
