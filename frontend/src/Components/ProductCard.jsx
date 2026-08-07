import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, CheckCircle2, ExternalLink, Package } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useContext(CartContext);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const rating = product.rating || 4.5;
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group relative bg-[#111827]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all duration-500 hover:shadow-xl hover:shadow-violet-500/10 flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50">
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-600" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-60" />

        {/* Stock badge */}
        {product.stock !== undefined && (
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
            product.stock > 10
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : product.stock > 0
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-red-500/20 text-red-300 border-red-500/30'
          }`}>
            {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30 backdrop-blur-md">
          {product.category}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Brand */}
        {product.brand && (
          <p className="text-[11px] font-semibold text-violet-400 uppercase tracking-widest mb-1">{product.brand}</p>
        )}

        {/* Name */}
        <h3 className="text-white font-bold text-base leading-tight mb-2 line-clamp-2 group-hover:text-violet-200 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < fullStars
                    ? 'text-amber-400 fill-amber-400'
                    : i === fullStars && hasHalf
                    ? 'text-amber-400 fill-amber-400/50'
                    : 'text-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">{rating.toFixed(1)}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 mb-4 flex-1">{product.description}</p>

        {/* Best For tags */}
        {product.best_for && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(Array.isArray(product.best_for) ? product.best_for : [product.best_for]).slice(0, 3).map((tag, i) => (
              <span key={i} className="px-2 py-0.5 text-[10px] font-medium bg-white/5 text-gray-300 rounded-md border border-white/5">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price + Actions */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <div>
            <span className="text-2xl font-extrabold text-white">${product.price?.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={product.link || '#'}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 hover:border-white/10 transition-all"
              title="View Category"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                added
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : product.stock === 0
                  ? 'bg-gray-500/10 text-gray-500 border border-gray-500/20 cursor-not-allowed'
                  : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 hover:shadow-violet-500/40'
              }`}
            >
              {added ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  Add
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
