import { Link } from "react-router-dom";
import { addToCart } from "../utils/cart";

const ProductCard = ({ product }) => {
  const imageUrl =
    product.images && product.images.length > 0
      ? `http://localhost:5000/${product.images[0]}`
      : "https://placehold.co/300x200?text=No+Image";

  const handleAddToCart = (e) => {
    e.preventDefault(); // don't navigate on button click
    addToCart(product);
    alert("Added to cart!");
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden
                 hover:shadow-md transition-shadow duration-200 flex flex-col"
    >
      {/* Product Image */}
      <div className="h-44 bg-gray-50 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-contain p-3 hover:scale-105 transition-transform duration-200"
        />
      </div>

      {/* Product Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <span className="text-yellow-400 text-xs">★</span>
          <span className="text-xs text-gray-500">
            {product.averageRating ? product.averageRating.toFixed(1) : "No ratings"}
          </span>
        </div>

        {/* Price */}
        <p className="text-base font-semibold text-gray-900 mt-auto pt-1">
          ₹{product.price}
        </p>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          className="mt-2 w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900
                     text-sm font-medium py-1.5 rounded-lg transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;