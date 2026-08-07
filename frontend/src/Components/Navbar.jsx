import React, { useState, useEffect, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Keyboard,
  Search,
  Heart,
  ShoppingBag,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  Command,
  Settings,
  Package,
  LogOut,
} from 'lucide-react';

// Navigation Links Data
const NAV_LINKS = [
  { name: 'Keyboards', path: '/keyboards' },
  { name: 'Mouse', path: '/mouse' },
  { name: 'Desktop Mats', path: '/desktop_mats' },
  { name: 'Cables', path: '/cables' },
];

export default function Navbar({ wishlistCount = 2 }) {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Grab the live cart from our global context
  const { cart } = useContext(CartContext);

  // 2. Calculate the actual number of items in the cart dynamically
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Handle scroll effect for glassmorphism border & shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K for search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock scroll when mobile drawer or search overlay is open
  useEffect(() => {
    if (isMobileMenuOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen, isSearchOpen]);

  return (
    <>
      {/* Top Ambient RGB Keyboard Underglow Line */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-blue-500 opacity-70" />

      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled
          ? 'bg-[#09090B]/80 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/50 py-3'
          : 'bg-[#09090B]/40 backdrop-blur-md border-b border-white/5 py-4'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">

            {/* 1. BRAND LOGO */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 p-[1px] transition-transform duration-300 group-hover:scale-105 shadow-lg shadow-violet-500/20">
                <div className="w-full h-full bg-[#09090B] rounded-[11px] flex items-center justify-center transition-colors group-hover:bg-[#111827]">
                  <Keyboard className="w-5 h-5 text-violet-400 group-hover:text-violet-300 transition-colors" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1 font-mono">
                  KEY<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">FORGE</span>
                </span>
                <span className="text-[10px] text-gray-400 tracking-widest uppercase font-semibold">Custom Boards</span>
              </div>
            </Link>

            {/* 2. DESKTOP NAVIGATION (Centered) */}
            <nav className="hidden md:flex items-center gap-1 bg-[#111827]/60 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md">
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 flex items-center gap-1.5 ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    {link.name}

                    {/* Optional Highlight Badge */}
                    {link.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full tracking-wider">
                        {link.badge}
                      </span>
                    )}

                    {/* Active Pill Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavPill"
                        className="absolute inset-0 bg-gradient-to-r from-violet-600/30 to-blue-600/30 border border-violet-500/40 rounded-full -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}

                    {/* Hover Glow Underline */}
                    {!isActive && (
                      <span className="absolute bottom-1 left-4 right-4 h-[2px] bg-gradient-to-r from-violet-500 to-blue-500 rounded-full scale-x-0 transition-transform duration-300 group-hover:scale-x-100 opacity-0 hover:opacity-100" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* 3. RIGHT UTILITIES */}
            <div className="flex items-center gap-2 sm:gap-3">

              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
                className="hidden lg:flex items-center gap-2 bg-[#111827] hover:bg-zinc-800 text-gray-400 hover:text-white border border-white/10 hover:border-violet-500/50 rounded-xl px-3 py-1.5 text-xs transition-all duration-200 group"
              >
                <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-violet-400 transition-colors" />
                <span>Search parts...</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 bg-zinc-900 border border-white/10 px-1.5 py-0.5 rounded text-[10px] text-gray-400 font-mono">
                  <Command className="w-2.5 h-2.5" />K
                </kbd>
              </button>

              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
                className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label="Toggle Theme"
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors relative"
              >
                <motion.div
                  key={isDarkMode ? 'dark' : 'light'}
                  initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDarkMode ? <Moon className="w-5 h-5 text-violet-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
                </motion.div>
              </button>

              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors group"
              >
                <Heart className="w-5 h-5 group-hover:scale-110 group-hover:text-rose-400 transition-all duration-200" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-4 ring-[#09090B]" />
                )}
              </Link>

              {/* Cart Icon using LIVE cartItemCount */}
              <Link
                to="/cart"
                aria-label="Cart"
                className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors group"
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 group-hover:text-violet-400 transition-all duration-200" />
                <AnimatePresence>
                  {cartItemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      key="cart-badge"
                      className="absolute -top-1 -right-1 min-w-[20px] h-[20px] flex items-center justify-center px-1 text-[11px] font-bold text-white bg-gradient-to-r from-violet-600 to-blue-600 border border-white/20 rounded-full shadow-lg shadow-violet-500/40"
                    >
                      {cartItemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              <div className="h-5 w-[1px] bg-white/10 hidden sm:block mx-1" />

              <div className="relative hidden sm:block">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  aria-label="User Menu"
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold border border-white/20 shadow-inner">
                    TF
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />

                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#111827] border border-white/10 shadow-2xl shadow-black/80 p-2 z-20 backdrop-blur-2xl"
                      >
                        <div className="px-3 py-2 border-b border-white/10">
                          <p className="text-xs font-semibold text-white">Thoufiq</p>
                          <p className="text-[11px] text-gray-400 truncate">thoufiq@keyforge.dev</p>
                        </div>
                        <div className="py-1">
                          <Link
                            to="/orders"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                          >
                            <Package className="w-4 h-4 text-violet-400" />
                            My Builds & Orders
                          </Link>
                          <Link
                            to="/settings"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                          >
                            <Settings className="w-4 h-4 text-blue-400" />
                            Account Settings
                          </Link>
                        </div>
                        <div className="pt-1 border-t border-white/10">
                          <button
                            onClick={() => setIsProfileOpen(false)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Mobile Menu"
                className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* SEARCH MODAL */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl bg-[#111827] border border-white/10 rounded-2xl shadow-2xl shadow-black overflow-hidden z-10"
            >
              <div className="flex items-center px-4 py-3 border-b border-white/10">
                <Search className="w-5 h-5 text-violet-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search switches, PCBs, keycaps, lubricants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-[#09090B]/60 max-h-80 overflow-y-auto">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Popular Searches</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['Gateron Oil King', 'Polycarbonate Plate', '65% PCB', 'Cherry Profile Keycaps', '205g0 Lube'].map((item) => (
                    <button
                      key={item}
                      onClick={() => setSearchQuery(item)}
                      className="px-3 py-1 bg-white/5 hover:bg-violet-500/20 hover:text-violet-300 text-xs text-gray-300 rounded-lg border border-white/5 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-[#09090B] border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl z-10"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Keyboard className="w-6 h-6 text-violet-400" />
                    <span className="font-bold text-white font-mono text-lg tracking-tight">KEYFORGE</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <nav className="mt-6 flex flex-col gap-2">
                  {NAV_LINKS.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.name}
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                          ? 'bg-violet-600/20 text-white border border-violet-500/30'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                          }`}
                      >
                        <span>{link.name}</span>
                        {link.badge && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-violet-500/20 text-violet-300 rounded-full border border-violet-500/30">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    TF
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Thoufiq</p>
                    <p className="text-xs text-gray-400">thoufiq@keyforge.dev</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs rounded-xl transition-colors shadow-lg shadow-violet-600/30"
                >
                  View Account
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}