import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await API.post("/users/login", { email, password });

      // ✅ FIX: flatten the response so user.role is directly accessible
      // Backend returns: { message, token, user: { id, name, email, role } }
      // We store: { id, name, email, role, token }
      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          id:    data.user.id,
          name:  data.user.name,
          email: data.user.email,
          role:  data.user.role,
          token: data.token,
        })
      );

      // Redirect based on role
      if (data.user.role === "vendor") navigate("/vendor-dashboard");
      else if (data.user.role === "admin") navigate("/admin");
      else navigate("/");

    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-gray-900">
            Shop<span className="text-yellow-400">Zone</span>
          </Link>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600
                            text-sm px-4 py-2.5 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={submitHandler} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                           text-gray-800 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-yellow-400
                           focus:border-transparent transition" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                           text-gray-800 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-yellow-400
                           focus:border-transparent transition" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60
                         text-gray-900 font-medium text-sm py-2.5 rounded-lg transition-colors mt-2">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Role hint for development */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs font-medium text-blue-700 mb-2">Test Accounts</p>
          <div className="space-y-1 text-xs text-blue-600">
            <p>🛍️ <strong>Customer</strong> — register with default role</p>
            <p>🏪 <strong>Vendor</strong> — register and set role to "vendor"</p>
            <p>🔧 <strong>Admin</strong> — set role to "admin" in DB directly</p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          New to ShopZone?{" "}
          <Link to="/register" className="text-yellow-600 hover:text-yellow-700 font-medium">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;