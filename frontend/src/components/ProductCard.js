import { Link } from "react-router-dom";
import { addToCart } from "../utils/cart";
import toast from "react-hot-toast";

/*
  Stock indicator logic:
  - stock > 10     → no badge (plenty available)
  - stock 1-10     → "Only X left" warning badge
  - stock 0        → "Out of Stock" — disable Add to Cart button
*/

const StockBadge = ({ stock }) => {
  if (stock > 10) return null;
  if (stock === 0) return (
    <span className="absolute top-2 left-2 bg-red-500 text-white
                     text-[10px] font-bold px-2 py-0.5 rounded-full">
      Out of Stock
    </span>
  );
  return (
    <span className="absolute top-2 left-2 bg-orange-400 text-white
                     text-[10px] font-bold px-2 py-0.5 rounded-full">
      Only {stock} left
    </span>
  );
};

const ProductCard = ({ product }) => {
  const imageUrl =
    product.images && product.images.length > 0
      ? `http://localhost:5000/${product.images[0]}`
      : "https://placehold.co/300x200?text=No+Image";

  const outOfStock = product.stock === 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (outOfStock) return;
    addToCart(product);
    toast.success("Added to cart!");
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden
                 hover:shadow-md transition-shadow duration-200 flex flex-col"
    >
      {/* Image + stock badge */}
      <div className="relative h-44 bg-gray-50 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className={`w-full h-full object-contain p-3 hover:scale-105
                      transition-transform duration-200
                      ${outOfStock ? "opacity-50" : ""}`}
        />
        <StockBadge stock={product.stock} />
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Category */}
        {product.category && (
          <span className="text-[10px] text-gray-400 bg-gray-100
                           px-2 py-0.5 rounded-full w-fit">
            {product.category}
          </span>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1">
          <span className="text-yellow-400 text-xs">★</span>
          <span className="text-xs text-gray-500">
            {product.averageRating
              ? product.averageRating.toFixed(1)
              : "No ratings"}
          </span>
        </div>

        {/* Price */}
        <p className="text-base font-semibold text-gray-900 mt-auto pt-1">
          ₹{product.price}
        </p>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className={`mt-2 w-full text-sm font-medium py-1.5 rounded-lg transition-colors
            ${outOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-yellow-400 hover:bg-yellow-500 text-gray-900"
            }`}
        >
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;