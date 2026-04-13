import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast"; // ✅ replaces alert()
import { getCart, removeFromCart, updateQty } from "../utils/cart";
import API from "../api/axios";

const CartPage = () => {
  const [cart, setCart]     = useState([]);
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { setCart(getCart()); }, []);

  const removeHandler = (id) => {
    removeFromCart(id);
    setCart(getCart());
    toast.success("Item removed from cart"); // ✅ was: alert()
  };

  const qtyHandler = (id, qty) => {
    if (qty < 1) return;
    updateQty(id, Number(qty));
    setCart(getCart());
  };

  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const placeOrderHandler = async () => {
    setPlacing(true);
    /*
      WHY toast.promise()?
      It automatically shows 3 states:
      - "Loading..." while the API call runs
      - "Order placed!" on success
      - "Failed" on error
      One line instead of try/catch/alert everywhere
    */
    try {
      const orderItems = cart.map((item) => ({
        product: item._id,
        qty: item.qty,
      }));

      await toast.promise(
        API.post("/orders", { orderItems, totalPrice }),
        {
          loading: "Placing your order...",
          success: "Order placed successfully! 🎉",
          error:   "Failed to place order. Try again.",
        }
      );

      localStorage.removeItem("cart");
      setCart([]);
      navigate("/orders");
    } catch (err) {
      console.error(err);
    } finally {
      setPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="text-gray-300 text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-sm text-gray-500 mb-6">Add some products to get started</p>
        <Link to="/"
          className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900
                     text-sm font-medium px-6 py-2.5 rounded-lg transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Shopping Cart
        <span className="text-sm font-normal text-gray-500 ml-2">
          ({cart.length} {cart.length === 1 ? "item" : "items"})
        </span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Cart Items */}
        <div className="flex-1 space-y-3">
          {cart.map((item) => {
            const imageUrl = item.images?.length > 0
              ? `http://localhost:5000/${item.images[0]}`
              : "https://placehold.co/80x80?text=?";

            return (
              <div key={item._id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 items-start">
                <Link to={`/products/${item._id}`}>
                  <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden shrink-0
                                  flex items-center justify-center">
                    <img src={imageUrl} alt={item.name}
                      className="max-h-full max-w-full object-contain p-1" />
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item._id}`}>
                    <h3 className="text-sm font-medium text-gray-800 hover:text-yellow-600
                                   transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-base font-semibold text-gray-900 mt-1">₹{item.price}</p>
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button onClick={() => qtyHandler(item._id, item.qty - 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600
                                 hover:bg-gray-100 transition-colors text-lg leading-none">−</button>
                    <span className="w-8 text-center text-sm font-medium text-gray-800">
                      {item.qty}
                    </span>
                    <button onClick={() => qtyHandler(item._id, item.qty + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600
                                 hover:bg-gray-100 transition-colors text-lg leading-none">+</button>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    ₹{(item.price * item.qty).toFixed(2)}
                  </p>
                  <button onClick={() => removeHandler(item._id)}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:w-72 shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-20">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm text-gray-600 border-b border-gray-100 pb-4">
              {cart.map((item) => (
                <div key={item._id} className="flex justify-between">
                  <span className="truncate max-w-[160px]">{item.name} × {item.qty}</span>
                  <span className="font-medium text-gray-800 shrink-0 ml-2">
                    ₹{(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-4 mb-5">
              <span className="font-semibold text-gray-800">Total</span>
              <span className="text-xl font-bold text-gray-900">₹{totalPrice.toFixed(2)}</span>
            </div>
            <button onClick={placeOrderHandler} disabled={placing}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60
                         text-gray-900 font-medium text-sm py-2.5 rounded-lg transition-colors">
              {placing ? "Placing Order..." : "Place Order"}
            </button>
            <Link to="/"
              className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-3">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;