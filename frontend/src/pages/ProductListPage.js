import { useEffect, useState, useCallback } from "react";
import API from "../api/axios";
import ProductCard from "../components/ProductCard";
import ShoppingAssistant from "../components/ShoppingAssistant";

/*
  WHY pagination?
  Without it, if you have 200 products, all 200 load at once.
  That's slow for the user AND slow for your backend/database.
  Pagination loads 12 products at a time — much faster.

  HOW it works:
  - Backend already supports ?page=1&limit=12
  - Frontend tracks `currentPage` state
  - When page changes, fetchProducts() re-runs with new page number
  - We show Previous/Next buttons and page numbers
*/

const CATEGORIES = [
  "All","Electronics","Clothing","Home & Kitchen",
  "Books","Sports","Toys","Beauty","Groceries","Other",
];

const SORT_OPTIONS = [
  { label: "Default",           value: "" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Top Rated",         value: "rating" },
];

const PRODUCTS_PER_PAGE = 12;

const ProductListPage = () => {
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");
  const [category, setCategory]       = useState("All");
  const [minPrice, setMinPrice]       = useState("");
  const [maxPrice, setMaxPrice]       = useState("");
  const [sortBy, setSortBy]           = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalCount, setTotalCount]   = useState(0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search)             params.append("search",   search);
      if (minPrice)           params.append("minPrice", minPrice);
      if (maxPrice)           params.append("maxPrice", maxPrice);
      if (sortBy)             params.append("sortBy",   sortBy);
      if (category !== "All") params.append("category", category);
      params.append("page",  currentPage);
      params.append("limit", PRODUCTS_PER_PAGE);

      const { data } = await API.get(`/products?${params.toString()}`);
      let results = data.products || data;

      // Client-side fallbacks
      if (search)
        results = results.filter((p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.description || "").toLowerCase().includes(search.toLowerCase())
        );
      if (category !== "All") results = results.filter((p) => p.category === category);
      if (minPrice) results = results.filter((p) => p.price >= Number(minPrice));
      if (maxPrice) results = results.filter((p) => p.price <= Number(maxPrice));
      if (sortBy === "price_asc")  results = [...results].sort((a, b) => a.price - b.price);
      if (sortBy === "price_desc") results = [...results].sort((a, b) => b.price - a.price);
      if (sortBy === "rating")     results = [...results].sort((a, b) => (b.averageRating||0)-(a.averageRating||0));

      setProducts(results);

      // Set pagination info from backend response
      // If backend sends pages/total, use that. Otherwise calculate from results.
      setTotalPages(data.pages || Math.ceil((data.total || results.length) / PRODUCTS_PER_PAGE) || 1);
      setTotalCount(data.total || results.length);

    } catch (err) {
      setError("Failed to load products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, minPrice, maxPrice, sortBy, currentPage]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Reset to page 1 when filters change
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearch(searchInput.trim());
  };

  const handleCategoryChange = (cat) => {
    setCurrentPage(1); // ✅ always reset to page 1 on filter change
    setCategory(cat);
  };

  const handleSortChange = (val) => {
    setCurrentPage(1);
    setSortBy(val);
  };

  const clearFilters = () => {
    setSearch(""); setSearchInput(""); setCategory("All");
    setMinPrice(""); setMaxPrice(""); setSortBy("");
    setCurrentPage(1);
  };

  const hasActiveFilters = search || category !== "All" || minPrice || maxPrice || sortBy;

  // Pagination helper — generates page number array like [1, 2, 3, '...', 8]
  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2) return [1, "...", totalPages-3, totalPages-2, totalPages-1, totalPages];
    return [1, "...", currentPage-1, currentPage, currentPage+1, "...", totalPages];
  };

  const SkeletonCard = () => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-100" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3 mt-2" />
        <div className="h-8 bg-gray-200 rounded mt-2" />
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">

      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-gray-800">All Products</h1>
        <p className="text-sm text-gray-500 mt-1">Browse our latest collection</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Search products..." value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm
                       text-gray-800 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent" />
        </div>
        <button type="submit"
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium
                     text-sm px-5 py-2.5 rounded-lg transition-colors">
          Search
        </button>
      </form>

      {/* Category Chips */}
      <div className="flex gap-2 flex-wrap mb-4">
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => handleCategoryChange(cat)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              category === cat
                ? "bg-yellow-400 border-yellow-400 text-gray-900"
                : "bg-white border-gray-200 text-gray-600 hover:border-yellow-300 hover:text-yellow-600"
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
          <input type="number" placeholder="Min price" value={minPrice}
            onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }} min="0"
            className="pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-32
                       focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent" />
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
          <input type="number" placeholder="Max price" value={maxPrice}
            onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }} min="0"
            className="pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-32
                       focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent" />
        </div>
        <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700
                     focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white">
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button onClick={clearFilters}
            className="flex items-center gap-1.5 text-sm text-red-500 border border-red-200
                       px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Clear
          </button>
        )}

        {!loading && !error && (
          <span className="ml-auto text-sm text-gray-400">
            {totalCount} {totalCount === 1 ? "product" : "products"}
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600
                        px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(PRODUCTS_PER_PAGE)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-xl">
          <div className="text-5xl text-gray-200 mb-4">🔍</div>
          <h2 className="text-lg font-medium text-gray-600 mb-2">No products found</h2>
          <p className="text-sm text-gray-400 mb-4">Try adjusting your search or filters</p>
          <button onClick={clearFilters}
            className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* ── PAGINATION ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">

              {/* Previous button */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300
                           rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40
                           disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                </svg>
                Prev
              </button>

              {/* Page numbers */}
              {getPageNumbers().map((page, i) =>
                page === "..." ? (
                  <span key={`dots-${i}`} className="px-2 text-gray-400 text-sm">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-yellow-400 text-gray-900 border border-yellow-400"
                        : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              {/* Next button */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300
                           rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40
                           disabled:cursor-not-allowed transition-colors"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          )}

          {/* Page info */}
          {totalPages > 1 && (
            <p className="text-center text-xs text-gray-400 mt-2">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </>
      )}
      {/* ✅ AI Shopping Assistant - floats on all screen sizes */}
      <ShoppingAssistant products={products} />
    </div>
  );
};

export default ProductListPage;