import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getCart } from "../utils/cart";
import toast from "react-hot-toast";

/*
  WHY mobile menu?
  On small screens, all nav links squish together and overflow.
  The solution: hide links on mobile, show a hamburger button (☰)
  that toggles a dropdown menu. This is how every real app works.

  HOW it works:
  - `menuOpen` state controls whether mobile menu is visible
  - Tailwind `md:flex` = only show on medium+ screens (desktop)
  - Tailwind `md:hidden` = only show on small screens (mobile)
  - Clicking any link closes the menu automatically
*/

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("userInfo"));
  const cartCount = getCart().reduce((sum, item) => sum + item.qty, 0);

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    toast.success("Logged out successfully");
    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);

  // Active link helper — highlights current page link
  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `text-sm px-3 py-1.5 rounded-lg transition-colors ${
      isActive(path)
        ? "bg-white/20 text-white font-medium"
        : "text-gray-300 hover:text-white hover:bg-white/10"
    }`;

  // Links config — easier to manage and render consistently
  // for both desktop and mobile menus
  const navLinks = [
    { to: "/",       label: "Home",      show: true },
    { to: "/orders", label: "Orders",    show: !!user },
    { to: "/vendor-dashboard", label: "Dashboard",   show: user?.role === "vendor" },
    { to: "/my-products",      label: "My Products", show: user?.role === "vendor" },
    { to: "/add-product",      label: "+ Add",       show: user?.role === "vendor" },
    { to: "/admin",            label: "Admin Panel", show: user?.role === "admin",  adminStyle: true },
  ].filter((l) => l.show);

  return (
    <nav className="bg-[#131921] sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">

        {/* Brand */}
        <Link to="/" onClick={closeMenu}
          className="text-white text-xl font-semibold tracking-tight shrink-0">
          Shop<span className="text-yellow-400">Zone</span>
        </Link>

        {/* Role badge — shows logged-in user's role */}
        {user && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide hidden sm:block ${
            user.role === "admin"  ? "bg-red-500/30 text-red-300" :
            user.role === "vendor" ? "bg-purple-500/30 text-purple-300" :
                                     "bg-blue-500/30 text-blue-300"
          }`}>
            {user.role}
          </span>
        )}

        <div className="flex-1" />

        {/* ── DESKTOP NAV (hidden on mobile) ── */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}
              className={link.adminStyle
                ? `text-sm px-3 py-1.5 rounded-lg transition-colors text-red-300
                   hover:text-white hover:bg-white/10`
                : linkClass(link.to)
              }>
              {link.label}
            </Link>
          ))}

          <div className="w-px h-5 bg-white/20 mx-1" />

          {/* Cart */}
          <Link to="/cart" className="relative flex items-center gap-1.5 text-white
                     hover:bg-white/10 text-sm px-3 py-1.5 rounded-lg transition-colors">
            <span className="relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor"
                strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-[#131921]
                                 text-[10px] font-bold w-4 h-4 rounded-full
                                 flex items-center justify-center leading-none">
                  {cartCount}
                </span>
              )}
            </span>
            Cart
          </Link>

          <div className="w-px h-5 bg-white/20 mx-1" />

          {/* Auth */}
          {user ? (
            <div className="flex items-center gap-1">
              <span className="text-gray-300 text-sm px-2 hidden lg:block">
                Hi, {user.name?.split(" ")[0]}
              </span>
              <button onClick={logoutHandler}
                className="text-gray-300 hover:text-white hover:bg-white/10
                           text-sm px-3 py-1.5 rounded-lg transition-colors">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login"
              className="text-gray-300 hover:text-white hover:bg-white/10
                         text-sm px-3 py-1.5 rounded-lg transition-colors">
              Login
            </Link>
          )}
        </div>

        {/* ── MOBILE: Cart icon + Hamburger (shown only on mobile) ── */}
        <div className="flex items-center gap-2 md:hidden">

          {/* Cart icon on mobile */}
          <Link to="/cart" className="relative text-white p-1.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor"
              strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
            </svg>
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-yellow-400 text-[#131921]
                               text-[9px] font-bold w-3.5 h-3.5 rounded-full
                               flex items-center justify-center leading-none">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Hamburger button — toggles between ☰ and ✕ */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              // ✕ close icon
              <svg className="w-5 h-5" fill="none" stroke="currentColor"
                strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            ) : (
              // ☰ hamburger icon
              <svg className="w-5 h-5" fill="none" stroke="currentColor"
                strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── MOBILE DROPDOWN MENU ── */}
      {/*
        Why this approach?
        We render it conditionally with {menuOpen && ...}
        When menuOpen is false, the DOM element doesn't exist at all.
        This is simpler than CSS display:none for a beginner project.
      */}
      {menuOpen && (
        <div className="md:hidden bg-[#1a2332] border-t border-white/10 px-4 py-3 space-y-1">

          {/* User info strip */}
          {user && (
            <div className="flex items-center gap-2 px-3 py-2 mb-2
                            border-b border-white/10 pb-3">
              <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center
                              justify-center text-[#131921] text-xs font-bold">
                {user.name?.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{user.name}</p>
                <p className="text-gray-400 text-xs capitalize">{user.role}</p>
              </div>
            </div>
          )}

          {/* All nav links */}
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} onClick={closeMenu}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive(link.to)
                  ? "bg-white/20 text-white font-medium"
                  : link.adminStyle
                  ? "text-red-300 hover:bg-white/10"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}>
              {link.label}
            </Link>
          ))}

          <div className="border-t border-white/10 pt-2 mt-2">
            {user ? (
              <button onClick={logoutHandler}
                className="w-full text-left px-3 py-2 text-sm text-gray-300
                           hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                Logout
              </button>
            ) : (
              <Link to="/login" onClick={closeMenu}
                className="block px-3 py-2 text-sm text-gray-300
                           hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;