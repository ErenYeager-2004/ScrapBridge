import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  Eye,
  CheckCircle,
  XCircle,
  Home,
  Truck,
  ShoppingBag,
  X,
  Info,
  Search,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { getAllUsers, createUser } from "../../api/admin.api";
import { formatDate } from "../../utils/formatters";
import Pagination from "../../components/common/Pagination";

const ManageUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({
    sortBy: "createdAt",
    order: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await getAllUsers({
          role: roleFilter,
          sortBy: sortConfig.sortBy,
          order: sortConfig.order,
        });
        setUsers(response.data.users);
      } catch (err) {
        toast.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [roleFilter, sortConfig]);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const total = users.length;
  const homeUsers = users.filter((u) => u.role === "HOME_USER").length;
  const collectors = users.filter((u) => u.role === "COLLECTOR").length;
  const buyers = users.filter((u) => u.role === "BUYER").length;

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "?");

  const getRoleStyles = (role) => {
    switch (role) {
      case "HOME_USER":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
      case "COLLECTOR":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300";
      case "BUYER":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "HOME_USER":
        return "Home User";
      case "COLLECTOR":
        return "Collector";
      case "BUYER":
        return "Buyer";
      default:
        return role;
    }
  };

  const handleCreateUser = async () => {
    // Client-side validation
    if (!createForm.name.trim()) return toast.error("Full name is required.");
    if (!createForm.email.trim())
      return toast.error("Email address is required.");
    if (!createForm.password || createForm.password.length < 8)
      return toast.error("Password must be at least 8 characters.");
    if (!createForm.role) return toast.error("Please select a role.");

    setCreating(true);
    try {
      const res = await createUser(createForm);
      const newUser = res.data;
      // Append to users list with a default _count since the new user has no records yet
      newUser._count = {
        requests: 0,
        assignedPickups: 0,
        orders: 0,
        feedback: 0,
      };
      setUsers((prev) => [newUser, ...prev]);
      setShowCreateModal(false);
      setCreateForm({ name: "", email: "", password: "", phone: "", role: "" });
      toast.success(
        `User "${newUser.name}" created successfully! They can log in immediately.`,
      );
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

  return ( <><div className="p-6 lg:p-8 max-w-full space-y-6">
      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm p-6 flex flex-col justify-between relative overflow-hidden h-32">
          <div className="flex justify-between items-start mb-2">
            <div className="text-gray-600 dark:text-gray-400 font-medium text-sm">
              Total Users
            </div>
            <Users className="w-12 h-12 text-gray-100 dark:text-gray-700/50 absolute right-4 top-4" />
          </div>
          <div className="flex items-baseline gap-3 relative z-10">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {total}
            </div>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
              +12%
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm p-6 flex flex-col justify-between h-32">
          <div className="text-gray-600 dark:text-gray-400 font-medium text-sm mb-2">
            Home Users
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white">
            {homeUsers}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm p-6 flex flex-col justify-between h-32">
          <div className="text-gray-600 dark:text-gray-400 font-medium text-sm mb-2">
            Collectors
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white">
            {collectors}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm p-6 flex flex-col justify-between h-32">
          <div className="text-gray-600 dark:text-gray-400 font-medium text-sm mb-2">
            Buyers
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white">
            {buyers}
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center mb-6">
        <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name or email"
              className="pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-none rounded-full text-sm w-full focus:ring-2 focus:ring-[#1A7A4A] dark:text-white placeholder-gray-500 font-medium outline-none"
            />
          </div>

          <div className="relative w-full md:w-36">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none pl-4 pr-10 py-2.5 bg-gray-100 dark:bg-gray-800 border-none rounded-full text-sm w-full focus:ring-2 focus:ring-[#1A7A4A] dark:text-white font-medium text-gray-700 outline-none"
            >
              <option value="">All Roles</option>
              <option value="HOME_USER">Home User</option>
              <option value="COLLECTOR">Collector</option>
              <option value="BUYER">Buyer</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          <div className="relative w-full md:w-40">
            <select
              value={`${sortConfig.sortBy}-${sortConfig.order}`}
              onChange={(e) => {
                const [sortBy, order] = e.target.value.split("-");
                setSortConfig({ sortBy, order });
                setCurrentPage(1);
              }}
              className="appearance-none pl-4 pr-10 py-2.5 bg-gray-100 dark:bg-gray-800 border-none rounded-full text-sm w-full focus:ring-2 focus:ring-[#1A7A4A] dark:text-white font-medium text-gray-700 outline-none"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name A–Z</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#1A7A4A] hover:bg-[#155f39] text-white px-6 py-2.5 rounded-full flex items-center gap-2 transition-colors text-sm font-semibold w-full lg:w-auto justify-center shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-transparent border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Verified
                </th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Activity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {loading ? (
                <tr>
                  <td colSpan="7">
                    <div className="flex justify-center items-center py-20">
                      <div className="animate-spin w-8 h-8 rounded-full border-2 border-[#1A7A4A] border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : currentUsers.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="flex flex-col items-center justify-center py-16">
                      <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="font-medium text-gray-500">
                        No users found
                      </p>
                      <p className="text-sm text-gray-400">
                        Try adjusting your search or filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => {
                  const activityCount =
                    user.role === "HOME_USER"
                      ? user._count?.requests || 0
                      : user.role === "COLLECTOR"
                        ? user._count?.assignedPickups || 0
                        : user.role === "BUYER"
                          ? user._count?.orders || 0
                          : 0;
                  const isActive = activityCount > 0;

                  return (
                    <tr
                      key={user.id}
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                                                        ${
                                                          user.role ===
                                                          "HOME_USER"
                                                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                                                            : user.role ===
                                                                "COLLECTOR"
                                                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                                                              : user.role ===
                                                                  "BUYER"
                                                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                                                                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                                        }`}
                          >
                            {getInitials(user.name)}
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleStyles(user.role)}`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-medium">
                        {user.phone || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {user.isVerified ? (
                          <CheckCircle className="w-5 h-5 text-[#1A7A4A] dark:text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${isActive ? "bg-[#1A7A4A] dark:bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
                          ></div>
                          <span className="text-gray-600 dark:text-gray-400">
                            {user.role === "HOME_USER" &&
                              `${activityCount} request(s)`}
                            {user.role === "COLLECTOR" &&
                              `${activityCount} pickup(s)`}
                            {user.role === "BUYER" &&
                              `${activityCount} order(s)`}
                            {user.role === "ADMIN" && `—`}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {!loading && totalItems > 0 && (
          <div className="px-6 pb-6 bg-white dark:bg-gray-800">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={users.length}
              itemsPerPage={itemsPerPage}
              filteredCount={totalItems}
            />
          </div>
        )}
      </div>

      
    </div>
    {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl w-full max-w-[500px] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 pb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                Create New User
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form Body */}
            <div className="px-8 space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Julian Arch"
                  required
                  className="w-full bg-gray-100/80 dark:bg-gray-700/50 border-none rounded-full px-5 py-3.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A7A4A] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="julian@atelier.com"
                    required
                    className="w-full bg-gray-100/80 dark:bg-gray-700/50 border-none rounded-full px-5 py-3.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A7A4A] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Phone Number <span className="normal-case font-medium text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={createForm.phone}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-gray-100/80 dark:bg-gray-700/50 border-none rounded-full px-5 py-3.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A7A4A] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="............"
                  required
                  className="w-full bg-gray-100/80 dark:bg-gray-700/50 border-none rounded-full px-5 py-3.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A7A4A] font-medium"
                />
                <p className="text-[10px] italic text-gray-500 mt-2 font-medium">
                  Must include 12+ characters, 1 uppercase, and 1 symbol.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Role Registry Selection
                </label>
                <div className="relative">
                  <select
                    value={createForm.role}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, role: e.target.value }))
                    }
                    required
                    className="appearance-none w-full bg-gray-100/80 dark:bg-gray-700/50 border-none rounded-full px-5 py-3.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A7A4A] pr-10 font-medium cursor-pointer"
                  >
                    <option value="" disabled>
                      Select a role…
                    </option>
                    <option value="HOME_USER">Home User</option>
                    <option value="COLLECTOR">Collector</option>
                    <option value="BUYER">Buyer</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-8 flex justify-center items-center gap-8">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateForm({
                    name: "",
                    email: "",
                    password: "",
                    phone: "",
                    role: "",
                  });
                }}
                className="text-sm font-bold text-gray-900 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={creating}
                className="px-8 py-3 bg-[#006D44] hover:bg-[#005c39] text-white rounded-full transition-colors text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 shadow-md"
              >
                {creating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                {creating ? "Creating…" : "Create User"}
              </button>
            </div>

            {/* Bottom ID Bar */}
            <div className="bg-gray-50 dark:bg-gray-800/80 py-3.5 text-center border-t border-gray-100 dark:border-gray-700">
              <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                AUTHORIZED OPERATION ID: ECO-USR-9901
              </span>
            </div>
          </div>
        </div>
      )}
    </>
    
  );
};

export default ManageUsers;
