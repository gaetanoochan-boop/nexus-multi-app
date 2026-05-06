import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useCart } from '../../context/CartContext';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export default function CartPage() {
  const { items, removeFromCart, updateQuantity } = useCart();
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const snap = await getDocs(collection(db, 'products'));
      const productMap: Record<string, Product> = {};
      snap.docs.forEach(doc => {
        productMap[doc.id] = { id: doc.id, ...doc.data() } as Product;
      });
      setProducts(productMap);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const cartDetails = items.map(item => ({
    ...item,
    info: products[item.productId]
  })).filter(item => item.info);

  const subtotal = cartDetails.reduce((acc, item) => acc + (item.info.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 15;
  const total = subtotal + shipping;

  if (loading) return <div className="max-w-4xl mx-auto p-12 text-center text-gray-500">Loading cart...</div>;

  if (cartDetails.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-20 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/store" className="bg-indigo-600 text-white px-8 py-3 rounded-full font-medium hover:bg-indigo-700 transition-colors">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-12">Your Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-8">
          {cartDetails.map((item) => (
            <div key={item.productId} className="flex gap-6 pb-8 border-b border-gray-100 group">
              <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden shrink-0">
                <img src={item.info.imageUrl} alt={item.info.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{item.info.name}</h3>
                    <p className="text-indigo-600 font-bold">${item.info.price}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-gray-100 rounded-lg px-2">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-2 text-gray-500 hover:text-gray-900 transition-colors"><Minus className="w-3 h-3" /></button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-2 text-gray-500 hover:text-gray-900 transition-colors"><Plus className="w-3 h-3" /></button>
                  </div>
                  <p className="text-sm font-medium text-gray-400">Total: ${(item.info.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-[2rem] p-8 h-fit lg:sticky lg:top-24">
          <h2 className="text-xl font-bold mb-6">Order Summary</h2>
          <div className="space-y-4 text-sm mb-8">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className="font-bold">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="h-px bg-gray-200 my-4" />
            <div className="flex justify-between text-lg">
              <span className="font-bold">Total</span>
              <span className="font-bold text-indigo-600">${total.toFixed(2)}</span>
            </div>
          </div>
          <Link to="/store/checkout" className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 group">
            Proceed to Checkout
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-4 text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">Secure SSL Encrypted Checkout</p>
        </div>
      </div>
    </div>
  );
}
