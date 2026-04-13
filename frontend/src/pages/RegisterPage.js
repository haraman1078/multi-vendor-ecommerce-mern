import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

const ROLES = [
  { value: "customer", label: "Customer", desc: "Browse and buy products", icon: "🛍️" },
  { value: "vendor",   label: "Vendor",   desc: "Sell your products",      icon: "🏪" },
];

const RegisterPage = () => {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]       = useState("customer");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Register
      await API.post("/users/register", { name, email, password, role });

      // Auto-login after register
      const { data } = await API.post("/users/login", { email, password });

      // ✅ Flatten and store — same as LoginPage
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
      else navigate("/");

    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
          <p className="text-sm text-gray-500 mt-1">Create your account</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600
                            text-sm px-4 py-2.5 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={submitHandler} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" placeholder="John Doe" value={name}
                onChange={(e) => setName(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                           text-gray-800 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-yellow-400
                           focus:border-transparent transition" />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                           text-gray-800 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-yellow-400
                           focus:border-transparent transition" />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" placeholder="Min 6 characters" value={password}
                onChange={(e) => setPassword(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                           text-gray-800 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-yellow-400
                           focus:border-transparent transition" />
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      role === r.value
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="text-xl mb-1">{r.icon}</div>
                    <div className="text-sm font-medium text-gray-800">{r.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60
                         text-gray-900 font-medium text-sm py-2.5 rounded-lg
                         transition-colors mt-2">
              {loading ? "Creating account..." : `Create ${role === "vendor" ? "Vendor" : "Customer"} Account`}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-yellow-600 hover:text-yellow-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;