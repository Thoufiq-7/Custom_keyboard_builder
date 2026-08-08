import React, { useState, useRef, useEffect, useContext } from 'react';
import { MessageCircle, X, Send, Loader2, ShoppingBag, CheckCircle2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'ai',
      content: 'Hello! I am your AI build assistant. What kind of sound or feel are you looking for in your next keyboard?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Products fetched from backend for cart lookups
  const [allProducts, setAllProducts] = useState([]);
  const { addToCart } = useContext(CartContext);

  // Fetch all products on mount for cart lookup
  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setAllProducts(data))
      .catch(err => console.error('Failed to load products for chat:', err));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleAddProduct = (product) => {
    // Try to find the full product in our fetched list
    const fullProduct = allProducts.find(p => p.id === product.id) || product;
    addToCart(fullProduct);
  };

  const handleSend = async (text = inputValue) => {
    if (!text.trim()) return;

    const newUserMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text.trim() }),
      });

      const data = await response.json();
      console.log("RAW AI DATA:", data);

      const newAiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.message,
        recommendedProducts: data.recommendedProducts || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, newAiMsg]);

      // Auto add-to-cart if AI triggers it
      if (data.action && data.action.type === 'ADD_TO_CART' && data.action.itemIds?.length > 0) {
        data.action.itemIds.forEach(itemId => {
          const product = allProducts.find(p => p.id === itemId);
          if (product) addToCart(product);
        });
      }

    } catch (error) {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "Oops! Make sure your Python Flask server is running on port 5000.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Inline product recommendation card
  const RecommendationCard = ({ product }) => {
    const [added, setAdded] = useState(false);
    return (
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-2.5 hover:border-violet-500/30 transition-all group">
        {/* Tiny image */}
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-white/10"
          />
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">{product.name}</p>
          <p className="text-[11px] text-violet-400 font-bold">${product.price?.toFixed(2)}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {product.link && (
            <button
              onClick={() => navigate(product.link)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="View category"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => {
              handleAddProduct(product);
              setAdded(true);
              setTimeout(() => setAdded(false), 1500);
            }}
            className={`p-1.5 rounded-lg transition-all ${added
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-violet-600 hover:bg-violet-500 text-white'
              }`}
            title="Add to cart"
          >
            {added ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 p-4 rounded-full bg-violet-600 text-white shadow-lg shadow-violet-500/30 z-50 ${isOpen ? 'hidden' : 'block'}`}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 right-2 left-2 sm:left-auto sm:bottom-6 sm:right-6 sm:w-[400px] h-[85vh] sm:h-[620px] bg-[#111827]/90 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-2xl flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="font-semibold text-white">AI Build Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-2xl p-3 ${msg.role === 'user'
                      ? 'bg-violet-600 text-white rounded-tr-sm'
                      : 'bg-white/10 text-gray-200 rounded-tl-sm'
                    }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>

                    {/* Product recommendation cards */}
                    {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.recommendedProducts.map((product, i) => (
                          <RecommendationCard key={product.id || i} product={product} />
                        ))}
                      </div>
                    )}

                    <span className="text-[10px] opacity-50 mt-1 block">{msg.timestamp}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/10 rounded-2xl rounded-tl-sm p-4 flex gap-1">
                    <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask for recommendations..."
                  className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-violet-500/50"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-2 p-2 rounded-full bg-violet-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-500 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}