import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Minus, 
  Plus, 
  Trash2, 
  Heart, 
  PackageCheck, 
  Truck, 
  Tag,
  AlertCircle
} from 'lucide-react';

export default function CartItem({ 
  item = defaultItem, 
  onRemove, 
  onSaveForLater, 
  onUpdateQuantity 
}) {
  const [quantity, setQuantity] = useState(item.quantity || 1);
  const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Derived calculations
  const isDiscounted = item.originalPrice > item.price;
  const discountAmount = item.originalPrice - item.price;
  const discountPercentage = Math.round((discountAmount / item.originalPrice) * 100);
  const totalItemPrice = item.price * quantity;

  // Handlers
  const handleIncrease = () => {
    if (quantity < (item.maxQuantity || 10)) {
      const newQty = quantity + 1;
      setQuantity(newQty);
      if (onUpdateQuantity) onUpdateQuantity(item.id, newQty);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      const newQty = quantity - 1;
      setQuantity(newQty);
      if (onUpdateQuantity) onUpdateQuantity(item.id, newQty);
    }
  };

  const handleRemove = () => {
    if (isConfirmingRemove) {
      if (onRemove) onRemove(item.id);
    } else {
      setIsConfirmingRemove(true);
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => setIsConfirmingRemove(false), 3000);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    if (onSaveForLater) onSaveForLater(item.id);
  };

  // The attributes we want to display as small premium pills
  const attributes = [
    { label: item.layout, show: !!item.layout },
    { label: item.color, show: !!item.color },
    { label: item.switches, show: !!item.switches },
  ].filter(attr => attr.show);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, height: 0, transition: { duration: 0.3 } }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="relative group w-full bg-[#111827]/80 backdrop-blur-xl border border-white/5 hover:border-violet-500/30 rounded-[24px] p-4 sm:p-5 shadow-2xl shadow-black/50 transition-colors duration-300 overflow-hidden"
    >
      {/* Subtle background glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row gap-5 sm:gap-6">
        
        {/* 1. IMAGE SECTION */}
        <div className="relative w-full sm:w-[160px] h-[160px] rounded-[18px] overflow-hidden bg-[#09090B] shrink-0 border border-white/10">
          {/* Zoom on hover effect */}
          <motion.img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Discount Badge */}
          {isDiscounted && (
            <div className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-extrabold px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg shadow-rose-500/30">
              <Tag className="w-3 h-3" />
              SAVE {discountPercentage}%
            </div>
          )}
        </div>

        {/* 2. DETAILS SECTION */}
        <div className="flex-1 flex flex-col">
          
          {/* Header & Price */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-2 sm:gap-0 mb-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-tight">
                {item.name}
              </h3>
              <p className="text-xs text-violet-400 font-medium mt-0.5">
                {item.variant}
              </p>
            </div>
            
            {/* Price Column */}
            <div className="flex flex-col sm:items-end">
              <span className="text-xl font-bold text-white font-mono">
                ${totalItemPrice.toFixed(2)}
              </span>
              {isDiscounted && (
                <span className="text-xs text-gray-500 line-through font-mono">
                  ${(item.originalPrice * quantity).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Configuration Pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {attributes.map((attr, idx) => (
              <span 
                key={idx} 
                className="px-2.5 py-1 text-[11px] font-medium text-gray-300 bg-white/5 border border-white/5 rounded-lg"
              >
                {attr.label}
              </span>
            ))}
          </div>

          {/* Status Indicators */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-5 mt-auto">
            <div className="flex items-center gap-1.5">
              {item.inStock ? (
                <>
                  <PackageCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-emerald-500 font-medium">In Stock</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-amber-500 font-medium">Backordered</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Truck className="w-4 h-4" />
              <span className="text-xs">{item.shipping}</span>
            </div>
          </div>

          {/* Bottom Actions Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
            
            {/* Quantity Selector */}
            <div className="flex items-center bg-[#09090B] border border-white/10 rounded-xl p-1 shadow-inner">
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={handleDecrease}
                disabled={quantity <= 1}
                className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors rounded-lg hover:bg-white/5"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </motion.button>
              
              <div className="w-10 text-center overflow-hidden">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={quantity}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="inline-block text-sm font-semibold text-white font-mono"
                  >
                    {quantity}
                  </motion.span>
                </AnimatePresence>
              </div>

              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={handleIncrease}
                disabled={quantity >= (item.maxQuantity || 10)}
                className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors rounded-lg hover:bg-white/5"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Utility Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors border ${
                  isSaved 
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                    : 'text-gray-400 hover:text-white border-transparent hover:bg-white/5'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-400' : ''} transition-colors`} />
                <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              
              {/* Animated Remove Button with Confirmation */}
              <div className="relative">
                <AnimatePresence mode="wait">
                  {!isConfirmingRemove ? (
                    <motion.button
                      key="remove"
                      initial={{ opacity: 0, w: 0 }}
                      animate={{ opacity: 1, w: 'auto' }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={handleRemove}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-rose-400 border border-transparent hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Remove</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      key="confirm"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={handleRemove}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Confirm?
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ----------------------------------------
// MOCK DATA FOR TESTING
// ----------------------------------------
const defaultItem = {
  id: "kb-01",
  name: "KeyForge Obsidian 75%",
  variant: "Custom Fully Assembled",
  switches: "Gateron Oil King (Linear)",
  color: "Matte Black Aluminum",
  layout: "75% / 84-Key",
  price: 185.00,
  originalPrice: 220.00,
  image: "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=600&auto=format&fit=crop",
  inStock: true,
  shipping: "Ships in 2-3 business days",
  quantity: 1,
  maxQuantity: 5
};