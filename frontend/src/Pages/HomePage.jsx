import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="pt-32 px-4 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col items-center justify-center text-center mt-20">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6 shadow-lg shadow-violet-500/10"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Keyboard Configurator</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50"
        >
          Craft Your Perfect <br /> Desktop Setup
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-400 max-w-2xl mb-10"
        >
          Don't know where to start? Click the AI Assistant in the bottom right corner to build a custom Desktop setup tailored to your exact sound, feel, and aesthetic preferences.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link to="/cart" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-colors shadow-xl shadow-white/10 group">
            View My Cart
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

      </div>
    </div>
  );
}