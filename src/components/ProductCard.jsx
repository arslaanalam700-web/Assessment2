import React, { useState } from 'react';
import { Star, Sparkles, Check, ShoppingCart, Heart, Tag } from 'lucide-react';

export default function ProductCard({
  product,
  isRecommended,
  recommendationRank,
  aiReason
}) {
  const [isAdded, setIsAdded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleAddToCart = () => {
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1600);
  };

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <div
      className={`group relative flex flex-col bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
        isRecommended
          ? 'border-indigo-400 shadow-md shadow-indigo-100 hover:shadow-xl hover:shadow-indigo-200 ring-2 ring-indigo-500/10'
          : 'border-slate-200/90 shadow-sm hover:shadow-lg hover:border-slate-300'
      }`}
    >
      {/* AI Recommendation Ribbon / Badge */}
      {isRecommended && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold shadow-md">
          <Sparkles className="w-3 h-3 animate-pulse" />
          <span>AI Pick #{recommendationRank}</span>
        </div>
      )}

      {/* Wishlist Button */}
      <button
        onClick={() => setIsLiked(!isLiked)}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm transition"
        title="Save to wishlist"
      >
        <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
      </button>

      {/* Image Container */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-black/60 backdrop-blur-md text-white">
            {product.category}
          </span>
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-600 text-white flex items-center gap-0.5">
              <Tag className="w-3 h-3" />
              {discountPercent}% OFF
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Rating & Reviews */}
        <div className="flex items-center gap-1 mb-1.5">
          <div className="flex items-center text-amber-400">
            <Star className="w-4 h-4 fill-amber-400" />
          </div>
          <span className="text-xs font-bold text-slate-800">{product.rating}</span>
          <span className="text-xs text-slate-400">({product.reviewCount})</span>
          <span className="ml-auto text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
            In Stock
          </span>
        </div>

        {/* Product Title */}
        <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition line-clamp-1 mb-1">
          {product.name}
        </h3>

        {/* Short description */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
          {product.description}
        </p>

        {/* AI Explanation Box (when recommended) */}
        {aiReason && (
          <div className="mb-3.5 p-3 rounded-xl bg-indigo-50/90 border border-indigo-200/70 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-indigo-900 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Why AI Recommends This:</span>
            </div>
            <p className="text-indigo-950 font-normal leading-normal">
              {aiReason}
            </p>
          </div>
        )}

        {/* Features badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {product.features.slice(0, 3).map((feat, i) => (
            <span
              key={i}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
            >
              {feat}
            </span>
          ))}
          {product.features.length > 3 && (
            <span className="text-[10px] text-slate-400 self-center">
              +{product.features.length - 3} more
            </span>
          )}
        </div>

        {/* Bottom Section: Price & Action */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-slate-900">${product.price}</span>
              {product.originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition shadow-sm ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 hover:bg-indigo-600 text-white active:scale-95'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
