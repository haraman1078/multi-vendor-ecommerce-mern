import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

// ── Status badge ──────────────────────────────────────────────────────────────
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

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color = "yellow" }) => {
  const colors = {
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
    green:  "bg-green-50  border-green-200  text-green-700",
    blue:   "bg-blue-50   border-blue-200   text-blue-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
  };
  return (
    <div className={`border rounded-xl p-5 ${colors[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70 mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
      {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const VendorDashboardPage = () => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: res } = await API.get("/orders/vendor-dashboard");
        setData(res);
      } catch (err) {
        setError("Failed to load dashboard");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  const { stats, recentOrders, topProducts } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Vendor Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Your store performance at a glance</p>
        </div>
        <Link
          to="/add-product"
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm
                     font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`}
          sub="From your products"
          color="green"
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders}
          sub="Containing your items"
          color="blue"
        />
        <StatCard
          label="Products Listed"
          value={stats.totalProducts}
          sub="Active listings"
          color="yellow"
        />
        <StatCard
          label="Units Sold"
          value={stats.totalUnitsSold}
          sub="Across all orders"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Recent Orders</h2>
              <span className="text-xs text-gray-400">{recentOrders.length} orders</span>
            </div>

            {recentOrders.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                No orders yet
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <div key={order._id} className="px-5 py-3 flex items-start gap-4">
                    {/* Order info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-gray-400">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      {/* Customer */}
                      <p className="text-sm text-gray-600 mt-1">
                        {order.user?.name || "Customer"}
                        <span className="text-gray-400 text-xs ml-1">
                          {order.user?.email}
                        </span>
                      </p>
                      {/* Items */}
                      <div className="mt-1 space-y-0.5">
                        {order.vendorItems.map((item, i) => (
                          <p key={i} className="text-xs text-gray-500">
                            {item.product?.name} × {item.qty}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Revenue + date */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-gray-900">
                        ₹{order.orderRevenue.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short",
                            })
                          : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">Top Products</h2>
            </div>

            {topProducts.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                No sales yet
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {topProducts.map((product, i) => (
                  <div key={i} className="px-5 py-3 flex items-center gap-3">
                    {/* Rank */}
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center
                                      text-xs font-bold shrink-0 ${
                                        i === 0 ? "bg-yellow-400 text-gray-900"
                                        : i === 1 ? "bg-gray-200 text-gray-700"
                                        : "bg-gray-100 text-gray-500"
                                      }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {product.unitsSold} units sold
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 shrink-0">
                      ₹{product.revenue.toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Links</h3>
            <Link to="/my-products"
              className="flex items-center gap-2 text-sm text-gray-600
                         hover:text-yellow-600 transition-colors">
              <span>📦</span> My Products
            </Link>
            <Link to="/add-product"
              className="flex items-center gap-2 text-sm text-gray-600
                         hover:text-yellow-600 transition-colors">
              <span>➕</span> Add New Product
            </Link>
            <Link to="/orders"
              className="flex items-center gap-2 text-sm text-gray-600
                         hover:text-yellow-600 transition-colors">
              <span>📋</span> My Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardPage;