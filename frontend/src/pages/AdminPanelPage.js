import { useEffect, useState } from "react";
import API from "../api/axios";

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const STATUS_COLORS = {
  pending:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  shipped:   "bg-purple-50 text-purple-700 border-purple-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

const StatusBadge = ({ status }) => (
  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize
                    ${STATUS_COLORS[status] || STATUS_COLORS.pending}`}>
    {status || "pending"}
  </span>
);

const StatCard = ({ label, value, color = "gray" }) => {
  const colors = {
    gray:   "bg-gray-50   border-gray-200   text-gray-700",
    green:  "bg-green-50  border-green-200  text-green-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
    blue:   "bg-blue-50   border-blue-200   text-blue-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    red:    "bg-red-50    border-red-200    text-red-600",
  };
  return (
    <div className={`border rounded-xl p-4 ${colors[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-60 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const AdminPanelPage = () => {
  const [orders, setOrders]         = useState([]);
  const [users, setUsers]           = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [statusCounts, setStatusCounts] = useState({});
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState("orders");
  const [updatingId, setUpdatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, usersRes] = await Promise.all([
          API.get("/orders/all-orders"),
          API.get("/users/all-users"),
        ]);
        setOrders(ordersRes.data.orders);
        setTotalRevenue(ordersRes.data.totalRevenue);
        setStatusCounts(ordersRes.data.statusCounts);
        setUsers(usersRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      // Update status counts
      setStatusCounts((prev) => {
        const order = orders.find((o) => o._id === orderId);
        const oldStatus = order?.status || "pending";
        return {
          ...prev,
          [oldStatus]: (prev[oldStatus] || 1) - 1,
          [newStatus]: (prev[newStatus] || 0) + 1,
        };
      });
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = filterStatus === "all"
    ? orders
    : orders.filter((o) => (o.status || "pending") === filterStatus);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}
        </div>
        <div className="h-96 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Admin Panel</h1>
        <p className="text-sm text-gray-500 mt-1">Manage orders and users across the platform</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8">
        <StatCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} color="green" />
        <StatCard label="Pending"   value={statusCounts.pending   || 0} color="yellow" />
        <StatCard label="Confirmed" value={statusCounts.confirmed || 0} color="blue"   />
        <StatCard label="Shipped"   value={statusCounts.shipped   || 0} color="purple" />
        <StatCard label="Delivered" value={statusCounts.delivered || 0} color="gray"   />
        <StatCard label="Cancelled" value={statusCounts.cancelled || 0} color="red"    />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {["orders", "users"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? "border-yellow-400 text-yellow-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
            <span className="ml-1.5 text-xs opacity-60">
              ({tab === "orders" ? orders.length : users.length})
            </span>
          </button>
        ))}
      </div>

      {/* ── Orders Tab ───────────────────────────────────────────────────── */}
      {activeTab === "orders" && (
        <div>
          {/* Filter chips */}
          <div className="flex gap-2 flex-wrap mb-4">
            {["all", ...STATUS_OPTIONS].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors capitalize ${
                  filterStatus === s
                    ? "bg-yellow-400 border-yellow-400 text-gray-900"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {s === "all" ? "All Orders" : s}
              </button>
            ))}
          </div>

          {/* Orders table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {filteredOrders.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">No orders found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-left">
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Order</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Customer</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Items</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Total</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-gray-400">
                          #{order._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">{order.user?.name || "—"}</p>
                          <p className="text-xs text-gray-400">{order.user?.email}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-[180px]">
                          {order.orderItems.map((item, i) => (
                            <p key={i} className="text-xs truncate">
                              {item.product?.name || "Product"} × {item.qty}
                            </p>
                          ))}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          ₹{order.totalPrice}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status || "pending"} />
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric", month: "short", year: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={order.status || "pending"}
                            disabled={updatingId === order._id}
                            onChange={(e) => updateStatus(order._id, e.target.value)}
                            className="text-xs border border-gray-300 rounded-lg px-2 py-1.5
                                       focus:outline-none focus:ring-2 focus:ring-yellow-400
                                       disabled:opacity-50 bg-white"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s} className="capitalize">{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Users Tab ────────────────────────────────────────────────────── */}
      {activeTab === "users" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {users.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left">
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">User</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Role</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center
                                          justify-center text-yellow-700 text-xs font-semibold shrink-0">
                            {user.name?.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${
                          user.role === "admin"
                            ? "bg-red-50 text-red-600 border-red-200"
                            : user.role === "vendor"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanelPage;