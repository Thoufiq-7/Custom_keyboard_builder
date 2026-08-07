import React, { useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider, CartContext } from "./context/CartContext";
import Navbar from "./Components/Navbar";
import ChatAssistant from "./Components/ChatAssistant";
import HomePage from "./Pages/HomePage";
import CartPage from "./Pages/CartPage";
import KeyboardsPage from './Pages/KeyboardsPage';
import MousePage from './Pages/MousePage';
import DesktopMatsPage from './Pages/DesktopMatsPage';
import CablesPage from './Pages/CablesPage';

function AppContent() {
  const { cart } = useContext(CartContext);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-sky-900 bg-fixed text-white selection:bg-cyan-500/30 font-sans">
      <Navbar cartCount={cartCount} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/keyboards" element={<KeyboardsPage />} />
        <Route path="/mouse" element={<MousePage />} />
        <Route path="/desktop_mats" element={<DesktopMatsPage />} />
        <Route path="/cables" element={<CablesPage />} />
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
