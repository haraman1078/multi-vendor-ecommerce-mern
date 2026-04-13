import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";

const CATEGORIES = [
  "Electronics","Clothing","Home & Kitchen",
  "Books","Sports","Toys","Beauty","Groceries","Other",
];

const AddProductPage = () => {
  const [name, setName]               = useState("");
  const [price, setPrice]             = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory]       = useState("Other");
  const [images, setImages]           = useState([]);
  const [previews, setPreviews]       = useState([]);
  const [loading, setLoading]         = useState(false);

  // ✅ AI description generator state
  const [aiLoading, setAiLoading]     = useState(false);

  const navigate = useNavigate();

  const imageChangeHandler = (e) => {
    const files = [...e.target.files];
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  // ✅ AI: generate description from product name + category + price
  const generateDescription = async () => {
    if (!name.trim()) {
      toast.error("Enter a product name first");
      return;
    }
    setAiLoading(true);
    try {
      const { data } = await API.post("/ai/generate-description", {
        name,
        category,
        price,
      });
      setDescription(data.description);
      toast.success("Description generated! ✨");
    } catch (err) {
      toast.error("AI unavailable. Write manually.");
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imagePaths = [];
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((img) => formData.append("images", img));
        const uploadRes = await API.post("/products/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imagePaths = uploadRes.data.filePaths;
      }

      await toast.promise(
        API.post("/products", { name, price, description, category, images: imagePaths }),
        {
          loading: "Adding product...",
          success: "Product added successfully! 🎉",
          error:   "Failed to add product.",
        }
      );
      navigate("/my-products");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Add New Product</h1>
        <p className="text-sm text-gray-500 mt-1">Fill in the details to list your product</p>
      </div>

      <form onSubmit={submitHandler} className="space-y-5">

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name <span className="text-red-400">*</span>
          </label>
          <input type="text" placeholder="e.g. Wireless Bluetooth Headphones"
            value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                       text-gray-800 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-yellow-400
                       focus:border-transparent transition" />
        </div>

        {/* Description with AI button */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            {/* ✅ AI Generate button */}
            <button
              type="button"
              onClick={generateDescription}
              disabled={aiLoading}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5
                         bg-purple-50 hover:bg-purple-100 text-purple-700 border
                         border-purple-200 rounded-lg transition-colors disabled:opacity-60"
            >
              {aiLoading ? (
                <>
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Generating...
                </>
              ) : (
                <>✨ AI Generate</>
              )}
            </button>
          </div>
          <textarea rows={4} placeholder="Describe your product, or click AI Generate above..."
            value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                       text-gray-800 placeholder-gray-400 resize-none
                       focus:outline-none focus:ring-2 focus:ring-yellow-400
                       focus:border-transparent transition" />
          <p className="text-xs text-gray-400 mt-1">
            💡 Enter product name first, then click AI Generate for an instant description
          </p>
        </div>

        {/* Price + Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
              <input type="number" placeholder="0.00" value={price}
                onChange={(e) => setPrice(e.target.value)} required min="0"
                className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2.5 text-sm
                           text-gray-800 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-yellow-400
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
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
          <label className="flex flex-col items-center justify-center w-full h-32
                             border-2 border-dashed border-gray-300 rounded-xl cursor-pointer
                             hover:border-yellow-400 hover:bg-yellow-50 transition-colors">
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor"
              strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
            </svg>
            <span className="text-sm text-gray-500">Click to upload images</span>
            <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB each</span>
            <input type="file" multiple accept="image/*" className="hidden"
              onChange={imageChangeHandler} />
          </label>
          {previews.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {previews.map((src, i) => (
                <div key={i} className="w-16 h-16 rounded-lg overflow-hidden
                                        border border-gray-200 bg-gray-50">
                  <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
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
            {loading ? "Adding..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;