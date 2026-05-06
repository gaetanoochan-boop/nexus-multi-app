import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Plus, Trash2, Edit3, MessageSquare, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  tags: string[];
}

interface Submission {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'projects' | 'submissions' | 'store'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  async function fetchData() {
    setIsLoading(true);
    let path = '';
    if (activeTab === 'projects') path = 'projects';
    else if (activeTab === 'submissions') path = 'submissions';
    else path = 'products';

    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (activeTab === 'projects') {
        setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
      } else if (activeTab === 'submissions') {
        setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission)));
      } else {
        setStoreProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const path = activeTab === 'projects' ? 'projects' : 'products';
    try {
      const data: any = {
        createdAt: new Date().toISOString()
      };

      if (activeTab === 'projects') {
        Object.assign(data, {
          title,
          description,
          imageUrl,
          link,
          tags: tags.split(',').map(t => t.trim()),
        });
      } else {
        Object.assign(data, {
          name: title,
          description,
          imageUrl,
          price: parseFloat(link) || 0,
          category: tags || 'Uncategorized'
        });
      }

      await addDoc(collection(db, path), data);
      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const pathName = activeTab === 'projects' ? 'projects' : 'products';
    const path = `${pathName}/${id}`;
    try {
      await deleteDoc(doc(db, pathName, id));
      fetchData();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImageUrl('');
    setLink('');
    setTags('');
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-gray-500">Manage your portfolio and view messages.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('projects')}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all", activeTab === 'projects' ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-900")}
          >
            <Briefcase className="w-4 h-4" /> Projects
          </button>
          <button
            onClick={() => setActiveTab('store')}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all", activeTab === 'store' ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-900")}
          >
            <ShoppingCart className="w-4 h-4" /> Products
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all", activeTab === 'submissions' ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-900")}
          >
            <MessageSquare className="w-4 h-4" /> Submissions
          </button>
        </div>
      </div>

      {activeTab === 'projects' || activeTab === 'store' ? (
        <div>
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> {activeTab === 'projects' ? 'Add Project' : 'Add Product'}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {(activeTab === 'projects' ? projects : storeProducts).map(item => (
              <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between gap-6 shadow-sm hover:border-indigo-100 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{item.title || item.name} {activeTab === 'store' && <span className="text-sm font-normal text-indigo-600 opacity-60 ml-2">${item.price}</span>}</h3>
                    <p className="text-gray-500 text-sm line-clamp-1">{item.description}</p>
                    <div className="flex gap-2 mt-2">
                       {activeTab === 'projects' 
                        ? (item as Project).tags.map(t => <span key={t} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold uppercase">{t}</span>)
                        : <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold uppercase">{item.category}</span>
                       }
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><Edit3 className="w-5 h-5" /></button>
                  <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
            {(activeTab === 'projects' ? projects : storeProducts).length === 0 && !isLoading && (
              <div className="text-center py-20 text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                No items found.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
           {submissions.map(msg => (
             <div key={msg.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{msg.name}</h3>
                    <p className="text-sm text-indigo-600">{msg.email}</p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">{msg.message}</p>
             </div>
           ))}
           {submissions.length === 0 && !isLoading && (
              <div className="text-center py-20 text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                No messages found.
              </div>
            )}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white w-full max-w-lg rounded-[2rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <h2 className="text-2xl font-bold mb-6">{activeTab === 'projects' ? 'New Project' : 'New Product'}</h2>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{activeTab === 'projects' ? 'Title' : 'Name'}</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input required value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{activeTab === 'projects' ? 'Live Link' : 'Price'}</label>
                <input required value={link} onChange={e => setLink(e.target.value)} className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" type={activeTab === 'projects' ? 'text' : 'number'} step="0.01" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{activeTab === 'projects' ? 'Tags (comma separated)' : 'Category'}</label>
                <input value={tags} onChange={e => setTags(e.target.value)} className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder={activeTab === 'projects' ? "React, Node.js, Firebase" : "Audio, Electronics, etc."} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 rounded-xl font-medium text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
                  {activeTab === 'projects' ? 'Create Project' : 'Create Product'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

import { cn } from '../../lib/utils';
import { ShoppingCart } from 'lucide-react';
