import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Star, Plus, Check, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'sample-1',
    name: "Aether Headphones",
    description: "Premium noise-cancelling wireless headphones with 40h battery life.",
    price: 299.99,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=2070",
    category: "Audio"
  },
  {
    id: 'sample-2',
    name: "Lumina Keycap Set",
    description: "Custom PBT mechanical keycaps with vibrant dyesub legends.",
    price: 89.99,
    imageUrl: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=2070",
    category: "Accessories"
  },
  {
    id: 'sample-3',
    name: "Zenith Desk Mat",
    description: "Minimalist felt desk mat for ultimate ergonomics and style.",
    price: 45.00,
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2070",
    category: "Home Office"
  },
  {
    id: 'sample-4',
    name: "Orbit Power Bank",
    description: "Ultra-fast 20,000mAh portable charger with USB-C PD.",
    price: 79.99,
    imageUrl: "https://images.unsplash.com/photo-1618410320928-25228d811631?auto=format&fit=crop&q=80&w=2070",
    category: "Electronics"
  }
];

export default function StoreHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const { items, addToCart } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      const path = 'products';
      try {
        const q = query(collection(db, path));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        
        // Merge defaults if database is missing them (by name)
        const mergedProducts = [...data];
        DEFAULT_PRODUCTS.forEach(def => {
          if (!mergedProducts.some(p => p.name === def.name)) {
            mergedProducts.push(def);
          }
        });
        
        setProducts(mergedProducts);
      } catch (error) {
        setProducts(DEFAULT_PRODUCTS);
        console.error('Using fallback products due to:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [isAdmin]);

  const handleAddToCart = async (id: string) => {
    await addToCart(id);
    setAddedId(id);
    setTimeout(() => setAddedId(null), 2000);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalValue = items.reduce((acc, item) => {
    const product = products.find(p => p.id === item.productId);
    return acc + (product ? product.price * item.quantity : 0);
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-end justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Nexus Store</h1>
          <p className="text-gray-500">Curated hardware and accessories for creators.</p>
        </div>
        <Link to="/store/cart" className="relative group flex items-center gap-4 bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Total Cart</span>
            <span className="font-bold tracking-tight">${totalValue.toFixed(2)}</span>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-900 font-bold">
                {totalItems}
              </span>
            )}
          </div>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[4/5] bg-gray-100 rounded-3xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => {
            const cartItem = items.find(item => item.productId === product.id);
            return (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="group"
              >
                <div className="aspect-[4/5] bg-gray-100 rounded-3xl overflow-hidden mb-6 relative">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                  
                  {/* Price Label Widget */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-xl flex flex-col items-end border border-white/20">
                    <span className="text-[10px] uppercase tracking-widest font-black text-indigo-600/50 leading-none mb-1">Price</span>
                    <span className="text-lg font-black tracking-tighter text-gray-900">${product.price}</span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="absolute bottom-4 right-4 bg-gray-900 text-white p-3 rounded-2xl shadow-xl hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-2 group/btn"
                  >
                    <AnimatePresence mode="wait">
                      {addedId === product.id ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Check className="w-6 h-6 text-green-600" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="plus"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Plus className="w-5 h-5 text-white" />
                          {cartItem && cartItem.quantity > 0 && (
                            <span className="text-sm font-bold text-white pr-1">{cartItem.quantity} In Cart</span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>

                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                     <span className="bg-white/80 backdrop-blur-md text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-sm">
                        {product.category}
                     </span>
                     {cartItem && cartItem.quantity > 0 && (
                       <motion.span 
                         initial={{ x: -20, opacity: 0 }}
                         animate={{ x: 0, opacity: 1 }}
                         className="bg-indigo-600 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-lg"
                       >
                         {cartItem.quantity} Selected
                       </motion.span>
                     )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
                    <p className="font-black text-lg text-indigo-600">${product.price}</p>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{product.description}</p>
                  <div className="flex items-center gap-1 mt-1 text-amber-400">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-xs font-bold text-gray-900 leading-none">4.9</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {products.length === 0 && !loading && (
            <div className="col-span-full text-center py-20 border border-dashed border-gray-200 rounded-[2rem] bg-gray-50/50">
              <Layout className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No products found. {isAdmin ? 'Seeding data...' : 'Waiting for products to be added.'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
