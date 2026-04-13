import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

/*
  WHY Recharts?
  - Built for React — uses JSX components, not canvas/DOM manipulation
  - Responsive out of the box via ResponsiveContainer
  - No extra config needed — works with your existing data
  - Free and open source

  CHARTS WE'RE ADDING:
  1. Revenue Over Time    — AreaChart (shows growth trend)
  2. Orders by Status     — PieChart  (shows order health)
  3. Top Products         — BarChart  (replaces plain list)
  4. Daily Orders         — BarChart  (activity heatmap)
*/

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  pending:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  shipped:   "bg-purple-50 text-purple-700 border-purple-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

const PIE_COLORS = {
  pending:   "#eab308",
  confirmed: "#3b82f6",
  shipped:   "#a855f7",
  delivered: "#22c55e",
  cancelled: "#ef4444",
};

// ── Sub-components ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize
                    ${STATUS_COLORS[status] || STATUS_COLORS.pending}`}>
    {status || "pending"}
  </span>
);

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

// Custom tooltip for revenue chart
const RevenueTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm text-sm">
        <p className="text-gray-500 text-xs mb-1">{label}</p>
        <p className="font-semibold text-gray-900">
          ₹{payload[0].value.toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

// Custom tooltip for orders chart
const OrderTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm text-sm">
        <p className="text-gray-500 text-xs mb-1">{label}</p>
        <p className="font-semibold text-gray-900">{payload[0].value} orders</p>
      </div>
    );
  }
  return null;
};

// ── Data helpers ───────────────────────────────────────────────────────────────

/*
  WHY process data on frontend?
  Your backend returns raw orders. Instead of adding new backend
  endpoints for every chart, we compute chart data from the
  existing recentOrders array. Clean and efficient.
*/

// Builds revenue by month from orders array
const buildRevenueByMonth = (orders) => {
  const map = {};
  orders.forEach((order) => {
    if (!order.createdAt) return;
    const date  = new Date(order.createdAt);
    const key   = date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    map[key]    = (map[key] || 0) + order.orderRevenue;
  });
  return Object.entries(map)
    .map(([month, revenue]) => ({ month, revenue: Math.round(revenue) }))
    .slice(-6); // last 6 months
};

// Builds order count by status
const buildStatusData = (orders) => {
  const map = {};
  orders.forEach((o) => {
    const s = o.status || "pending";
    map[s]  = (map[s] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
};

// Builds orders by day of week
const buildDailyOrders = (orders) => {
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const map  = { Sun:0, Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0 };
  orders.forEach((o) => {
    if (!o.createdAt) return;
    const day = days[new Date(o.createdAt).getDay()];
    map[day]++;
  });
  return days.map((day) => ({ day, orders: map[day] }));
};

// ── Main Component ─────────────────────────────────────────────────────────────
const VendorDashboardPage = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // overview | orders

  useEffect(() => {
    const fetchDashboard = async () => {
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
    fetchDashboard();
  }, []);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-xl" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
        <div className="h-48 bg-gray-200 rounded-xl" />
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

  // Compute chart data
  const revenueData  = buildRevenueByMonth(recentOrders);
  const statusData   = buildStatusData(recentOrders);
  const dailyData    = buildDailyOrders(recentOrders);
  const topChartData = topProducts.map((p) => ({
    name:    p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name,
    revenue: p.revenue,
    units:   p.unitsSold,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Vendor Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Your store performance at a glance</p>
        </div>
        <Link to="/add-product"
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm
                     font-medium px-4 py-2.5 rounded-lg transition-colors">
          + Add Product
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`}
          sub="From your products" color="green" />
        <StatCard label="Total Orders"
          value={stats.totalOrders}
          sub="Containing your items" color="blue" />
        <StatCard label="Products Listed"
          value={stats.totalProducts}
          sub="Active listings" color="yellow" />
        <StatCard label="Units Sold"
          value={stats.totalUnitsSold}
          sub="Across all orders" color="purple" />
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        {["overview", "orders"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? "border-yellow-400 text-yellow-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {tab === "overview" ? "📊 Analytics" : "📦 Recent Orders"}
          </button>
        ))}
      </div>

      {/* ── ANALYTICS TAB ── */}
      {activeTab === "overview" && (
        <div className="space-y-6">

          {/* Row 1: Revenue chart + Status pie */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Revenue Over Time — takes 2/3 width */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-800">Revenue Over Time</h2>
                <p className="text-xs text-gray-400 mt-0.5">Monthly revenue from your products</p>
              </div>

              {revenueData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                  No revenue data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={revenueData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#eab308" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false} tickLine={false}
                      tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                    <Tooltip content={<RevenueTooltip />} />
                    <Area type="monotone" dataKey="revenue"
                      stroke="#eab308" strokeWidth={2}
                      fill="url(#revenueGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Orders by Status — takes 1/3 width */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-800">Orders by Status</h2>
                <p className="text-xs text-gray-400 mt-0.5">Breakdown of order states</p>
              </div>

              {statusData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                  No orders yet
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%"
                        innerRadius={45} outerRadius={70}
                        paddingAngle={3} dataKey="value">
                        {statusData.map((entry, i) => (
                          <Cell key={i}
                            fill={PIE_COLORS[entry.name] || "#94a3b8"} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [
                          `${value} orders`,
                          name.charAt(0).toUpperCase() + name.slice(1),
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legend */}
                  <div className="space-y-1.5 mt-2">
                    {statusData.map((entry, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full"
                            style={{ background: PIE_COLORS[entry.name] || "#94a3b8" }} />
                          <span className="text-gray-600 capitalize">{entry.name}</span>
                        </div>
                        <span className="font-medium text-gray-800">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Row 2: Top Products bar + Daily activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Top Products Bar Chart */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-800">Top Products by Revenue</h2>
                <p className="text-xs text-gray-400 mt-0.5">Your best performing products</p>
              </div>

              {topChartData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                  No sales data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={topChartData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false} tickLine={false}
                      tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                    <Tooltip
                      formatter={(value) => [
                        `₹${value.toLocaleString("en-IN")}`, "Revenue"
                      ]}
                    />
                    <Bar dataKey="revenue" fill="#eab308" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Daily Orders Activity */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-800">Orders by Day of Week</h2>
                <p className="text-xs text-gray-400 mt-0.5">When your customers order most</p>
              </div>

              {recentOrders.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                  No order activity yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dailyData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false} tickLine={false}
                      allowDecimals={false} />
                    <Tooltip content={<OrderTooltip />} />
                    <Bar dataKey="orders" radius={[6, 6, 0, 0]}
                      fill="#131921">
                      {dailyData.map((entry, i) => (
                        <Cell key={i}
                          fill={entry.orders === Math.max(...dailyData.map(d => d.orders))
                            ? "#eab308"
                            : "#e5e7eb"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
              <p className="text-xs text-gray-400 mt-2 text-center">
                Yellow bar = busiest day
              </p>
            </div>
          </div>

          {/* Row 3: Top Products ranked list */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-800">Top Products Ranking</h2>
              </div>
              {topProducts.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">No sales yet</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {topProducts.map((product, i) => (
                    <div key={i} className="px-5 py-3 flex items-center gap-3">
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
                        <p className="text-xs text-gray-400">{product.unitsSold} units sold</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 shrink-0">
                        ₹{product.revenue.toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { to: "/my-products",  icon: "📦", label: "My Products" },
                  { to: "/add-product",  icon: "➕", label: "Add Product" },
                  { to: "/orders",       icon: "📋", label: "My Orders" },
                ].map((link) => (
                  <Link key={link.to} to={link.to}
                    className="flex flex-col items-center gap-2 p-4 border border-gray-200
                               rounded-xl hover:border-yellow-400 hover:bg-yellow-50
                               transition-colors text-center">
                    <span className="text-2xl">{link.icon}</span>
                    <span className="text-xs font-medium text-gray-700">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ORDERS TAB ── */}
      {activeTab === "orders" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">Recent Orders</h2>
            <span className="text-xs text-gray-400">{recentOrders.length} orders</span>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">No orders yet</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <div key={order._id} className="px-5 py-4 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-gray-400">
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.user?.name || "Customer"}
                      <span className="text-gray-400 text-xs ml-1">{order.user?.email}</span>
                    </p>
                    <div className="mt-1 space-y-0.5">
                      {order.vendorItems.map((item, i) => (
                        <p key={i} className="text-xs text-gray-500">
                          {item.product?.name} × {item.qty}
                        </p>
                      ))}
                    </div>
                  </div>
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
      )}
    </div>
  );
};

export default VendorDashboardPage;