import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import CartItem from '../components/CartItem';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useContext(CartContext);
  
  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="pt-32 px-4 max-w-4xl mx-auto min-h-screen pb-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Your Build</h1>
        <span className="text-gray-400 bg-white/5 px-3 py-1 rounded-full text-sm border border-white/10">
          {cart.length} Item{cart.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#111827]/50 rounded-[24px] border border-white/5">
          <ShoppingBag className="w-16 h-16 text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-6">Ask the AI Assistant to recommend some parts!</p>
          <Link to="/" className="text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1">
            Go back home <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <CartItem 
              key={item.id} 
              item={item} 
              onRemove={removeFromCart}
              onUpdateQuantity={updateQuantity}
            />
          ))}
          
          <div className="mt-8 p-6 bg-[#111827]/80 rounded-[24px] border border-white/10 flex justify-between items-center shadow-xl">
            <span className="text-lg text-gray-300 font-medium">Estimated Total</span>
            <span className="text-3xl font-bold text-white font-mono">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}