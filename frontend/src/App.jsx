import React, { useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider, CartContext } from "./context/CartContext";
import Navbar from "./components/Navbar";
import ChatAssistant from "./components/ChatAssistant";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
function AppContent() {
  const { cart } = useContext(CartContext);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-sky-900 bg-fixed text-white selection:bg-cyan-500/30 font-sans">
      <Navbar cartCount={cartCount} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>

      <ChatAssistant />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </CartProvider>
  );
}
