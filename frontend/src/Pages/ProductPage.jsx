import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Search, SlidersHorizontal, ChevronDown, Package } from 'lucide-react';
import ProductCard from '../Components/ProductCard';

const SORT_OPTIONS = [
    { label: 'Featured', value: 'featured' },
    { label: 'Price: Low → High', value: 'price-asc' },
    { label: 'Price: High → Low', value: 'price-desc' },
    { label: 'Rating', value: 'rating' },
    { label: 'Name A–Z', value: 'name' },
];

const CATEGORY_META = {
    Keyboard: {
        title: 'Keyboards',
        subtitle: 'Premium mechanical keyboards for every typing style',
        gradient: 'from-violet-500 to-blue-500',
        icon: '⌨️',
    },
    Mouse: {
        title: 'Mouse',
        subtitle: 'Precision gaming and productivity mice',
        gradient: 'from-emerald-500 to-teal-500',
        icon: '🖱️',
    },
    "Desktop Mats": {
        title: 'Desktop Mats',
        subtitle: 'Extended desk mats for smooth gliding',
        gradient: 'from-amber-500 to-orange-500',
        icon: '🧊',
    },
    Cable: {
        title: 'Cables',
        subtitle: 'Custom coiled cables for your perfect setup',
        gradient: 'from-rose-500 to-pink-500',
        icon: '🔌',
    },
    Laptop: {
        title: 'Laptops',
        subtitle: 'Powerful portable laptops for gaming and productivity',
        gradient: 'from-sky-500 to-cyan-500',
        icon: '💻',
    },
    Monitor: {
        title: 'Monitors',
        subtitle: 'Stunning displays for gaming and professional work',
        gradient: 'from-indigo-500 to-violet-500',
        icon: '🖥️',
    },
    Desktop: {
        title: 'Desktops',
        subtitle: 'High-performance desktop PCs for every use case',
        gradient: 'from-orange-500 to-red-500',
        icon: '🗖',
    },
};

export default function ProductPage({ category }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('featured');
    const [isSortOpen, setIsSortOpen] = useState(false);

    const meta = CATEGORY_META[category] || { title: category, subtitle: '', gradient: 'from-violet-500 to-blue-500', icon: '📦' };

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(`${API_URL}/api/products?category=${category}`)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data) => {
                setProducts(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch products:', err);
                setError('Could not load products. Please try again later.');
                setLoading(false);
            });
    }, [category]);

    // Filter + Sort
    const displayProducts = useMemo(() => {
        let filtered = products;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.name?.toLowerCase().includes(q) ||
                    p.brand?.toLowerCase().includes(q) ||
                    p.description?.toLowerCase().includes(q) ||
                    (Array.isArray(p.best_for) && p.best_for.some((b) => b.toLowerCase().includes(q)))
            );
        }

        const sorted = [...filtered];
        switch (sortBy) {
            case 'price-asc':
                sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case 'price-desc':
                sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'rating':
                sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'name':
                sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
            default:
                break;
        }

        return sorted;
    }, [products, searchQuery, sortBy]);

    return (
        <div className="pt-28 px-4 pb-20 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <div className="text-5xl mb-4">{meta.icon}</div>
                <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r ${meta.gradient}`}>
                    {meta.title}
                </h1>
                <p className="text-gray-400 text-lg max-w-xl mx-auto">{meta.subtitle}</p>
            </motion.div>

            {/* Toolbar */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8"
            >
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search ${meta.title.toLowerCase()}...`}
                        className="w-full bg-[#111827]/80 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 backdrop-blur-md"
                    />
                </div>

                {/* Sort */}
                <div className="relative">
                    <button
                        onClick={() => setIsSortOpen(!isSortOpen)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#111827]/80 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white hover:border-white/20 transition-all backdrop-blur-md w-full sm:w-auto"
                    >
                        <SlidersHorizontal className="w-4 h-4 text-violet-400" />
                        <span>{SORT_OPTIONS.find((o) => o.value === sortBy)?.label}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isSortOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-[#111827] border border-white/10 rounded-xl shadow-2xl shadow-black/80 py-1 z-20">
                                {SORT_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setSortBy(option.value);
                                            setIsSortOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${sortBy === option.value
                                            ? 'bg-violet-500/20 text-violet-300'
                                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Product count */}
                <div className="text-sm text-gray-500 self-center whitespace-nowrap">
                    {displayProducts.length} product{displayProducts.length !== 1 ? 's' : ''}
                </div>
            </motion.div>

            {/* Loading */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                    <p className="text-gray-400 text-sm">Loading {meta.title.toLowerCase()}...</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="text-center py-20">
                    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-6 py-4 inline-block">{error}</p>
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && displayProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Package className="w-12 h-12 text-gray-600" />
                    <p className="text-gray-400">
                        {searchQuery ? `No results for "${searchQuery}"` : `No ${meta.title.toLowerCase()} available`}
                    </p>
                </div>
            )}

            {/* Product Grid */}
            {!loading && !error && displayProducts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayProducts.map((product, i) => (
                        <ProductCard key={product.id} product={product} index={i} />
                    ))}
                </div>
            )}
        </div>
    );
}
