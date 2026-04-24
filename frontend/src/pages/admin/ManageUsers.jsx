import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Eye, Trash2, CheckCircle, XCircle, Home, Truck, ShoppingBag, X, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllUsers, deleteUser, createUser } from '../../api/admin.api';
import { formatDate } from '../../utils/formatters';
import ConfirmModal from '../../components/common/ConfirmModal';

const ManageUsers = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [sortConfig, setSortConfig] = useState({ sortBy: "createdAt", order: "desc" });
    const [userToDelete, setUserToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createForm, setCreateForm] = useState({ name: "", email: "", password: "", phone: "", role: "" });

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await getAllUsers({ role: roleFilter, sortBy: sortConfig.sortBy, order: sortConfig.order });
                setUsers(response.data.users);
            } catch (err) {
                toast.error('Failed to fetch users');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [roleFilter, sortConfig]);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const total = users.length;
    const homeUsers = users.filter(u => u.role === "HOME_USER").length;
    const collectors = users.filter(u => u.role === "COLLECTOR").length;
    const buyers = users.filter(u => u.role === "BUYER").length;

    const handleDelete = async () => {
        if (!userToDelete) return;
        setDeleting(true);
        try {
            await deleteUser(userToDelete.id);
            toast.success("User deleted successfully.");
            setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
            setUserToDelete(null);
        } catch (err) {
            if (err.response?.status === 409) {
                toast.error(err.response.data.message);
            } else {
                toast.error("Failed to delete user.");
            }
        } finally {
            setDeleting(false);
        }
    };

    const handleCreateUser = async () => {
        // Client-side validation
        if (!createForm.name.trim()) return toast.error("Full name is required.");
        if (!createForm.email.trim()) return toast.error("Email address is required.");
        if (!createForm.password || createForm.password.length < 8) return toast.error("Password must be at least 8 characters.");
        if (!createForm.role) return toast.error("Please select a role.");

        setCreating(true);
        try {
            const res = await createUser(createForm);
            const newUser = res.data;
            // Append to users list with a default _count since the new user has no records yet
            newUser._count = { requests: 0, assignedPickups: 0, orders: 0, feedback: 0 };
            setUsers(prev => [newUser, ...prev]);
            setShowCreateModal(false);
            setCreateForm({ name: "", email: "", password: "", phone: "", role: "" });
            toast.success(`User "${newUser.name}" created successfully! They can log in immediately.`);
        } catch (err) {
            if (err.response?.status === 409) {
                toast.error("A user with this email already exists.");
            } else if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error("Failed to create user. Please try again.");
            }
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* PAGE HEADER ROW */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-[#1A7A4A]" />
                        Manage Users
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        View, create, and manage all platform users.
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-[#1A7A4A] hover:bg-[#155f39] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <UserPlus className="w-4 h-4" />
                    Add User
                </button>
            </div>

            {/* STATS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex items-center gap-4">
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
                        <Users className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{total}</div>
                        <div className="text-sm text-gray-500">Total Users</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex items-center gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                        <Home className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{homeUsers}</div>
                        <div className="text-sm text-gray-500">Home Users</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex items-center gap-4">
                    <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                        <Truck className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{collectors}</div>
                        <div className="text-sm text-gray-500">Collectors</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex items-center gap-4">
                    <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full">
                        <ShoppingBag className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{buyers}</div>
                        <div className="text-sm text-gray-500">Buyers</div>
                    </div>
                </div>
            </div>

            {/* FILTER BAR */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-3">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email…"
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]"
                />
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full md:w-44 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]"
                >
                    <option value="">All Roles</option>
                    <option value="HOME_USER">Home User</option>
                    <option value="COLLECTOR">Collector</option>
                    <option value="BUYER">Buyer</option>
                </select>
                <select
                    value={`${sortConfig.sortBy}-${sortConfig.order}`}
                    onChange={(e) => {
                        const [sortBy, order] = e.target.value.split('-');
                        setSortConfig({ sortBy, order });
                    }}
                    className="w-full md:w-44 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]"
                >
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="name-asc">Name A–Z</option>
                </select>
            </div>

            {/* USERS TABLE */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Verified</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Activity</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8">
                                        <div className="flex justify-center items-center py-20">
                                            <div className="animate-spin w-8 h-8 rounded-full border-2 border-[#1A7A4A] border-t-transparent"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="8">
                                        <div className="flex flex-col items-center justify-center py-16">
                                            <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                                            <p className="font-medium text-gray-500">No users found</p>
                                            <p className="text-sm text-gray-400">Try adjusting your search or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{user.name}</td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{user.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                user.role === 'HOME_USER' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                                                user.role === 'COLLECTOR' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' :
                                                user.role === 'BUYER' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                                                'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300'
                                            }`}>
                                                {user.role === 'HOME_USER' ? 'Home User' :
                                                 user.role === 'COLLECTOR' ? 'Collector' :
                                                 user.role === 'BUYER' ? 'Buyer' : user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{user.phone || '—'}</td>
                                        <td className="px-4 py-3">
                                            {user.isVerified ? (
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-400" />
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{formatDate(user.createdAt)}</td>
                                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                                            {user.role === 'HOME_USER' && `${user._count?.requests || 0} request(s)`}
                                            {user.role === 'COLLECTOR' && `${user._count?.assignedPickups || 0} pickup(s)`}
                                            {user.role === 'BUYER' && `${user._count?.orders || 0} order(s)`}
                                            {user.role === 'ADMIN' && `—`}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/users/${user.id}`)}
                                                    className="p-1.5 rounded-lg text-gray-500 hover:text-[#1A7A4A] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                    title="View User"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setUserToDelete(user)}
                                                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmModal
                isOpen={userToDelete !== null}
                onClose={() => setUserToDelete(null)}
                onConfirm={handleDelete}
                title="Delete User"
                message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
                confirmLabel={deleting ? "Deleting..." : "Delete"}
                confirmClassName="bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
            />

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <UserPlus size={20} className="text-[#1A7A4A]" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create New User</h2>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Info Banner */}
                        <div className="mx-6 mt-4 flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                            <Info size={16} className="text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-green-700 dark:text-green-300">
                                This account will be automatically verified. The user can log in immediately — no email confirmation required.
                            </p>
                        </div>

                        {/* Form Body */}
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g. Ramesh Kumar"
                                    required
                                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
                                <input
                                    type="email"
                                    value={createForm.email}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="e.g. ramesh@example.com"
                                    required
                                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password *</label>
                                <input
                                    type="password"
                                    value={createForm.password}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                                    placeholder="Min. 8 characters"
                                    required
                                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]"
                                />
                                <p className="text-xs text-gray-400 mt-1">The user will log in with this password.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    value={createForm.phone}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="e.g. 9876543210 (optional)"
                                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role *</label>
                                <select
                                    value={createForm.role}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value }))}
                                    required
                                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]"
                                >
                                    <option value="" disabled>Select a role…</option>
                                    <option value="HOME_USER">Home User</option>
                                    <option value="COLLECTOR">Collector</option>
                                    <option value="BUYER">Buyer</option>
                                </select>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-3 p-6 pt-0">
                            <button
                                onClick={() => { setShowCreateModal(false); setCreateForm({ name: "", email: "", password: "", phone: "", role: "" }); }}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateUser}
                                disabled={creating}
                                className="flex-1 px-4 py-2 bg-[#1A7A4A] hover:bg-[#155f39] text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {creating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <UserPlus size={16} />}
                                {creating ? "Creating…" : "Create User"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
