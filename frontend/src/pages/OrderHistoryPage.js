import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
 
// ── Status badge config ─────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    dot: "bg-yellow-400",
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  confirmed: {
    label: "Confirmed",
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  shipped: {
    label: "Shipped",
    dot: "bg-purple-500",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
  },
  delivered: {
    label: "Delivered",
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-700 border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-red-400",
    badge: "bg-red-50 text-red-600 border-red-200",
  },
};
 
const StatusBadge = ({ status }) => {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium
                      border px-2.5 py-1 rounded-full ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};
 
// ── Order progress stepper ──────────────────────────────────────────────────
const ORDER_STEPS = ["pending", "confirmed", "shipped", "delivered"];
 
const OrderStepper = ({ status }) => {
  if (status === "cancelled") return null;
  const currentIndex = ORDER_STEPS.indexOf(status);
 
  return (
    <div className="flex items-center gap-0 mt-3">
      {ORDER_STEPS.map((step, i) => {
        const done    = i <= currentIndex;
        const active  = i === currentIndex;
        const isLast  = i === ORDER_STEPS.length - 1;
 
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                              transition-colors ${
                                done
                                  ? "bg-yellow-400 border-yellow-400"
                                  : "bg-white border-gray-300"
                              }`}>
                {done && (
                  <svg className="w-2.5 h-2.5 text-gray-900" fill="none" stroke="currentColor"
                    strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                  </svg>
                )}
              </div>
              <span className={`text-[10px] mt-1 capitalize ${
                active ? "text-yellow-600 font-medium" : done ? "text-gray-600" : "text-gray-400"
              }`}>
                {step}
              </span>
            </div>
 
            {/* Connector line */}
            {!isLast && (
              <div className={`flex-1 h-0.5 mb-4 mx-1 ${
                i < currentIndex ? "bg-yellow-400" : "bg-gray-200"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};
 
// ── Main Component ──────────────────────────────────────────────────────────
const OrderHistoryPage = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");
 
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get("/orders/my-orders");
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);
 
  const FILTER_OPTIONS = [
    { label: "All Orders", value: "all" },
    { label: "Pending",    value: "pending" },
    { label: "Confirmed",  value: "confirmed" },
    { label: "Shipped",    value: "shipped" },
    { label: "Delivered",  value: "delivered" },
    { label: "Cancelled",  value: "cancelled" },
  ];
 
  const filtered = filter === "all"
    ? orders
    : orders.filter((o) => (o.status || "pending") === filter);
 
  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5
                                  animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
            <div className="h-12 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }
 
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
 
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">My Orders</h1>
        <p className="text-sm text-gray-500 mt-1">
          {orders.length} {orders.length === 1 ? "order" : "orders"} placed
        </p>
      </div>
 
      {/* Filter tabs */}
      {orders.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                filter === opt.value
                  ? "bg-yellow-400 border-yellow-400 text-gray-900"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {opt.label}
              {opt.value !== "all" && (
                <span className="ml-1 text-[10px] opacity-70">
                  ({orders.filter((o) => (o.status || "pending") === opt.value).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}
 
      {/* Empty State */}
      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-xl">
          <div className="text-5xl text-gray-200 mb-4">📦</div>
          <h2 className="text-lg font-medium text-gray-600 mb-2">No orders yet</h2>
          <p className="text-sm text-gray-400 mb-6">Your placed orders will show up here</p>
          <Link
            to="/"
            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900
                       text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
          <p className="text-gray-500 text-sm">No {filter} orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order, index) => (
            <div
              key={order._id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden"
            >
              {/* Order Header */}
              <div className="bg-gray-50 border-b border-gray-200 px-5 py-3
                              flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500 font-medium">
                    Order #{orders.length - index}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-400 font-mono text-xs">
                    {order._id.slice(-8).toUpperCase()}
                  </span>
                  {order.createdAt && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-400 text-xs">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </span>
                    </>
                  )}
                </div>
                <StatusBadge status={order.status || "pending"} />
              </div>
 
              {/* Order Items */}
              <div className="divide-y divide-gray-100 px-5">
                {order.orderItems.map((item, i) => (
                  <div key={i} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
                      <p className="text-sm text-gray-700">
                        {item.product?.name || (
                          <span className="font-mono text-xs text-gray-400">
                            {typeof item.product === "string"
                              ? item.product
                              : item.product?._id}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500 shrink-0">
                      Qty: <span className="font-medium text-gray-700">{item.qty}</span>
                    </span>
                  </div>
                ))}
              </div>
 
              {/* Progress Stepper */}
              <div className="px-5 pb-2">
                <OrderStepper status={order.status || "pending"} />
              </div>
 
              {/* Order Footer */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100
                              flex items-center justify-between">
                <span className="text-sm text-gray-500">Total</span>
                <span className="text-base font-bold text-gray-900">₹{order.totalPrice}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
 
export default OrderHistoryPage;