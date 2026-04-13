import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";

const CATEGORIES = [
  "Electronics","Clothing","Home & Kitchen",
  "Books","Sports","Toys","Beauty","Groceries","Other",
];

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName]               = useState("");
  const [price, setPrice]             = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory]       = useState("Other");
  const [stock, setStock]             = useState("");   // ✅ new
  const [fetching, setFetching]       = useState(true);
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setName(data.name);
        setPrice(data.price);
        setDescription(data.description || "");
        setCategory(data.category || "Other");
        setStock(data.stock ?? 0);   // ✅ load existing stock
      } catch (err) {
        console.error(err);
        toast.error("Failed to load product");
      } finally {
        setFetching(false);
      }
    };
    fetchProduct();
  }, [id]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await toast.promise(
        API.put(`/products/${id}`, {
          name, price, description, category,
          stock: Number(stock) || 0,  // ✅ include stock
        }),
        {
          loading: "Saving changes...",
          success: "Product updated successfully!",
          error:   "Failed to update product.",
        }
      );
      navigate("/my-products");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-24 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded w-1/3" />
      </div>
    );
  }

  // Stock status indicator
  const stockStatus =
    stock > 10  ? { label: "In Stock",    color: "text-green-600 bg-green-50 border-green-200" } :
    stock > 0   ? { label: `Low Stock (${stock} left)`, color: "text-orange-600 bg-orange-50 border-orange-200" } :
                  { label: "Out of Stock", color: "text-red-600 bg-red-50 border-red-200" };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Edit Product</h1>
        <p className="text-sm text-gray-500 mt-1">Update your product details</p>
      </div>

      <form onSubmit={submitHandler} className="space-y-5">

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name <span className="text-red-400">*</span>
          </label>
          <input type="text" value={name}
            onChange={(e) => setName(e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                       text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400
                       focus:border-transparent transition" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea rows={4} value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                       text-gray-800 placeholder-gray-400 resize-none
                       focus:outline-none focus:ring-2 focus:ring-yellow-400
                       focus:border-transparent transition" />
        </div>

        {/* Price + Category + Stock */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
              <input type="number" value={price}
                onChange={(e) => setPrice(e.target.value)} required min="0"
                className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2.5 text-sm
                           text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400
                           focus:border-transparent transition" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                         text-gray-800 bg-white focus:outline-none focus:ring-2
                         focus:ring-yellow-400 focus:border-transparent transition">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* ✅ Stock field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Qty</label>
            <input type="number" value={stock}
              onChange={(e) => setStock(e.target.value)} min="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                         text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400
                         focus:border-transparent transition" />
          </div>
        </div>

        {/* ✅ Live stock status indicator */}
        <div className={`inline-flex items-center gap-2 text-xs font-medium
                         px-3 py-1.5 rounded-full border ${stockStatus.color}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {stockStatus.label}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate("/my-products")}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300
                       rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="px-8 py-2.5 text-sm font-medium bg-yellow-400 hover:bg-yellow-500
                       disabled:opacity-60 text-gray-900 rounded-lg transition-colors">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;