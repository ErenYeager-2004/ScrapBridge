import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Pencil, Save, Trash2, CheckCircle, XCircle,
  Lock, ClipboardList, Truck, ShoppingBag, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserById, updateUser, deleteUser } from '../../api/admin.api';
import { formatDate, formatCurrency, formatWeight } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';
import StarRating from '../../components/common/StarRating';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserById(id);
        setUser(res.data.user || res.data); 
      } catch (err) {
        setError(err?.response?.data?.message || err?.response?.data?.error || "Failed to load user.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleEditToggle = () => {
    if (editMode) {
      setEditMode(false);
      setEditName("");
      setEditPhone("");
    } else {
      setEditMode(true);
      setEditName(user.name);
      setEditPhone(user.phone || "");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser(id, { name: editName, phone: editPhone });
      setUser(prevUser => ({
  ...prevUser,
  name: editName,
  phone: editPhone
}));
  
      setEditMode(false);
      toast.success("User updated successfully.");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || "Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setShowDeleteModal(false);
    try {
      await deleteUser(id);
      toast.success("User deleted.");
      navigate("/admin/users");
    } catch (err) {
      if (err?.response?.status === 409) {
        toast.error(err.response.data.message || err.response.data.error || "Conflict: User has active records.");
      } else {
        toast.error("Failed to delete user.");
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mr-3"></div>
        Loading user…
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <AlertTriangle size={32} className="text-red-500 mb-3" />
        <p className="mb-4">{error || "User not found or access denied."}</p>
        <button
          onClick={() => navigate("/admin/users")}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"
        >
          Back to Users
        </button>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      {/* 1. TOP BAR */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/admin/users")}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ChevronLeft size={16} /> Back to Users
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* USER INFO CARD */}
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm p-8 relative">
            {!editMode ? (
              <button
                onClick={handleEditToggle}
                className="absolute top-6 right-6 text-xs text-[#1A7A4A] dark:text-green-400 font-bold flex items-center gap-1 hover:underline"
              >
                <Pencil size={12} strokeWidth={3} /> Edit
              </button>
            ) : (
              <div className="absolute top-6 right-6 flex items-center gap-3">
                <button
                  onClick={handleEditToggle}
                  className="text-xs text-gray-400 font-bold hover:text-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-xs text-[#1A7A4A] dark:text-green-400 font-bold flex items-center gap-1 hover:underline disabled:opacity-50"
                >
                  {saving && <div className="w-3 h-3 border-2 border-[#1A7A4A]/30 border-t-[#1A7A4A] rounded-full animate-spin" />}
                  Save
                </button>
              </div>
            )}

            <div className="flex flex-col items-center mb-8 pt-4">
              <div className="w-24 h-24 bg-[#F2F4F7] dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-200 text-2xl font-bold mb-4 shadow-sm">
                {getInitials(user.name)}
              </div>
              
              {!editMode ? (
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{user.name}</h2>
              ) : (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mb-3 text-center text-xl font-bold border-b border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:border-[#1A7A4A] w-full max-w-[200px]"
                />
              )}

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                  ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 
                    user.role === 'HOME_USER' ? 'bg-[#E5F0FF] text-[#0055FF]' : 
                    user.role === 'COLLECTOR' ? 'bg-purple-100 text-purple-700' : 
                    'bg-amber-100 text-amber-700'}`}>
                  {user.role.replace('_', ' ')}
                </span>
                
                {user.isVerified ? (
                  <span className="flex items-center gap-1 px-3 py-1 bg-[#E8F5E9] text-[#2E7D32] rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle size={10} strokeWidth={3} /> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Unverified
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Phone
                </label>
                {!editMode ? (
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.phone || "Not provided"}</p>
                ) : (
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full text-sm font-medium border-b border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:border-[#1A7A4A] pb-1"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Member Since
                </label>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* DANGER ZONE CARD */}
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-[#D92D20]" strokeWidth={2.5} />
              <h3 className="font-bold text-[#D92D20] dark:text-red-400 text-lg">Danger Zone</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed font-medium">
              Permanently remove this user and all associated data. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={deleting}
              className="w-full bg-[#FFEAE8] hover:bg-red-200 dark:bg-red-900/30 text-[#D92D20] dark:text-red-400 py-3 rounded-full text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {deleting ? (
                <div className="w-4 h-4 border-2 border-[#D92D20]/30 border-t-[#D92D20] rounded-full animate-spin" />
              ) : null}
              Delete User
            </button>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* FEEDBACK CARD */}
          {user.role === "HOME_USER" && user.feedback && user.feedback.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm p-6 lg:p-8">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-6">Feedback Given</h3>
              <div className="space-y-4">
                {user.feedback.map(f => (
                  <div key={f.id} className="bg-[#F7F9FB] dark:bg-gray-700/50 rounded-[1.5rem] p-6">
                    <div className="flex items-center justify-between mb-3">
                      <StarRating value={f.rating} readOnly={true} />
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{formatDate(f.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                      "{f.comment || "No comment provided."}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REQUEST HISTORY CARD */}
          {user.role === "HOME_USER" && (
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm p-6 lg:p-8">
              <div className="mb-8">
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">Scrap Request History</h3>
              </div>
              
              {(() => {
                const requests = user.requests || [];
                if (requests.length === 0) return <p className="text-gray-400 text-sm text-center py-8 font-medium">No requests submitted yet.</p>;

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                          <th className="pb-4 px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Request ID</th>
                          <th className="pb-4 px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="pb-4 px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Materials</th>
                          <th className="pb-4 px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Price Quoted</th>
                          <th className="pb-4 px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map(r => {
                          let materialsStr = "—";
                          try {
                            const parsed = typeof r.items === 'string' ? JSON.parse(r.items) : r.items;
                            if (Array.isArray(parsed)) {
                              materialsStr = parsed.map(item => item.materialType).join(", ");
                            }
                          } catch (e) {
                            console.error("Failed to parse items JSON:", e);
                          }
                          return (
                            <tr key={r.id} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                              <td className="py-4 px-4 font-bold text-gray-900 dark:text-gray-100 text-xs whitespace-nowrap">#{r.id.slice(0, 8).toUpperCase()}</td>
                              <td className="py-4 px-4 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                              <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-xs font-medium">{materialsStr}</td>
                              <td className="py-4 px-4 font-bold text-gray-900 dark:text-gray-100 text-xs whitespace-nowrap">{r.adminPrice ? formatCurrency(r.adminPrice) : "Pending"}</td>
                              <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-xs font-medium whitespace-nowrap">{formatDate(r.createdAt)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ASSIGNED PICKUPS CARD (Collector) */}
          {user.role === "COLLECTOR" && (
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm p-6 lg:p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">Assigned Pickups</h3>
              </div>
              
              {(() => {
                const pickups = user.assignedPickups || [];
                if (pickups.length === 0) return <p className="text-gray-400 text-sm text-center py-8 font-medium">No pickups assigned yet.</p>;

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                          <th className="pb-4 px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pickup ID</th>
                          <th className="pb-4 px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="pb-4 px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Address</th>
                          <th className="pb-4 px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Scheduled</th>
                          <th className="pb-4 px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assigned</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pickups.map(p => (
                          <tr key={p.id} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                            <td className="py-4 px-4 font-bold text-gray-900 dark:text-gray-100 text-xs whitespace-nowrap">#{p.id.slice(0, 8).toUpperCase()}</td>
                            <td className="py-4 px-4 whitespace-nowrap"><StatusBadge status={p.status} /></td>
                            <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-xs font-medium">
                              {p.pickupAddress?.length > 35 ? p.pickupAddress.substring(0, 35) + "…" : p.pickupAddress || "—"}
                            </td>
                            <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-xs font-medium whitespace-nowrap">{p.scheduledDate ? formatDate(p.scheduledDate) : "—"}</td>
                            <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-xs font-medium whitespace-nowrap">{formatDate(p.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ORDER HISTORY CARD (Buyer) */}
          {user.role === "BUYER" && (
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm p-6 lg:p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">Order History</h3>
              </div>
              
              {(() => {
                const orders = user.orders || [];
                if (orders.length === 0) return <p className="text-gray-400 text-sm text-center py-8 font-medium">No orders placed yet.</p>;

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                          <th className="pb-4 px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                          <th className="pb-4 px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="pb-4 px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Material</th>
                          <th className="pb-4 px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Qty (kg)</th>
                          <th className="pb-4 px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</th>
                          <th className="pb-4 px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(o => (
                          <tr key={o.id} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                            <td className="py-4 px-4 font-bold text-gray-900 dark:text-gray-100 text-xs whitespace-nowrap">#{o.id.slice(0, 8).toUpperCase()}</td>
                            <td className="py-4 px-4 whitespace-nowrap"><StatusBadge status={o.status} /></td>
                            <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-xs font-medium">{o.inventory?.materialType || "—"}</td>
                            <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-xs font-medium whitespace-nowrap">{formatWeight(o.quantityKg)}</td>
                            <td className="py-4 px-4 font-bold text-gray-900 dark:text-gray-100 text-xs whitespace-nowrap">{formatCurrency(o.totalPrice)}</td>
                            <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-xs font-medium whitespace-nowrap">{formatDate(o.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}

        </div>
      </div>

      {/* DELETE CONFIRM MODAL */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to permanently delete ${user?.name}? This cannot be undone.`}
      />
    </div>
  );
}
