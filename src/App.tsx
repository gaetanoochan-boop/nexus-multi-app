import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Layout } from 'lucide-react';

// Lazy load apps ideally, but for now just components
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PortfolioHome from './pages/portfolio/PortfolioHome';
import AdminDashboard from './pages/portfolio/AdminDashboard';
import StoreHome from './pages/store/StoreHome';
import CartPage from './pages/store/CartPage';
import CheckoutPage from './pages/store/CheckoutPage';

function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();

  const isPortfolio = location.pathname.startsWith('/portfolio') || location.pathname === '/';
  const isStore = location.pathname.startsWith('/store');

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <Layout className="w-6 h-6 text-indigo-600" />
          Nexus
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/portfolio" className={cn("transition-colors", isPortfolio ? "text-indigo-600" : "text-gray-500 hover:text-gray-900")}>Portfolio</Link>
          <Link to="/store" className={cn("transition-colors", isStore ? "text-indigo-600" : "text-gray-500 hover:text-gray-900")}>Store</Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            {isAdmin && (
              <Link to="/portfolio/admin" className="text-sm font-medium text-amber-600 hover:text-amber-700">Admin</Link>
            )}
            <button onClick={signOut} className="text-sm font-medium text-gray-500 hover:text-gray-900">Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900">Login</Link>
            <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}

import { cn } from './lib/utils';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-indigo-100">
            <Navbar />
            <main>
              <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Portfolio Routes */}
                <Route path="/" element={<PortfolioHome />} />
                <Route path="/portfolio" element={<PortfolioHome />} />
                <Route path="/portfolio/admin" element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                {/* Store Routes */}
                <Route path="/store" element={<StoreHome />} />
                <Route path="/store/cart" element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                } />
                <Route path="/store/checkout" element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
