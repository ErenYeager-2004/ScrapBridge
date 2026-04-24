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
      const res = await updateUser(id, { name: editName, phone: editPhone });
      setUser(res.data.user || res.data);
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

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* 1. TOP BAR */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/admin/users")}
          className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <ChevronLeft size={16} /> Back to Users
        </button>

        <div>
          {!editMode ? (
            <button
              onClick={handleEditToggle}
              className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              <Pencil size={16} /> Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleEditToggle}
                className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#1A7A4A] hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. USER INFO CARD */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left column — identity fields */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                Full Name
              </label>
              {!editMode ? (
                <p className="text-gray-900 dark:text-white font-medium">{user.name}</p>
              ) : (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]"
                />
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <p className="text-gray-900 dark:text-white">{user.email}</p>
              {editMode && (
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Lock size={10} /> Email cannot be changed.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                Phone
              </label>
              {!editMode ? (
                user.phone ? (
                  <p className="text-gray-900 dark:text-white">{user.phone}</p>
                ) : (
                  <span className="text-gray-400 italic text-sm">Not provided</span>
                )
              ) : (
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]"
                />
              )}
            </div>
          </div>

          {/* Right column — status fields */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                Role
              </label>
              <div>
                {user.role === 'ADMIN' && <span className="px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-medium">Admin</span>}
                {user.role === 'HOME_USER' && <span className="px-2.5 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-medium">Home User</span>}
                {user.role === 'COLLECTOR' && <span className="px-2.5 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-xs font-medium">Collector</span>}
                {user.role === 'BUYER' && <span className="px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-xs font-medium">Buyer</span>}
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                Account Status
              </label>
              <div>
                {user.isVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                    <CheckCircle size={12} /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-medium">
                    <XCircle size={12} /> Unverified
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                Member Since
              </label>
              <p className="text-gray-900 dark:text-white">{formatDate(user.createdAt)}</p>
            </div>
          </div>

        </div>
      </div>

      {/* 3. ROLE-SPECIFIC HISTORY SECTION */}
      
      {user.role === "HOME_USER" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Scrap Request History</h3>
          
          {(() => {
            const requests = user.requests || [];
            const total = requests.length;
            const completed = requests.filter(r => r.status === "COMPLETED").length;
            const active = total - completed - requests.filter(r => r.status === "REJECTED").length;

            return (
              <>
                <div className="flex gap-3 mb-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">Total: {total}</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">Completed: {completed}</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">Active: {active}</span>
                </div>

                {total === 0 ? (
                  <div className="text-center py-8">
                    <ClipboardList size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-400">No requests submitted yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left rounded-tl-lg">Request ID</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Status</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Materials</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Price Quoted</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left rounded-tr-lg">Submitted</th>
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
                            <tr key={r.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors last:border-0">
                              <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.id.slice(0, 8)}…</td>
                              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{materialsStr}</td>
                              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{r.adminPrice ? formatCurrency(r.adminPrice) : "—"}</td>
                              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDate(r.createdAt)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {user.role === "COLLECTOR" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Assigned Pickups</h3>
          
          {(() => {
            const pickups = user.assignedPickups || [];
            const totalCount = pickups.length;
            const completedCount = pickups.filter(p => p.status === "COMPLETED").length;
            const rate = totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(0) : 0;

            return (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-sm mb-4">
                  Completion Rate: {rate}% ({completedCount}/{totalCount} completed)
                </div>

                {totalCount === 0 ? (
                  <div className="text-center py-8">
                    <Truck size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-400">No pickups assigned yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left rounded-tl-lg">Pickup ID</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Status</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Address</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Scheduled</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left rounded-tr-lg">Assigned On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pickups.map(p => (
                          <tr key={p.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors last:border-0">
                            <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.id.slice(0, 8)}…</td>
                            <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                              {p.pickupAddress?.length > 35 ? p.pickupAddress.substring(0, 35) + "…" : p.pickupAddress || "—"}
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{p.scheduledDate ? formatDate(p.scheduledDate) : "—"}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDate(p.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {user.role === "BUYER" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order History</h3>
          
          {(() => {
            const orders = user.orders || [];
            const totalSpent = orders.filter(o => o.status === "DELIVERED").reduce((sum, o) => sum + Number(o.totalPrice), 0);

            return (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 rounded-lg text-sm mb-4">
                  Total Spent: {formatCurrency(totalSpent)} (delivered orders only)
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-400">No orders placed yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left rounded-tl-lg">Order ID</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Material</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Qty</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Total</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Status</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left rounded-tr-lg">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(o => (
                          <tr key={o.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors last:border-0">
                            <td className="px-4 py-3 font-mono text-xs text-gray-500">{o.id.slice(0, 8)}…</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{o.inventory?.materialType || "—"}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatWeight(o.quantityKg)}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatCurrency(o.totalPrice)}</td>
                            <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDate(o.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* 4. FEEDBACK CARD */}
      {user.role === "HOME_USER" && user.feedback && user.feedback.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Feedback Given</h3>
          <div>
            {user.feedback.map(f => (
              <div key={f.id} className="flex items-start gap-3 border-b border-gray-100 dark:border-gray-700 pb-3 mb-3 last:border-0 last:mb-0 last:pb-0">
                <div className="flex-shrink-0 pt-0.5">
                  <StarRating value={f.rating} readOnly={true} />
                </div>
                <div>
                  {f.comment ? (
                    <p className="text-sm text-gray-700 dark:text-gray-300">{f.comment}</p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No comment</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{formatDate(f.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. DANGER ZONE CARD */}
      <div className="border border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={18} className="text-red-500" />
          <h3 className="font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Permanently delete this user account. This action cannot be undone. Users with active requests or orders cannot be deleted.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={deleting}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {deleting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Trash2 size={16} />
          )}
          Delete User
        </button>
      </div>

      {/* 6. DELETE CONFIRM MODAL */}
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
