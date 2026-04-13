import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { addToCart } from "../utils/cart";
import API from "../api/axios";

const StarInput = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map((star) => (
      <button key={star} type="button" onClick={() => onChange(star)}
        className={`text-2xl transition-colors ${
          value >= star ? "text-yellow-400" : "text-gray-300 hover:text-yellow-300"
        }`}>★</button>
    ))}
  </div>
);

const StarDisplay = ({ rating, size = "sm" }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map((star) => (
      <span key={star} className={`${size === "sm" ? "text-sm" : "text-base"} ${
        Number(rating) >= star ? "text-yellow-400" : "text-gray-300"
      }`}>★</span>
    ))}
  </div>
);

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct]             = useState(null);
  const [loading, setLoading]             = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart]     = useState(false);

  // Reviews
  const [reviews, setReviews]             = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [rating, setRating]               = useState(0);
  const [comment, setComment]             = useState("");
  const [submitting, setSubmitting]       = useState(false);
  const [reviewError, setReviewError]     = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // ✅ AI Review Summary state
  const [aiSummary, setAiSummary]         = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const { data } = await API.get(`/products/${id}/reviews`);
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  // ✅ AI: fetch summary once reviews are loaded (only if 2+ reviews)
  useEffect(() => {
    const fetchSummary = async () => {
      if (reviews.length < 2) return; // not enough to summarize

      setSummaryLoading(true);
      try {
        const { data } = await API.post("/ai/summarize-reviews", { reviews });
        setAiSummary(data.summary);
      } catch (err) {
        console.error("Summary failed:", err);
        // silently fail — not critical
      } finally {
        setSummaryLoading(false);
      }
    };
    fetchSummary();
  }, [reviews]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) { setReviewError("Please select a star rating"); return; }
    if (!comment.trim()) { setReviewError("Please write a comment"); return; }
    setReviewError("");
    setSubmitting(true);
    try {
      await API.post(`/products/${id}/reviews`, { rating, comment });
      setReviewSuccess(true);
      setRating(0);
      setComment("");
      fetchReviews();
      toast.success("Review submitted!");
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
    setAddedToCart(true);
    toast.success("Added to cart!");
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 animate-pulse">
          <div className="w-full md:w-96 h-80 bg-gray-200 rounded-xl" />
          <div className="flex-1 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-500">
      Product not found.
    </div>
  );

  const imageUrl = (i) =>
    product.images?.length > 0
      ? `http://localhost:5000/${product.images[i]}`
      : "https://placehold.co/400x300?text=No+Image";

  const ratingCounts = [5,4,3,2,1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <button onClick={() => navigate("/")}
          className="hover:text-yellow-500 transition-colors">Home</button>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{product.name}</span>
      </nav>

      {/* Product Section */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-96 shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden
                          h-80 flex items-center justify-center p-4">
            <img src={imageUrl(selectedImage)} alt={product.name}
              className="max-h-full max-w-full object-contain" />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 mt-3">
              {product.images.map((_, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`w-14 h-14 border-2 rounded-lg overflow-hidden flex items-center
                              justify-center bg-white ${
                                selectedImage === i ? "border-yellow-400" : "border-gray-200"
                              }`}>
                  <img src={imageUrl(i)} alt={`thumb-${i}`}
                    className="max-h-full max-w-full object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">{product.name}</h1>

          {product.category && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1
                             rounded-full w-fit">
              {product.category}
            </span>
          )}

          <div className="flex items-center gap-2">
            <StarDisplay rating={product.averageRating || 0} />
            <span className="text-sm text-gray-500">
              {product.averageRating
                ? `${Number(product.averageRating).toFixed(1)} / 5`
                : "No ratings yet"}
              {reviews.length > 0 && (
                <span className="ml-1">({reviews.length} reviews)</span>
              )}
            </span>
          </div>

          {/* ✅ AI Summary Banner */}
          {summaryLoading && (
            <div className="flex items-center gap-2 bg-purple-50 border border-purple-200
                            rounded-lg px-4 py-2.5 animate-pulse">
              <span className="text-purple-400 text-sm">✨</span>
              <div className="h-3 bg-purple-200 rounded w-3/4" />
            </div>
          )}
          {aiSummary && !summaryLoading && (
            <div className="flex items-start gap-2 bg-purple-50 border border-purple-200
                            rounded-lg px-4 py-2.5">
              <span className="text-purple-500 text-sm shrink-0 mt-0.5">✨</span>
              <div>
                <p className="text-xs font-medium text-purple-600 mb-0.5">AI Review Summary</p>
                <p className="text-sm text-purple-800">{aiSummary}</p>
              </div>
            </div>
          )}

          <div className="border-t border-b border-gray-100 py-3">
            <p className="text-3xl font-bold text-gray-900">₹{product.price}</p>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-xs text-green-600">Inclusive of all taxes</p>
              {/* ✅ Stock indicator */}
              {product.stock !== undefined && (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                  product.stock > 10
                    ? "bg-green-50 text-green-700 border-green-200"
                    : product.stock > 0
                    ? "bg-orange-50 text-orange-700 border-orange-200"
                    : "bg-red-50 text-red-600 border-red-200"
                }`}>
                  {product.stock > 10
                    ? "In Stock"
                    : product.stock > 0
                    ? `Only ${product.stock} left`
                    : "Out of Stock"}
                </span>
              )}
            </div>
          </div>

          {product.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">About this product</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <button onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`px-8 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                product.stock === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : addedToCart
                  ? "bg-green-500 text-white"
                  : "bg-yellow-400 hover:bg-yellow-500 text-gray-900"
              }`}>
              {product.stock === 0 ? "Out of Stock" : addedToCart ? "✓ Added!" : "Add to Cart"}
            </button>
            {product.stock > 0 && (
              <button onClick={() => { addToCart(product); navigate("/cart"); }}
                className="px-8 py-2.5 rounded-lg text-sm font-medium bg-gray-900
                           hover:bg-gray-700 text-white transition-colors">
                Buy Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Customer Reviews
          {reviews.length > 0 && (
            <span className="text-base font-normal text-gray-500 ml-2">
              ({reviews.length})
            </span>
          )}
        </h2>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-80 shrink-0 space-y-6">

            {reviews.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-5xl font-bold text-gray-900">
                    {Number(product.averageRating || 0).toFixed(1)}
                  </span>
                  <div className="pb-1">
                    <StarDisplay rating={product.averageRating || 0} size="base" />
                    <p className="text-xs text-gray-400 mt-1">{reviews.length} reviews</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {ratingCounts.map(({ star, count }) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-4">{star}</span>
                      <span className="text-yellow-400 text-xs">★</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: reviews.length ? `${(count/reviews.length)*100}%` : "0%" }} />
                      </div>
                      <span className="text-xs text-gray-400 w-4 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-base font-medium text-gray-800 mb-4">Write a Review</h3>
              {!user ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-3">Please login to write a review</p>
                  <button onClick={() => navigate("/login")}
                    className="text-sm bg-yellow-400 hover:bg-yellow-500 text-gray-900
                               font-medium px-4 py-2 rounded-lg transition-colors">
                    Login
                  </button>
                </div>
              ) : (
                <form onSubmit={submitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Your Rating</label>
                    <StarInput value={rating} onChange={setRating} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Your Review</label>
                    <textarea rows={4} placeholder="Share your experience..."
                      value={comment} onChange={(e) => setComment(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5
                                 text-sm text-gray-800 placeholder-gray-400 resize-none
                                 focus:outline-none focus:ring-2 focus:ring-yellow-400
                                 focus:border-transparent transition" />
                  </div>
                  {reviewError && <p className="text-xs text-red-500">{reviewError}</p>}
                  {reviewSuccess && (
                    <p className="text-xs text-green-600 font-medium">
                      ✓ Review submitted!
                    </p>
                  )}
                  <button type="submit" disabled={submitting}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60
                               text-gray-900 font-medium text-sm py-2.5 rounded-lg transition-colors">
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="flex-1">
            {reviewsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl
                                          p-4 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-9 h-9 bg-gray-200 rounded-full shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                        <div className="h-12 bg-gray-100 rounded mt-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                <div className="text-4xl text-gray-200 mb-3">💬</div>
                <p className="text-gray-500 text-sm">No reviews yet</p>
                <p className="text-gray-400 text-xs mt-1">Be the first to review</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => {
                  const initials = review.user?.name
                    ? review.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0,2)
                    : "U";
                  return (
                    <div key={review._id}
                      className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex gap-3">
                        <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center
                                        justify-center text-yellow-700 text-xs font-semibold shrink-0">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="text-sm font-medium text-gray-800">
                              {review.user?.name || "Anonymous"}
                            </p>
                            <span className="text-xs text-gray-400">
                              {review.createdAt
                                ? new Date(review.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric", month: "short", year: "numeric",
                                  })
                                : ""}
                            </span>
                          </div>
                          <StarDisplay rating={review.rating} />
                          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;