import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // ✅ Step 1: import Toaster
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import ProductListPage     from "./pages/ProductListPage";
import ProductDetailPage   from "./pages/ProductDetailPage";
import LoginPage           from "./pages/LoginPage";
import RegisterPage        from "./pages/RegisterPage";
import AddProductPage      from "./pages/AddProductPage";
import MyProductsPage      from "./pages/MyProductPage";
import EditProductPage     from "./pages/EditProductPage";
import OrderHistoryPage    from "./pages/OrderHistoryPage";
import CartPage            from "./pages/CartPage";
import VendorDashboardPage from "./pages/VendorDashboardPage";
import AdminPanelPage      from "./pages/AdminPanelPage";

function App() {
  return (
    <Router>
      {/*
        ✅ Toaster sits here — outside Layout, outside Routes.
        This means ONE global toast system for the entire app.
        position: top-right is standard (like Amazon, Flipkart).
        Any page can call toast() and it appears here automatically.
      */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: "14px",
            borderRadius: "10px",
            padding: "12px 16px",
          },
          success: {
            iconTheme: { primary: "#eab308", secondary: "#fff" },
          },
        }}
      />

      <Layout>
        <Routes>
          {/* Public */}
          <Route path="/"             element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/register"     element={<RegisterPage />} />
          <Route path="/cart"         element={<CartPage />} />

          {/* Customer */}
          <Route path="/orders" element={
            <ProtectedRoute><OrderHistoryPage /></ProtectedRoute>
          }/>

          {/* Vendor */}
          <Route path="/vendor-dashboard" element={
            <ProtectedRoute><VendorDashboardPage /></ProtectedRoute>
          }/>
          <Route path="/add-product" element={
            <ProtectedRoute><AddProductPage /></ProtectedRoute>
          }/>
          <Route path="/my-products" element={
            <ProtectedRoute><MyProductsPage /></ProtectedRoute>
          }/>
          <Route path="/edit-product/:id" element={
            <ProtectedRoute><EditProductPage /></ProtectedRoute>
          }/>

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute><AdminPanelPage /></ProtectedRoute>
          }/>
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;