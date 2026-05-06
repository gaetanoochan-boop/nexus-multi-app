import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface Product {
  id: string;
  name: string;
  price: number;
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, clearCart } = useCart();
  const [complete, setComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProducts() {
      const snap = await getDocs(collection(db, 'products'));
      const productMap: Record<string, Product> = {};
      snap.docs.forEach(doc => {
        productMap[doc.id] = { id: doc.id, ...doc.data() } as Product;
      });
      setProducts(productMap);
    }
    fetchProducts();
  }, []);

  const total = items.reduce((acc, item) => acc + (products[item.productId]?.price || 0) * item.quantity, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      await addDoc(collection(db, 'orders'), {
        userId: user?.uid,
        items,
        total,
        status: 'completed',
        createdAt: new Date().toISOString()
      });
      await clearCart();
      setComplete(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (complete) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <motion.div
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </motion.div>
        <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
        <p className="text-gray-500 mb-8">Thank you for your purchase. We've received your order and are processing it.</p>
        <button onClick={() => navigate('/store')} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-medium hover:bg-indigo-700">Back to Shop</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-12 text-center">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-bold mb-6">Shipping Details</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm text-gray-500 mb-1">First Name</label>
                  <input className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" defaultValue="John" />
               </div>
               <div>
                  <label className="block text-sm text-gray-500 mb-1">Last Name</label>
                  <input className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" defaultValue="Doe" />
               </div>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Address</label>
              <input className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="123 Street Name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm text-gray-500 mb-1">City</label>
                  <input className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
               </div>
               <div>
                  <label className="block text-sm text-gray-500 mb-1">Zip Code</label>
                  <input className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
               </div>
            </div>
          </form>
        </div>

        <div className="bg-gray-50 rounded-[2rem] p-8 h-fit">
          <h2 className="text-xl font-bold mb-6">Payment</h2>
          <div className="space-y-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <CreditCard className="w-5 h-5 text-indigo-600" />
                 <span className="text-sm font-medium">Card ending in 4242</span>
              </div>
              <span className="text-[10px] font-bold text-gray-400">DEFAULT</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-4 border-t border-gray-200">
               <span>Total to Pay</span>
               <span className="text-indigo-600">${total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={isProcessing || items.length === 0}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-colors shadow-lg disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Complete Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
